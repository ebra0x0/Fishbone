import { View, Text, TouchableOpacity, Image, ScrollView, ActivityIndicator, Linking } from "react-native";
import React, { useEffect, useState } from "react";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import mapStyle from "../../Components/Map/mapStyle";
import { Ionicons } from "@expo/vector-icons";
import ScreenHeader from "../../Components/ScreenHeader/ScreenHeader";
import GetDirections from "../../Components/GetDirections";
import { useDispatch, useSelector } from "react-redux";
import styles from "./styles";

const OpenProfile = ({ navigation, route }) => {
    const Styles = styles();
    const { data, theme, favorites } = useSelector((state) => state.user);
    const Data = route.params;
    const [isFav, setIsFav] = useState(null);

    const dispatch = useDispatch();

    useEffect(() => {
        Fav_Detector(Data.id);
    }, []);

    const Fav_Detector = (source) => {
        if (favorites.length) {
            favorites.forEach((fav, indx) => {
                if (fav.id === source) {
                    setIsFav(true);
                } else {
                    indx + 1 == favorites.length && isFav == null && setIsFav(false);
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
                const newFavs = [];
                favorites.forEach((fav) => {
                    if (fav.id !== Data.id) {
                        newFavs.push(fav);
                    } else {
                        dispatch({ type: "userData/Del_Favorites", payload: [fav] });
                        dispatch({ type: "userData/Set_Favorites", payload: newFavs });
                        setIsFav(false);
                    }
                });
            } else {
                const favReq = {
                    id: rest.id,
                };
                dispatch({ type: "userData/Update_Favorites", payload: [favReq] });
                setIsFav(true);
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

    const HeaderTitle = (
        <Text
            style={{
                flex: 1,
                marginLeft: 6,
                fontSize: 30,
                color: theme ? "#fff" : "#252525",
                fontWeight: "bold",
            }}
        >
            {Data.Name}
        </Text>
    );
    const Buttons = [
        {
            show: !data?.restaurant ? true : false,
            key: 1,
            name: isFav ? "heart" : "heart-outline",
            size: 30,
            color: isFav ? "#0dbc79" : theme ? "#fff" : "#252525",
            fun: Toggle_Fav,
        },
    ];

    const HeaderButtons = Buttons.map((btn) => {
        if (btn.show) {
            return (
                <TouchableOpacity style={{ marginLeft: 15 }} key={btn.key} onPress={() => btn.fun()}>
                    <Ionicons name={btn.name} size={btn.size} color={btn.color} />
                </TouchableOpacity>
            );
        }
    });

    return (
        <View style={Styles.container}>
            {isFav !== null && (
                <ScreenHeader arrow={() => navigation.goBack()} title={HeaderTitle} btns={HeaderButtons} />
            )}

            <ScrollView>
                <View
                    style={{
                        justifyContent: "center",
                        alignItems: "center",
                    }}
                >
                    {Data.photo ? (
                        <Image style={Styles.avatar} source={{ uri: Data.photo }} />
                    ) : (
                        <View style={Styles.avatar}>
                            <Ionicons name="person" size={60} color="#cfcfcf" />
                        </View>
                    )}
                </View>

                <View style={Styles.wrapper}>
                    <View style={Styles.row}>
                        <Ionicons
                            style={Styles.label}
                            name="compass-outline"
                            size={25}
                            color={theme ? "#1f5eab" : "#1785f5"}
                        />
                        <Text style={Styles.txtRows} selectable={true}>
                            {Data.address}
                        </Text>
                    </View>
                    <View style={Styles.row}>
                        <Ionicons
                            style={Styles.label}
                            name="call-outline"
                            size={23}
                            color={theme ? "#1f5eab" : "#1785f5"}
                        />
                        <Text style={Styles.txtRows} selectable={true}>
                            {Data.phone}
                        </Text>
                    </View>

                    <View style={Styles.row}>
                        <Ionicons
                            style={Styles.label}
                            name="mail-outline"
                            size={23}
                            color={theme ? "#1f5eab" : "#1785f5"}
                        />
                        <Text style={Styles.txtRows} selectable={true}>
                            {Data.email}
                        </Text>
                    </View>

                    <View
                        style={{
                            marginVertical: 30,
                            borderRadius: 10,
                            overflow: "hidden",
                        }}
                    >
                        {Data.location ? (
                            <MapView
                                style={{ height: 140, backgroundColor: "#1e1e1e" }}
                                region={Data.location}
                                provider={PROVIDER_GOOGLE}
                                customMapStyle={mapStyle}
                            >
                                <Marker coordinate={Data.location}>
                                    <Ionicons name="location" size={50} color="#18ad79" />
                                </Marker>
                            </MapView>
                        ) : (
                            <View style={Styles.mapView}>
                                <ActivityIndicator size={50} color="#1785f5" />
                            </View>
                        )}
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
                            {Data?.social.fb && (
                                <TouchableOpacity
                                    style={{ flex: 1, alignItems: "center" }}
                                    onPress={() => Open_Social("fb")}
                                >
                                    <Ionicons
                                        name="logo-facebook"
                                        size={25}
                                        color={theme ? "#fff" : "#3e3e3e"}
                                    />
                                </TouchableOpacity>
                            )}
                            {Data?.social.tw && (
                                <TouchableOpacity
                                    style={{ flex: 1, alignItems: "center" }}
                                    onPress={() => Open_Social("tw")}
                                >
                                    <Ionicons
                                        name="logo-twitter"
                                        size={25}
                                        color={theme ? "#fff" : "#3e3e3e"}
                                    />
                                </TouchableOpacity>
                            )}
                            {Data?.social.inst && (
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

                            {Data?.social.web && (
                                <TouchableOpacity
                                    style={{ flex: 1, alignItems: "center" }}
                                    onPress={() => Open_Social("web")}
                                >
                                    <Ionicons
                                        name="globe-outline"
                                        size={25}
                                        color={theme ? "#fff" : "#3e3e3e"}
                                    />
                                </TouchableOpacity>
                            )}
                        </View>
                    )}
                </View>
            </ScrollView>
        </View>
    );
};

export default OpenProfile;
