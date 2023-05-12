import React, { useEffect, useRef, useState, memo } from "react";
import { View, Text, TouchableOpacity, ScrollView, RefreshControl, Image, FlatList } from "react-native";
import ScreenHeader from "../../Components/ScreenHeader/ScreenHeader";
import styles from "./styles";
import { useDispatch, useSelector } from "react-redux";
import firestore from "@react-native-firebase/firestore";
import { CheckIcon, HStack, Select, Skeleton, useToast } from "native-base";
import Translations from "../../Languages";
import { CardStyleInterpolators, createStackNavigator } from "@react-navigation/stack";
import * as Location from "expo-location";
import OpenProfile from "../OpenProfile/OpenProfile";
import Favorites from "./Favorites/Favorites";
import Search from "./Search/Search";
import PostInfo from "../PostInfo/PostInfo";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { getDistance } from "geolib";
import TOAST from "../../Components/Toast/Toast";
import Avatar from "../../Components/Avatar/Avatar";
import Check_Post_Expired from "../../Components/CheckPostExpired";

const Explore = () => {
    const Styles = styles();
    const { theme, lang, data, favorites, deviceLocation } = useSelector((state) => state.user);
    const [POSTS, setPosts] = useState([]);
    const [refreshing, setRefreshing] = useState(false);
    const [currentLocation, setCurrentLocation] = useState("home");

    const [recPosts, setRecPosts] = useState([]);
    const [newPosts, setNewPosts] = useState([]);
    const [favPosts, setFavPosts] = useState([]);

    const [lastPost, setLastPost] = useState(0);
    const [loading, setLoading] = useState(true);
    const [scrollOffsets, setScrollOffsets] = useState({
        main: { x: 0, y: 0 },
        available: { x: 0, y: 0 },
        recommended: { x: 0, y: 0 },
        new: { x: 0, y: 0 },
        favs: { x: 0, y: 0 },
    });

    const intervalRef = useRef();
    const limit = 10;

    const $Posts_Ref = firestore().collection("posts");
    const $Users_Ref = firestore().collection("users");
    const $User_Ref = firestore().collection("users").doc(data?.id);

    const Stack = createStackNavigator();
    const dispatch = useDispatch();
    const Toast = useToast();
    const CONTENT = {
        exploreTitle: Translations().t("exploreTitle"),
        exploreEmptyPosts: Translations().t("exploreEmptyPosts"),
        postPickAt: Translations().t("postPickAt"),
        Now: Translations().t("Now"),
        flheaderAvl: Translations().t("flheaderAvl"),
        flheaderRec: Translations().t("flheaderRec"),
        flheaderNew: Translations().t("flheaderNew"),
        flheaderFav: Translations().t("flheaderFav"),
        currlocationChoose: Translations().t("currlocationChoose"),
        currlocationCurrent: Translations().t("currlocationCurrent"),
        currlocationHome: Translations().t("currlocationHome"),
    };

    useEffect(() => {
        Pending_Orders();
        Fetch();
        return () => {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        };
    }, []);
    useEffect(() => {
        if (POSTS.length) {
            Date_Syncing();
            Sort_Posts();
            POSTS_HANDLER(POSTS);
        }
        return () => clearInterval(intervalRef.current);
    }, [POSTS]);
    useEffect(() => {
        if (POSTS.length) {
            setScrollOffsets({
                available: { x: 0, y: 0 },
                recommended: { x: 0, y: 0 },
                new: { x: 0, y: 0 },
                favs: { x: 0, y: 0 },
            });
            FavPost_activator();
        }
    }, [POSTS.length]);
    useEffect(() => {
        FavPost_activator();
    }, [favorites]);
    useEffect(() => {
        if (deviceLocation && POSTS.length) {
            const updatedPosts = [];
            POSTS.forEach((post) => {
                updatedPosts.push({
                    ...post,
                    distance: __Get_Distance__(post.location),
                });
            });
            setPosts(updatedPosts);
        }
    }, [deviceLocation]);
    useEffect(() => {
        if (currentLocation == "current") {
            TrackLocation();
        } else {
            if (POSTS.length) {
                const updatedPosts = [];
                POSTS.forEach((post) => {
                    updatedPosts.push({
                        ...post,
                        distance: __Get_Distance__(post.location),
                    });
                });
                setPosts(updatedPosts);
            }
        }
    }, [currentLocation]);

    // Functions

    const POSTS_HANDLER = (posts) => {
        const nearPosts = posts.filter(
            (post) => __Get_Distance__(post.location, true) / 1000 <= 4 //>>4km
        );
        nearPosts.sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance));

        const newPosts = posts.filter(
            (post) => parseInt(__Get_Elapsed__(post.date, true) / (1000 * 60)) <= 60 //>>1h
        );
        newPosts.sort((a, b) => parseInt(a.elapsed) - parseInt(b.elapsed));

        const newFavs = posts.filter((post) => (post.fav ? post : false));

        setRecPosts(nearPosts);
        setNewPosts(newPosts);
        setFavPosts(newFavs);
    };

    const Is_Fav = (rest) => {
        let isFav = false;
        favorites.forEach((fav) => {
            if (rest == fav.id) {
                isFav = true;
            }
        });

        return isFav;
    };

    const FavPost_activator = () => {
        try {
            if (POSTS.length) {
                if (favorites.length) {
                    const updatedPosts = POSTS.map((post) => {
                        const newPost = { ...post };
                        const isFav = favorites.some((fav) => fav.id === post.id);
                        newPost.fav = isFav;
                        return newPost;
                    });

                    setPosts(updatedPosts);
                } else {
                    const updatedPosts = POSTS.map((post) => {
                        const newPost = { ...post };
                        newPost.fav = false;
                        return newPost;
                    });
                    setPosts(updatedPosts);
                }
            }
        } catch (e) {
            console.log(e);
        }
    };

    const TrackLocation = async () => {
        const { status } = await Location.requestForegroundPermissionsAsync();
        try {
            if (status !== "granted") {
                Toast.show({
                    render: () => {
                        return (
                            <TOAST
                                status="error"
                                msg="Make sure you enabled location at app permissions setting."
                            />
                        );
                    },
                    duration: 3000,
                });
                setCurrentLocation("home");

                return;
            }

            Location.watchPositionAsync(
                { accuracy: Location.Accuracy.High, timeInterval: 10000 },
                (location) => {
                    const { latitude, longitude } = location.coords;

                    dispatch({
                        type: "userData/Set_Device_Location",
                        payload: {
                            latitude,
                            longitude,
                            latitudeDelta: 0,
                            longitudeDelta: 0,
                        },
                    });
                }
            ).catch((e) => console.log(e));
        } catch (e) {
            console.log(e);
        }
    };

    const __Get_Elapsed__ = (date, basic) => {
        if (date) {
            const currDate = new Date();
            const start = new Date(date?.toDate());
            const elapsedTime = currDate - start;

            if (basic) {
                return elapsedTime;
            }

            const s = parseInt(elapsedTime / 1000);
            const m = parseInt(elapsedTime / (1000 * 60));
            const h = parseInt(elapsedTime / (1000 * 60 * 60));
            const d = parseInt(elapsedTime / (1000 * 60 * 60 * 24));

            if (s < 60) {
                if (s < 5) {
                    return CONTENT.Now;
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

    const __Get_Distance__ = (geo, basic) => {
        let distance = 0;

        if (currentLocation == "current") {
            distance = getDistance(deviceLocation, geo, 1);
        } else {
            distance = getDistance(data?.location, geo, 1);
        }
        if (basic) {
            return distance;
        } else {
            if (distance / 1000 < 99) {
                if (distance > 1000) {
                    return (distance / 1000).toPrecision(2) + " Km";
                } else {
                    return distance + " m";
                }
            } else {
                return "+99 Km";
            }
        }
    };

    const Sort_Posts = () => {
        if (POSTS.length > 1) {
            const sortedPosts = POSTS;

            sortedPosts.sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance));

            setPosts(sortedPosts);
        }
    };

    const Fetch = async () => {
        try {
            const querySnapshot = await $Posts_Ref.orderBy("date", "desc").limit(limit).get();

            const newPosts = [];

            if (querySnapshot.size) {
                querySnapshot.docs.forEach(async (post, indx) => {
                    const { id, date, location, closedIn } = post.data();
                    const isExpired = await Check_Post_Expired(post.id);

                    // if post expired will remove it
                    if (isExpired) {
                        // Remove it from public
                        await post.ref.delete();
                        // Inactivate it from private
                        await $Users_Ref.doc(id).collection("posts").doc(post.id).update({ active: false });
                        if (indx + 1 == querySnapshot.size) {
                            setLoading(false);
                        }
                        return;
                    }

                    newPosts.push({
                        ...post.data(),
                        key: post.id,
                        pickAt: `${CONTENT.postPickAt} ${date
                            .toDate()
                            .getHours()
                            .toString()
                            .padStart(2, "0")} - ${closedIn.toDate().getHours().toString().padStart(2, "0")}`,
                        elapsed: __Get_Elapsed__(date),
                        distance: __Get_Distance__(location),
                        has: data?.id == id ? true : false,
                        fav: Is_Fav(id),
                    });

                    if (indx + 1 == querySnapshot.size) {
                        setLoading(false);
                        setPosts(newPosts);
                        setLastPost(querySnapshot.docs[querySnapshot.size - 1]);
                    }
                });
            } else {
                setLoading(false);
            }
        } catch (e) {
            setLoading(false);
            console.log("Error fetching posts:", e);
        }
    };

    const Fetch_More = async () => {
        if (loading) return;
        try {
            if (data) {
                const querySnapshot = await $Posts_Ref
                    .orderBy("date", "desc")
                    .startAfter(lastPost)
                    .limit(limit)
                    .get();

                const newPosts = [];

                if (querySnapshot.size) {
                    querySnapshot.docs.forEach(async (post, indx) => {
                        const { id, date, location, closedIn } = post.data();
                        const isExpired = await Check_Post_Expired(post.id);
                        // if post expired will remove it
                        if (isExpired) {
                            // Remove it from public
                            await post.ref.delete();
                            // Inactivate it from private
                            await $Users_Ref
                                .doc(id)
                                .collection("posts")
                                .doc(post.id)
                                .update({ active: false });
                            if (indx + 1 == querySnapshot.size) {
                                setLoading(false);
                            }
                            return;
                        }

                        newPosts.push({
                            ...post.data(),
                            key: post.id,
                            pickAt: `${CONTENT.postPickAt} ${date
                                .toDate()
                                .getHours()
                                .toString()
                                .padStart(2, "0")} - ${closedIn
                                .toDate()
                                .getHours()
                                .toString()
                                .padStart(2, "0")}`,
                            elapsed: __Get_Elapsed__(date),
                            distance: __Get_Distance__(location),
                            has: data?.id == id ? true : false,
                            fav: Is_Fav(id),
                        });

                        if (indx + 1 == querySnapshot.size) {
                            setLoading(false);
                            setPosts((prev) => [...prev, ...newPosts]);
                            setLastPost(querySnapshot.docs[querySnapshot.size - 1]);
                        }
                    });
                } else {
                    setLoading(false);
                }
            }
        } catch (error) {
            setLoading(false);
            console.log("Error fetching more posts:", error);
        }
    };

    const Date_Syncing = () => {
        intervalRef.current = setInterval(() => {
            if (POSTS.length) {
                const updatedPosts = [];
                POSTS.forEach((post) => {
                    updatedPosts.push({
                        ...post,
                        elapsed: __Get_Elapsed__(post.date),
                    });
                });
                setPosts(updatedPosts);
            }
        }, 60000);
    };

    const Toggle_Fav = (rest) => {
        try {
            if (rest.fav) {
                const updatedFavs = favorites.filter((fav) => fav.id !== rest.id);
                dispatch({ type: "userData/Del_Favorites", payload: [rest] });
                dispatch({ type: "userData/Set_Favorites", payload: updatedFavs });
            } else {
                const newFavs = [...favorites, rest];
                const favReq = {
                    id: rest.id,
                };
                dispatch({ type: "userData/Update_Favorites", payload: [favReq] });
                dispatch({ type: "userData/Set_Favorites", payload: newFavs });
            }
        } catch (e) {
            console.log(e);
        }
    };

    const Pending_Orders = () => {
        $User_Ref.collection("orders").onSnapshot((orders) => {
            if (orders) {
                const pendOrder = orders.docs.find((pend) => pend?.data()?.delievered === undefined);

                if (pendOrder) {
                    dispatch({ type: "userData/Set_PendingOrder", payload: pendOrder?.data() });
                } else {
                    dispatch({ type: "userData/Del_PendingOrder" });
                }
            }
        });
    };

    const MAIN = memo(({ navigation }) => {
        const SaveScroll = (event, flat) => {
            switch (flat) {
                case "Main":
                    setScrollOffsets((prev) => {
                        return { ...prev, main: event };
                    });
                    break;
                case "available":
                    setScrollOffsets((prev) => {
                        return { ...prev, available: event };
                    });
                    break;
                case "recommended":
                    setScrollOffsets((prev) => {
                        return { ...prev, recommended: event };
                    });
                    break;
                case "new":
                    setScrollOffsets((prev) => {
                        return { ...prev, new: event };
                    });
                    break;
                case "favs":
                    setScrollOffsets((prev) => {
                        return { ...prev, favs: event };
                    });
                    break;
            }
        };

        const renderPost = ({ item }) => {
            return (
                <TouchableOpacity
                    activeOpacity={0.8}
                    style={Styles.post}
                    onPress={() => navigation.push("PostInfo", item)}
                >
                    <View style={{ flex: 2.5 }}>
                        <Image style={Styles.postImage} source={{ uri: item.postImage }} />

                        <TouchableOpacity style={Styles.favView} onPress={() => Toggle_Fav(item)}>
                            <Ionicons name={item.fav ? "heart" : "heart-outline"} size={25} color="#FF2763" />
                        </TouchableOpacity>

                        <View
                            style={{
                                position: "absolute",
                                left: 5,
                                bottom: 0,
                                flexDirection: "row",
                            }}
                        >
                            <Avatar profile={{ data: item }} style={Styles.avatar} />
                            <Text style={Styles.postAuthor}>{item.Name}</Text>
                        </View>
                    </View>

                    <View style={Styles.content}>
                        <Text
                            style={{
                                color: theme ? "#fff" : "#252525",
                                fontSize: 16,
                                fontWeight: "bold",
                            }}
                        >
                            {item.foodType}
                        </Text>

                        <Text
                            style={{
                                color: "#919191",
                                fontSize: 14,
                            }}
                        >
                            {item.pickAt}
                        </Text>

                        <View style={Styles.postState}>
                            <View style={Styles.distance}>
                                <MaterialCommunityIcons
                                    name="navigation-variant-outline"
                                    size={15}
                                    color="#2ebeff"
                                />
                                <Text style={{ color: "#4bbc83", fontSize: 14, marginLeft: 3 }}>
                                    {item.distance}
                                </Text>
                            </View>

                            <View style={Styles.dateCont}>
                                <Ionicons name="time-outline" size={12} color="#848484" />
                                <Text style={{ color: "#2196f3", marginLeft: 2 }}>{item.elapsed}</Text>
                            </View>
                        </View>
                    </View>
                </TouchableOpacity>
            );
        };
        const renderEmptyList = () => {
            return (
                <View
                    style={{
                        flex: 1,
                        justifyContent: "center",
                        alignItems: "center",
                        marginBottom: 30,
                    }}
                >
                    <Image
                        style={{ width: 100, height: 100, marginBottom: 10, opacity: 0.7 }}
                        source={require("../../../assets/lock.png")}
                    />
                    <Text style={{ color: "#7d7d7d", fontSize: 16, fontWeight: "bold" }}>
                        {CONTENT.exploreEmptyPosts}
                    </Text>
                </View>
            );
        };
        const onRefresh = async () => {
            setRefreshing(true);
            await Fetch();
            setRefreshing(false);
        };
        const Buttons = [
            {
                key: 1,
                name: "search-outline",
                size: 30,
                color: theme ? "#fff" : "#252525",
                fun: () => navigation.navigate("Search"),
            },
            {
                key: 2,
                name: "heart-outline",
                size: 30,
                color: theme ? "#fff" : "#252525",
                fun: () => navigation.navigate("Favorites"),
            },
        ];
        const HeaderButtons = Buttons.map((btn) => {
            return (
                <TouchableOpacity style={{ marginLeft: 15 }} key={btn.key} onPress={btn.fun}>
                    <Ionicons name={btn.name} size={btn.size} color={btn.color} />
                </TouchableOpacity>
            );
        });
        const HeaderComponent = (
            <HStack flex={1} alignItems={"center"}>
                {currentLocation && (
                    <Ionicons
                        name={currentLocation == "current" ? "navigate" : "location"}
                        size={25}
                        color="#1785f5"
                    />
                )}

                <Select
                    selectedValue={currentLocation}
                    minWidth="180"
                    accessibilityLabel="Choose location"
                    placeholder={CONTENT.currlocationChoose}
                    placeholderTextColor={"lightBlue.600"}
                    borderWidth={0}
                    textAlign={"center"}
                    dropdownIcon={<Ionicons name="chevron-down" size={20} color="#1785f5" />}
                    _selectedItem={{
                        bg: "muted.200",
                        endIcon: <CheckIcon size="5" />,
                    }}
                    color="lightBlue.500"
                    fontSize={18}
                    fontWeight={"bold"}
                    onValueChange={(itemValue) => setCurrentLocation(itemValue)}
                >
                    <Select.Item label={CONTENT.currlocationCurrent} value="current" />
                    <Select.Item label={CONTENT.currlocationHome} value="home" />
                </Select>
            </HStack>
        );

        const skls = [
            { key: 0, fd: 0.1, sp: 1.2 },
            { key: 1, fd: 0.1, sp: 1.3 },
            { key: 2, fd: 0.1, sp: 1.4 },
        ];
        const Skeletons = skls.map((sk) => {
            return (
                <View key={sk.key} style={{ flexDirection: "row" }}>
                    <Skeleton
                        fadeDuration={sk.fd}
                        speed={sk.sp}
                        marginX={2}
                        w={280}
                        h={40}
                        startColor={theme ? "darkBlue.800" : "darkBlue.100"}
                        rounded={8}
                    />
                    <Skeleton
                        fadeDuration={sk.fd}
                        speed={sk.sp}
                        marginX={2}
                        w={280}
                        h={40}
                        startColor={theme ? "darkBlue.800" : "darkBlue.100"}
                        rounded={8}
                    />
                    <Skeleton
                        fadeDuration={sk.fd}
                        speed={sk.sp}
                        marginX={2}
                        w={280}
                        h={40}
                        startColor={theme ? "darkBlue.800" : "darkBlue.100"}
                        rounded={8}
                    />
                </View>
            );
        });

        return (
            <View style={Styles.Container}>
                <ScreenHeader component={HeaderComponent} btns={HeaderButtons} />
                {loading ? (
                    <View style={{ gap: 30, paddingTop: 40 }}>{Skeletons}</View>
                ) : (
                    <ScrollView
                        style={Styles.scrollView}
                        contentOffset={scrollOffsets.main}
                        onMomentumScrollEnd={(e) => SaveScroll(e.nativeEvent.contentOffset, "Main")}
                        refreshControl={
                            <RefreshControl
                                colors={["#1785f5"]}
                                progressBackgroundColor={theme ? "#001c40" : "#ffffff"}
                                progressViewOffset={25}
                                refreshing={refreshing}
                                onRefresh={onRefresh}
                            />
                        }
                        contentContainerStyle={[
                            { paddingBottom: 30 },
                            !POSTS.length
                                ? { flex: 1, justifyContent: "center", alignItems: "center" }
                                : false,
                        ]}
                    >
                        {POSTS.length ? (
                            <>
                                {recPosts.length ? (
                                    <>
                                        <Text style={Styles.postsHeader}>{CONTENT.flheaderRec}</Text>
                                        <FlatList
                                            style={Styles.flatList}
                                            data={recPosts}
                                            renderItem={renderPost}
                                            keyExtractor={(item) => item.key}
                                            horizontal={true}
                                            contentOffset={scrollOffsets.recommended}
                                            onMomentumScrollEnd={(e) =>
                                                SaveScroll(e.nativeEvent.contentOffset, "recommended")
                                            }
                                            showsHorizontalScrollIndicator={false}
                                            onEndReached={Fetch_More}
                                            onEndReachedThreshold={0.5}
                                            removeClippedSubviews={false}
                                        />
                                    </>
                                ) : (
                                    false
                                )}

                                {newPosts.length ? (
                                    <>
                                        <View
                                            style={{
                                                flexDirection: "row",
                                                alignItems: "center",
                                                marginBottom: 7,
                                            }}
                                        >
                                            <Image
                                                style={{
                                                    width: 25,
                                                    height: 25,
                                                    marginRight: 6,
                                                    marginTop: 20,
                                                }}
                                                source={require("../../../assets/new.png")}
                                            />
                                            <Text style={Styles.postsHeader}>{CONTENT.flheaderNew}</Text>
                                        </View>
                                        <FlatList
                                            style={Styles.flatList}
                                            data={newPosts}
                                            renderItem={renderPost}
                                            keyExtractor={(item) => item.key}
                                            horizontal={true}
                                            contentOffset={scrollOffsets.new}
                                            onMomentumScrollEnd={(e) =>
                                                SaveScroll(e.nativeEvent.contentOffset, "new")
                                            }
                                            showsHorizontalScrollIndicator={false}
                                            onEndReached={Fetch_More}
                                            onEndReachedThreshold={0.5}
                                            removeClippedSubviews={false}
                                        />
                                    </>
                                ) : (
                                    false
                                )}

                                {POSTS.length ? (
                                    <>
                                        <Text style={Styles.postsHeader}>{CONTENT.flheaderAvl}</Text>
                                        <FlatList
                                            style={Styles.flatList}
                                            data={POSTS}
                                            renderItem={renderPost}
                                            keyExtractor={(item) => item.key}
                                            horizontal={true}
                                            contentOffset={scrollOffsets.available}
                                            onMomentumScrollEnd={(e) =>
                                                SaveScroll(e.nativeEvent.contentOffset, "available")
                                            }
                                            showsHorizontalScrollIndicator={false}
                                            onEndReached={Fetch_More}
                                            onEndReachedThreshold={0.5}
                                            removeClippedSubviews={false}
                                        />
                                    </>
                                ) : (
                                    false
                                )}

                                {favPosts.length ? (
                                    <>
                                        <Text style={Styles.postsHeader}>{CONTENT.flheaderFav}</Text>
                                        <FlatList
                                            style={Styles.flatList}
                                            data={favPosts}
                                            renderItem={renderPost}
                                            keyExtractor={(item) => item.key}
                                            horizontal={true}
                                            contentOffset={scrollOffsets.favs}
                                            onMomentumScrollEnd={(e) =>
                                                SaveScroll(e.nativeEvent.contentOffset, "favs")
                                            }
                                            showsHorizontalScrollIndicator={false}
                                            onEndReached={Fetch_More}
                                            onEndReachedThreshold={0.5}
                                            removeClippedSubviews={false}
                                        />
                                    </>
                                ) : (
                                    false
                                )}
                            </>
                        ) : (
                            renderEmptyList()
                        )}
                    </ScrollView>
                )}
            </View>
        );
    });

    const config = {
        animation: "timing",
        config: {
            duration: 200,
        },
    };

    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false,
                detachPreviousScreen: false,
                transitionSpec: {
                    open: config,
                    close: config,
                },
                cardStyleInterpolator: CardStyleInterpolators.forFadeFromBottomAndroid,
            }}
        >
            <Stack.Screen name="MAIN" component={MAIN} />
            <Stack.Screen name="OpenProfile" component={OpenProfile} />
            <Stack.Screen name="Favorites" component={Favorites} />
            <Stack.Screen name="Search" component={Search} />
            <Stack.Screen name="PostInfo" component={PostInfo} />
        </Stack.Navigator>
    );
};

export default Explore;
