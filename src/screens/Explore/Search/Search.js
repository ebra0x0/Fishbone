import React, { useEffect, useState, memo } from "react";
import { View, Text, FlatList, TouchableOpacity, Dimensions, ActivityIndicator } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import Animated, { useAnimatedStyle, useSharedValue, withSpring, withTiming } from "react-native-reanimated";
import styles from "./styles";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import Translations from "../../../Languages";
import SearchBar from "../../../Components/SearchBar/SearchBar";
import ScreenHeader from "../../../Components/ScreenHeader/ScreenHeader";
import Avatar from "../../../Components/Avatar/Avatar";
import SendOrder from "../../../Components/SendOrder";
import firestore from "@react-native-firebase/firestore";

const Search = () => {
    const Styles = styles();
    const { lang, data, PendingOrder, favorites } = useSelector((state) => state.user);
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loadingBtn, setLoadingBtn] = useState(false);
    const [searchType, setSearchType] = useState("food");

    const navigation = useNavigation();
    const ScreenX = Dimensions.get("screen").width;
    const _AntMove = useSharedValue(0);
    const _AntScale = useSharedValue(1);
    const _AntHeight = useSharedValue(2);
    const AnimStyle = useAnimatedStyle(() => {
        return {
            width: ScreenX / 2,
            height: _AntHeight.value,
            borderRadius: 10,
            transform: [{ translateX: _AntMove.value }, { scale: _AntScale.value }],
        };
    });

    const CONTENT = {
        ExpiresAt: Translations().t("ExpiresAt"),
        searchFound: Translations().t("searchFound"),
        searchResult: Translations().t("searchResult"),
        serachFood: Translations().t("serachFood"),
        searchResaurant: Translations().t("searchResaurant"),
    };

    const dispatch = useDispatch();

    useEffect(() => {
        setResults([]);
        searchType === "food" && AnimateTo(0);
        searchType === "restaurant" && AnimateTo(ScreenX / 2);
    }, [searchType]);

    const AnimateTo = (value) => {
        _AntScale.value = withTiming(0.5, { duration: 100 }, (end) => {
            if (end) {
                _AntScale.value = withTiming(1);
            }
        });
        _AntHeight.value = withTiming(5, { duration: 150 }, (end) => {
            if (end) {
                _AntHeight.value = withTiming(2);
            }
        });
        _AntMove.value = withSpring(value, { mass: 0.5, damping: 10 });
    };
    const Fav_Detector = (source) => {
        let isFav = null;
        if (favorites.length) {
            favorites.forEach((fav, indx) => {
                fav.id === source
                    ? (isFav = true)
                    : indx + 1 === favorites.length && isFav === null && (isFav = false);
            });
        } else {
            isFav = false;
        }
        return isFav !== null && isFav;
    };
    const Toggle_Fav = (item, isFav) => {
        try {
            const favData = {
                ...item,
                fav: isFav,
            };
            if (isFav) {
                const targetFav = favorites.find((fav) => fav.id === item.id);
                const newFavs = favorites.filter((fav) => fav.id !== item.id);

                dispatch({ type: "userData/Del_Favorites", payload: [targetFav] });
                dispatch({ type: "userData/Set_Favorites", payload: newFavs });
            } else {
                const favReq = {
                    id: item.id,
                };

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
    const __Get_Elapsed__ = (date) => {
        if (date) {
            const Timestamp = firestore.Timestamp.now();
            const currDate = new Date(Timestamp.toDate());
            const start = new Date(date?.toDate());
            const elapsedTime = currDate - start;

            const s = parseInt(elapsedTime / 1000);
            const m = parseInt(elapsedTime / (1000 * 60));
            const h = parseInt(elapsedTime / (1000 * 60 * 60));
            const d = parseInt(elapsedTime / (1000 * 60 * 60 * 24));

            if (s < 60) {
                if (s < 5) {
                    return "Just now";
                }
                return s + (lang === "en" ? "s" : "ث");
            } else if (m < 60) {
                return m + (lang === "en" ? "m" : "د");
            } else if (h < 24) {
                return h + (lang === "en" ? "h" : "س");
            } else {
                return d + (lang === "en" ? "d" : "ي");
            }
        } else {
            return "";
        }
    };
    const Remove_Pending_Order = async (id) => {
        try {
            const $UsersRef = firestore().collection("users");
            //Remove order from restaurant
            await $UsersRef.doc(id).collection("orders").doc(PendingOrder.id).delete();

            // Remove order from local orders
            await $UsersRef.doc(data?.id).collection("orders").doc(PendingOrder.id).delete();
        } catch (e) {
            console.log(e);
        }
    };
    const renderFoodItems = ({ item }) => {
        const { id, key, Name, foodType, date, expiresAt } = item;
        const isFav = Fav_Detector(id);

        return (
            <TouchableOpacity style={Styles.row} onPress={() => navigation.navigate("PostInfo", item)}>
                <View style={{ flex: 1 }}>
                    <Avatar
                        profile={{ data: { id: item.id, photo: item.photo, Name: item.Name } }}
                        style={Styles.avatar}
                    />
                </View>

                <View style={Styles.contentWrapper}>
                    <View style={Styles.content}>
                        <View>
                            <Text style={Styles.name}>{foodType}</Text>
                            <Text style={Styles.author}>{Name}</Text>
                        </View>

                        <View>
                            <Text style={Styles.expDate}>
                                {CONTENT.ExpiresAt}{" "}
                                <Text style={{ color: "#FF2763", fontWeight: "bold" }}>
                                    {expiresAt?.toDate().toLocaleTimeString().slice(0, -6)}{" "}
                                    {expiresAt?.toDate().toLocaleTimeString().slice(-2)}
                                </Text>
                            </Text>
                        </View>

                        <View style={{ flexDirection: "row", alignItems: "center" }}>
                            <Ionicons name="time-outline" size={12} color="#1785f5" />
                            <Text style={Styles.date}>{__Get_Elapsed__(date)}</Text>
                        </View>
                    </View>
                    <View style={Styles.btnWrapper}>
                        <TouchableOpacity style={Styles.btn} onPress={() => Toggle_Fav(item, isFav)}>
                            <MaterialCommunityIcons
                                name={isFav ? "heart" : "heart-outline"}
                                size={25}
                                color={"#FF2763"}
                            />
                        </TouchableOpacity>

                        {!PendingOrder ? (
                            <TouchableOpacity
                                style={[Styles.btn, { backgroundColor: "#0dbc7933" }]}
                                onPress={() =>
                                    SendOrder({
                                        item: {
                                            source: data?.id,
                                            dest: id,
                                            key: key,
                                            Name: data?.Name,
                                            Token: data?.Token,
                                            photo: data?.photo,
                                            expiresAt: expiresAt.toDate(),
                                        },
                                        loading: setLoadingBtn,
                                    })
                                }
                            >
                                {loadingBtn ? (
                                    <ActivityIndicator size={25} color="#0dbc79" />
                                ) : (
                                    <MaterialCommunityIcons name="send-outline" size={20} color={"#0dbc79"} />
                                )}
                            </TouchableOpacity>
                        ) : (
                            PendingOrder?.postId == key && (
                                <TouchableOpacity
                                    style={[Styles.btn, { backgroundColor: "#ff276333" }]}
                                    onPress={() => Remove_Pending_Order(id)}
                                >
                                    <Ionicons name="close" size={25} color="#FF2763" />
                                </TouchableOpacity>
                            )
                        )}
                    </View>
                </View>
            </TouchableOpacity>
        );
    };
    const renderRestaurantItems = ({ item }) => {
        const isFav = Fav_Detector(item.id);
        return (
            <TouchableOpacity
                style={Styles.row}
                onPress={() =>
                    navigation.navigate("OpenProfile", { id: item.id, photo: item.photo, Name: item.Name })
                }
            >
                <View style={{ flex: 1 }}>
                    <Avatar
                        profile={{ data: { id: item.id, photo: item.photo, Name: item.Name } }}
                        style={Styles.avatar}
                    />
                </View>

                <View style={Styles.contentWrapper}>
                    <View style={[Styles.content, { flex: 2, justifyContent: "flex-start" }]}>
                        <Text style={Styles.name}>{item.Name}</Text>
                        <Text style={Styles.address}>{item.address}</Text>
                    </View>

                    <View style={Styles.btnWrapper}>
                        <TouchableOpacity style={Styles.btn} onPress={() => Toggle_Fav(item, isFav)}>
                            <MaterialCommunityIcons
                                name={isFav ? "heart" : "heart-outline"}
                                size={30}
                                color="#FF2763"
                            />
                        </TouchableOpacity>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <View style={Styles.container}>
            <ScreenHeader
                arrow={true}
                component={<SearchBar update={setResults} loading={setLoading} searchType={searchType} />}
                style={{ elevation: 0 }}
            />

            <View style={Styles.foodTypeWrapper}>
                {results.length ? (
                    <Text
                        style={{
                            color: "#a0a0a0",
                            paddingHorizontal: 20,
                        }}
                    >
                        {CONTENT.searchFound}{" "}
                        <Text style={{ color: "#1785f5", fontWeight: "bold" }}>{results?.length}</Text>{" "}
                        {CONTENT.searchResult}
                    </Text>
                ) : (
                    false
                )}

                <View
                    style={{
                        flexDirection: "row",
                        height: 60,
                    }}
                >
                    <TouchableOpacity style={Styles.foodTypeBtn} onPress={() => setSearchType("food")}>
                        <Text style={[Styles.foodTypeTxt, searchType === "food" && { color: "#00b0ff" }]}>
                            {CONTENT.serachFood}
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={Styles.foodTypeBtn} onPress={() => setSearchType("restaurant")}>
                        <Text
                            style={[Styles.foodTypeTxt, searchType === "restaurant" && { color: "#00b0ff" }]}
                        >
                            {CONTENT.searchResaurant}
                        </Text>
                    </TouchableOpacity>
                    <Animated.View
                        style={[
                            {
                                position: "absolute",
                                bottom: -1,
                                backgroundColor: "#00b0ff",
                            },
                            AnimStyle,
                        ]}
                    />
                </View>
            </View>

            <FlatList
                style={Styles.flatlist}
                data={results}
                renderItem={searchType === "food" ? renderFoodItems : renderRestaurantItems}
                keyExtractor={(item) => item.key}
                showsVerticalScrollIndicator={false}
                ListFooterComponent={() => {
                    return (
                        loading && (
                            <View
                                style={{
                                    flex: 1,
                                    alignItems: "center",
                                    justifyContent: "center",
                                }}
                            >
                                <ActivityIndicator size={30} color={"#1785f5"} />
                            </View>
                        )
                    );
                }}
            />
        </View>
    );
};

export default memo(Search);
