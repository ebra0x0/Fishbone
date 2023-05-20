import React, { useCallback, useEffect, useState, memo } from "react";
import { View, Text, FlatList, Image, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useDispatch, useSelector } from "react-redux";
import ScreenHeader from "../../../Components/ScreenHeader/ScreenHeader";
import styles from "./styles";
import Translations from "../../../Languages";
import { Toast } from "native-base";
import Animated, { runOnJS, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import Avatar from "../../../Components/Avatar/Avatar";
import TOAST from "../../../Components/Toast/Toast";

const Favorites = ({ navigation }) => {
    const Styles = styles();
    const { theme, favorites } = useSelector((state) => state.user);
    const [FAVORITES, setFavorites] = useState(favorites);
    const [pressedItem, setPressedItem] = useState(null);
    const opacity = useSharedValue(1);
    const scale = useSharedValue(1);

    const dispatch = useDispatch();

    useEffect(() => {
        setFavorites(favorites);
    }, [favorites]);

    const AnimStyle = useAnimatedStyle(() => {
        return {
            opacity: opacity.value,
            transform: [{ scale: scale.value }],
        };
    });
    const onDisFavEnd = useCallback(() => {
        const targetFav = FAVORITES.find((fav) => fav.id === pressedItem);
        const newFavs = FAVORITES.filter((fav) => fav.id !== pressedItem);
        dispatch({ type: "userData/Del_Favorites", payload: [targetFav] });
        dispatch({ type: "userData/Set_Favorites", payload: newFavs });
        setPressedItem(null);
    });
    const onDisAllEnd = useCallback(() => {
        dispatch({ type: "userData/Del_Favorites", payload: FAVORITES });
        dispatch({ type: "userData/Set_Favorites", payload: [] });
        Toast.show({
            render: () => {
                return <TOAST status="success" msg="All favorites removed" />;
            },
            duration: 3000,
        });
    });
    useEffect(() => {
        if (pressedItem !== null && pressedItem !== "all") {
            opacity.value = 1;
            scale.value = 1;
            opacity.value = withTiming(0);
            scale.value = withTiming(0, {}, (end) => {
                if (end) {
                    runOnJS(onDisFavEnd)();
                }
            });
        }
    }, [pressedItem]);

    const Dis_Fav = (id) => {
        setPressedItem(id);
    };

    const Dis_All = () => {
        setPressedItem("all");
        opacity.value = withTiming(0);
        scale.value = withTiming(0, {}, (end) => {
            if (end) {
                runOnJS(onDisAllEnd)();
            }
        });
    };

    const renderFav = ({ item }) => {
        return (
            <View style={Styles.wrapper}>
                <Animated.View
                    style={[
                        Styles.row,
                        pressedItem === item.id ? AnimStyle : pressedItem === "all" ? AnimStyle : false,
                    ]}
                >
                    <View style={{ flex: 1, flexDirection: "row" }}>
                        <Avatar profile={{ data: item }} style={Styles.avatar} />
                        <Text style={{ fontSize: 16, color: theme ? "#fff" : "#252525", marginLeft: 6 }}>
                            {item.Name}
                        </Text>
                    </View>
                    <TouchableOpacity
                        style={{ alignSelf: "center" }}
                        onPress={() => Dis_Fav(item.id, item.id)}
                    >
                        <Ionicons name="heart" size={30} color="#FF2763" />
                    </TouchableOpacity>
                </Animated.View>
            </View>
        );
    };

    const HeaderTitle = Translations().t("favsTitle");

    const Buttons = [
        {
            show: FAVORITES.length ? true : false,
            key: 1,
            name: "heart-dislike-outline",
            size: 30,
            color: "#dd4c35",
            fun: () => Dis_All(),
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
            {FAVORITES !== null && <ScreenHeader arrow={true} title={HeaderTitle} btns={HeaderButtons} />}

            {FAVORITES?.length ? (
                <FlatList
                    style={{ paddingTop: 10 }}
                    data={FAVORITES}
                    renderItem={renderFav}
                    keyExtractor={(item) => item.id}
                    showsVerticalScrollIndicator={false}
                />
            ) : (
                <View style={{ flex: 1, justifyContent: "center", alignItems: "center", marginBottom: 30 }}>
                    <Image
                        style={{ width: 100, height: 100, marginBottom: 10, opacity: 0.7 }}
                        source={require("../../../../assets/brokenHeart.png")}
                    />
                </View>
            )}
        </View>
    );
};
export default memo(Favorites);
