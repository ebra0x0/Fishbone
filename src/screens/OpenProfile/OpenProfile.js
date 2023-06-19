import React, { useEffect, useState, memo } from "react";
import { View, Text, TouchableOpacity, Linking } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import styles from "./styles";
import mapStyle from "../../Components/Map/mapStyle";
import ScreenHeader from "../../Components/ScreenHeader/ScreenHeader";
import Avatar from "../../Components/Avatar/Avatar";
import GetDirections from "../../Components/GetDirections";
import firestore from "@react-native-firebase/firestore";
import { Skeleton } from "native-base";
import { Image } from "react-native";

const OpenProfile = ({ route }) => {
    const Styles = styles();
    const { data, theme, favorites } = useSelector((state) => state.user);
    const [Data, setData] = useState({
        Name: "",
        address: "",
        phone: "",
        photo: "",
        email: "",
        location: null,
    });
    const [isFav, setIsFav] = useState(null);
    const _AnimScale = useSharedValue(1);
    const AnimStyle = useAnimatedStyle(() => {
        return {
            transform: [{ scale: _AnimScale.value }],
        };
    });

    const dispatch = useDispatch();

    useEffect(() => {
        FetchUserData(route.params.id);
    }, []);
    useEffect(() => {
        Data.id && Fav_Detector(Data.id);
    }, [Data]);
    useEffect(() => {
        if (isFav) {
            _AnimScale.value = withSpring(0.7, {}, (end) => {
                if (end) {
                    _AnimScale.value = withSpring(1, { mass: 0.4, damping: 2 });
                }
            });
        }
    }, [isFav]);

    const FetchUserData = async (id) => {
        const UserData = (await firestore().collection("users").doc(id).get()).data();

        setData(UserData);
    };
    const Fav_Detector = (source) => {
        if (favorites.length) {
            let done = false;

            favorites.forEach((fav, indx) => {
                if (fav.id === source) {
                    setIsFav(true);
                    done = true;
                } else if (!done && indx + 1 === favorites.length) {
                    setIsFav(false);
                }
            });
        } else {
            setIsFav(false);
        }
    };
    const Toggle_Fav = () => {
        try {
            const favData = {
                ...Data,
                fav: isFav,
            };
            if (isFav) {
                setIsFav(false);
                const targetFav = favorites.find((fav) => fav.id === Data.id);
                const newFavs = favorites.filter((fav) => fav.id !== Data.id);

                dispatch({ type: "userData/Del_Favorites", payload: [targetFav] });
                dispatch({ type: "userData/Set_Favorites", payload: newFavs });
            } else {
                const favReq = {
                    id: Data.id,
                };
                setIsFav(true);
                dispatch({ type: "userData/Update_Favorites", payload: [favReq] });
                if (favorites.length) {
                    dispatch({ type: "userData/Set_Favorites", payload: [...favorites, favData] });
                } else {
                    dispatch({ type: "userData/Set_Favorites", payload: [favData] });
                }
            }
        } catch (e) {
            console.log(e);
        }
    };
    const Open_Social = (sc) => {
        const fbUrl = `https://www.facebook.com/${Data.social.fb}`;
        const twUrl = `https://www.twitter.com/ ${Data.social.tw}`;
        const instUrl = `https://www.instagram.com/ ${Data.social.inst}`;
        const webUrl = Data.social.web;

        switch (sc) {
            case "fb":
                Linking.openURL(fbUrl);
                break;
            case "tw":
                Linking.openURL(twUrl);
                break;
            case "inst":
                Linking.openURL(instUrl);
                break;
            case "web":
                Linking.openURL(webUrl);
                break;
        }
    };
    const openPhoneApp = (phone) => {
        Linking.openURL(`tel:${phone}`);
    };
    const openMailApp = (email) => {
        Linking.openURL(`mailto:${email}`);
    };

    const Buttons = [
        {
            show: !data?.restaurant,
            key: 1,
            name: isFav
                ? require("../../../assets/heart-favorite.png")
                : require("../../../assets/heart-outline.png"),
            size: 35,
            fun: Toggle_Fav,
        },
    ];

    const HeaderButtons = Buttons.map((btn) => {
        if (btn.show) {
            return (
                <Animated.View key={btn.key} style={[{ marginLeft: 15 }, AnimStyle]}>
                    <TouchableOpacity onPress={() => btn.fun()}>
                        <Image style={{ width: btn.size, height: btn.size }} source={btn.name} />
                    </TouchableOpacity>
                </Animated.View>
            );
        }
    });

    return (
        <View style={Styles.container}>
            <ScreenHeader arrow={true} title={route.params.Name || Data.Name} btns={HeaderButtons} />

            <View
                style={{
                    justifyContent: "center",
                    alignItems: "center",
                    height: 200,
                }}
            >
                <Skeleton
                    startColor={theme ? "darkBlue.800" : "darkBlue.100"}
                    size="150"
                    rounded="full"
                    isLoaded={route.params.photo || Data.photo}
                >
                    <Avatar
                        profile={{ data: { photo: route.params.photo || Data.photo } }}
                        style={Styles.avatar}
                        disabled={true}
                    />
                </Skeleton>
            </View>

            <View style={Styles.wrapper}>
                <Skeleton
                    style={{ width: "100%", height: 50, marginBottom: 8, borderRadius: 5 }}
                    isLoaded={Data.address}
                    startColor={theme ? "darkBlue.800" : "darkBlue.100"}
                >
                    <TouchableOpacity
                        style={Styles.row}
                        onPress={() => GetDirections(Data.id)}
                        disabled={!Data.id}
                    >
                        <Ionicons
                            style={Styles.label}
                            name="compass-outline"
                            size={25}
                            color={theme ? "#1f5eab" : "#1785f5"}
                        />
                        <Text style={Styles.txtRows} selectable={true}>
                            {Data.address}
                        </Text>
                    </TouchableOpacity>
                </Skeleton>
                <Skeleton
                    style={{ width: "100%", height: 50, marginBottom: 8, borderRadius: 5 }}
                    isLoaded={Data.address}
                    startColor={theme ? "darkBlue.800" : "darkBlue.100"}
                >
                    <TouchableOpacity
                        style={Styles.row}
                        onPress={() => openPhoneApp(Data.phone)}
                        disabled={!Data.phone}
                    >
                        <Ionicons
                            style={Styles.label}
                            name="call-outline"
                            size={23}
                            color={theme ? "#1f5eab" : "#1785f5"}
                        />
                        <Text style={Styles.txtRows} selectable={true}>
                            {Data.phone}
                        </Text>
                    </TouchableOpacity>
                </Skeleton>

                <Skeleton
                    style={{ width: "100%", height: 50, marginBottom: 8, borderRadius: 5 }}
                    isLoaded={Data.address}
                    startColor={theme ? "darkBlue.800" : "darkBlue.100"}
                >
                    <TouchableOpacity
                        style={Styles.row}
                        onPress={() => openMailApp(Data.email)}
                        disabled={!Data.email}
                    >
                        <Ionicons
                            style={Styles.label}
                            name="mail-outline"
                            size={23}
                            color={theme ? "#1f5eab" : "#1785f5"}
                        />
                        <Text style={Styles.txtRows} selectable={true}>
                            {Data.email}
                        </Text>
                    </TouchableOpacity>
                </Skeleton>

                <View style={Styles.mapContainer}>
                    <Skeleton
                        style={{ height: 140 }}
                        isLoaded={Data.location}
                        startColor={theme ? "darkBlue.800" : "darkBlue.100"}
                    >
                        <MapView
                            style={{ height: 140, backgroundColor: "#1e1e1e" }}
                            region={Data.location}
                            provider={PROVIDER_GOOGLE}
                            customMapStyle={mapStyle}
                            loadingEnabled={true}
                            loadingBackgroundColor={Styles.mapView.backgroundColor}
                            loadingIndicatorColor="#1785f5"
                        >
                            <Marker coordinate={Data.location}>
                                <Ionicons name="location" size={50} color="#18ad79" />
                            </Marker>
                        </MapView>
                        <TouchableOpacity
                            style={{
                                position: "absolute",
                                bottom: 6,
                                right: 6,
                                backgroundColor: "#eee",
                                padding: 5,
                                borderRadius: 4,
                            }}
                            activeOpacity={0.8}
                            onPress={() => GetDirections(Data.id)}
                        >
                            <Ionicons name="arrow-redo" size={20} color="#1e1e1e" />
                        </TouchableOpacity>
                    </Skeleton>
                </View>
                {Data.social && (
                    <View
                        style={{
                            flexDirection: "row",
                            alignItems: "center",
                            paddingHorizontal: 70,
                            height: 30,
                        }}
                    >
                        {Data.social.fb && (
                            <TouchableOpacity
                                style={{ flex: 1, alignItems: "center" }}
                                onPress={() => Open_Social("fb")}
                            >
                                <Ionicons name="logo-facebook" size={25} color={theme ? "#fff" : "#3e3e3e"} />
                            </TouchableOpacity>
                        )}
                        {Data.social.tw && (
                            <TouchableOpacity
                                style={{ flex: 1, alignItems: "center" }}
                                onPress={() => Open_Social("tw")}
                            >
                                <Ionicons name="logo-twitter" size={25} color={theme ? "#fff" : "#3e3e3e"} />
                            </TouchableOpacity>
                        )}
                        {Data.social.inst && (
                            <TouchableOpacity
                                style={{ flex: 1, alignItems: "center" }}
                                onPress={() => Open_Social("inst")}
                            >
                                <Ionicons
                                    name="logo-instagram"
                                    size={25}
                                    color={theme ? "#fff" : "#3e3e3e"}
                                />
                            </TouchableOpacity>
                        )}

                        {Data.social.web && (
                            <TouchableOpacity
                                style={{ flex: 1, alignItems: "center" }}
                                onPress={() => Open_Social("web")}
                            >
                                <Ionicons name="globe-outline" size={25} color={theme ? "#fff" : "#3e3e3e"} />
                            </TouchableOpacity>
                        )}
                    </View>
                )}
            </View>
        </View>
    );
};

export default memo(OpenProfile);
