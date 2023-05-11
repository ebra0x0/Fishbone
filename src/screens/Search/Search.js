import React, { useEffect, useState, memo } from "react";
import { View, Text, FlatList, TouchableOpacity, Dimensions } from "react-native";
import SearchBar from "../../Components/SearchBar/SearchBar";
import styles from "./styles";
import ScreenHeader from "../../Components/ScreenHeader/ScreenHeader";
import { ActivityIndicator } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withSpring, withTiming } from "react-native-reanimated";
import { useNavigation } from "@react-navigation/native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useDispatch, useSelector } from "react-redux";
import SendOrder from "../../Components/SendOrder";
import Avatar from "../../Components/Avatar/Avatar";
import Translations from "../../Languages";

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
        ExpiresIn: Translations().t("ExpiresIn"),
        searchFound: Translations().t("searchFound"),
        searchResult: Translations().t("searchResult"),
        serachFood: Translations().t("serachFood"),
        searchResaurant: Translations().t("searchResaurant"),
    };

    const dispatch = useDispatch();

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

    const __Get_Elapsed__ = (date, revert) => {
        if (date) {
            const currDate = new Date();
            const start = new Date(date?.toDate());
            const elapsedTime = revert ? start - currDate : currDate - start;

            const s = parseInt(elapsedTime / 1000);
            const m = parseInt(elapsedTime / (1000 * 60));
            const h = parseInt(elapsedTime / (1000 * 60 * 60));
            const d = parseInt(elapsedTime / (1000 * 60 * 60 * 24));

            if (s < 60) {
                if (s < 5) {
                    return revert ? "Expired" : "Just now";
                }
                return lang === "en" ? "s" : "ث" + s;
            } else if (m < 60) {
                return lang === "en" ? "m" : "د" + m;
            } else if (h < 24) {
                return lang === "en" ? "h" : "س" + h;
            } else {
                return lang === "en" ? "d" : "ي" + d;
            }
        } else {
            return "";
        }
    };

    const renderFoodItems = ({ item }) => {
        const { id, key, Name, closedIn, foodType, date } = item;
        const isFav = Fav_Detector(id);

        return (
            <TouchableOpacity style={Styles.row} onPress={() => navigation.navigate("PostInfo", item)}>
                <View style={{ flex: 1 }}>
                    <Avatar profile={{ data: item }} style={Styles.avatar} />
                </View>

                <View style={Styles.contentWrapper}>
                    <View style={Styles.content}>
                        <View>
                            <Text style={Styles.name}>{foodType}</Text>
                            <Text style={Styles.author}>{Name}</Text>
                        </View>

                        <View>
                            <Text style={Styles.expDate}>
                                {CONTENT.ExpiresIn}{" "}
                                <Text style={{ color: "#FF2763", fontWeight: "bold" }}>
                                    {__Get_Elapsed__(closedIn, true)}
                                </Text>
                            </Text>
                        </View>

                        <View style={{ flexDirection: "row", alignItems: "center", gap: 2 }}>
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
                                style={Styles.btn}
                                onPress={() =>
                                    SendOrder({
                                        item: { id: id, key: key },
                                        userId: data?.id,
                                        loading: setLoadingBtn,
                                    })
                                }
                            >
                                {loadingBtn ? (
                                    <ActivityIndicator size={25} color="#0dbc79" />
                                ) : (
                                    <MaterialCommunityIcons name="plus" size={25} color={"#0dbc79"} />
                                )}
                            </TouchableOpacity>
                        ) : (
                            PendingOrder?.postId == item.key && (
                                <View style={Styles.btn}>
                                    <Ionicons name="checkmark-outline" size={25} color="#0dbc79" />
                                </View>
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
            <TouchableOpacity style={Styles.row} onPress={() => navigation.navigate("OpenProfile", item)}>
                <View style={{ flex: 1 }}>
                    <Avatar profile={{ data: item }} style={Styles.avatar} />
                </View>

                <View style={Styles.contentWrapper}>
                    <View style={[Styles.content, { flex: 2, justifyContent: "flex-start" }]}>
                        <View>
                            <Text style={Styles.name}>{item.Name}</Text>
                        </View>
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

    useEffect(() => {
        setResults([]);
        searchType === "food" && AnimateTo(0);
        searchType === "restaurant" && AnimateTo(ScreenX / 2);
    }, [searchType]);
    return (
        <View style={Styles.container}>
            <ScreenHeader
                arrow={true}
                component={<SearchBar update={setResults} loading={setLoading} searchType={searchType} />}
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
                                bottom: -2,
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
