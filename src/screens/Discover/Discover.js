import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FlatList, Image, Text, TouchableOpacity, View, ScrollView, RefreshControl } from "react-native";
import { createStackNavigator } from "@react-navigation/stack";
import { getDistance } from "geolib";
import firestore from "@react-native-firebase/firestore";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Location from "expo-location";
import ScreenHeader from "../../Components/ScreenHeader/ScreenHeader";
import Translations from "../../Languages";
import CreatePost from "../CreatePost/CreatePost";
import OpenProfile from "../OpenProfile/OpenProfile";
import Search from "../Search/Search";
import Favorites from "../Favorites/Favorites";
import PostInfo from "../PostInfo/PostInfo";
import styles from "./styles";
import { HStack, useToast, Select, CheckIcon, Skeleton } from "native-base";
import ALert from "../../Components/Alert/Alert";

export default () => {
    const Styles = styles();
    const { lang, theme, data, favorites, userPost, deviceLocation } = useSelector((state) => state.user);
    const [POSTS, setPosts] = useState([]);
    const [refreshing, setRefreshing] = useState(false);
    const [currentLocation, setCurrentLocation] = useState("home");

    const [recPosts, setRecPosts] = useState([]);
    const [newPosts, setNewPosts] = useState([]);
    const [favPosts, setFavPosts] = useState([]);

    const [lastPost, setLastPost] = useState(0);
    const [loading, setLoading] = useState(true);
    const [btnLoading, setBtnLoading] = useState(false);

    const [reachedLimit, setReachedLimit] = useState(false);

    const [scrollOffsets, setScrollOffsets] = useState({
        main: { x: 0, y: 0 },
        available: { x: 0, y: 0 },
        recommended: { x: 0, y: 0 },
        new: { x: 0, y: 0 },
        favs: { x: 0, y: 0 },
    });

    const intervalRef = useRef();

    const Stack = createStackNavigator();

    const limit = 10;

    const $Posts_Ref = firestore().collection("posts");
    const $User_Ref = firestore().collection("users").doc(data?.id);
    const $Users_Ref = firestore().collection("users");

    const dispatch = useDispatch();
    const Toast = useToast();
    const CONTENT = {
        homeTitle: Translations().t("homeTitle"),
        homeEmptyPosts: Translations().t("homeEmptyPosts"),
        homePickAt: Translations().t("homePickAt"),
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
        if (data?.restaurant) {
            CHECK_LIMIT_POSTS();
            Update_User_Post();
        }
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
            !data?.restaurant && POSTS_HANDLER(POSTS);
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
        userPost && Add_User_Post();
    }, [userPost]);
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
            (post) => __Get_Distance__(post.location, true) / 1000 <= 4 //>>4000km
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
            if (!data?.restaurant && POSTS.length) {
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
                            <ALert
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
                return s + "s";
            } else if (m < 60) {
                return m + "m";
            } else if (h < 24) {
                return h + "h";
            } else {
                return d + "d";
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

            const userPost = sortedPosts.find((post) => post.id === data?.id);

            if (userPost) {
                let index = sortedPosts.indexOf(userPost);
                sortedPosts.splice(index, 1);

                sortedPosts.sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance));

                sortedPosts.unshift(userPost);
            } else {
                sortedPosts.sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance));
            }
            setPosts(sortedPosts);
        }
    };

    const Check_Post_Expired = (closedIn) => {
        const now = new Date(Date.now());
        const exDate = new Date(closedIn.toDate());

        if (exDate.getTime() <= now.getTime()) {
            return true;
        } else {
            return false;
        }
    };

    const Fetch = async () => {
        try {
            const querySnapshot = await $Posts_Ref.orderBy("date", "desc").limit(limit).get();

            const newPosts = [];

            if (querySnapshot.size) {
                querySnapshot.docs.forEach(async (post, indx) => {
                    const { id, date, location, closedIn } = post.data();
                    const isExpired = Check_Post_Expired(closedIn);

                    // if post expired will remove it
                    if (isExpired) {
                        // Remove it from public
                        await post.ref.delete();
                        // Inactivate it from private
                        await $Users_Ref.doc(id).collection("posts").doc(post.id).update({ active: false });
                        id == data?.id && dispatch({ type: "userData/Del_User_Post" });
                        if (indx + 1 == querySnapshot.size) {
                            setLoading(false);
                        }
                        return;
                    }

                    newPosts.push({
                        ...post.data(),
                        key: post.id,
                        pickAt: `${CONTENT.homePickAt} ${date
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
                        const isExpired = Check_Post_Expired(closedIn);
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
                            id == data?.id && dispatch({ type: "userData/Del_User_Post" });
                            if (indx + 1 == querySnapshot.size) {
                                setLoading(false);
                            }
                            return;
                        }

                        newPosts.push({
                            ...post.data(),
                            key: post.id,
                            pickAt: `${CONTENT.homePickAt} ${date
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

    const Remove_Post = async () => {
        setBtnLoading(true);
        await $Posts_Ref
            .where("id", "==", data?.id)
            .get()
            .then((posts) => {
                if (posts.size) {
                    //Del post from global posts
                    posts.forEach((post) => post.ref.delete());
                    // Inactivate post from private posts
                    $User_Ref
                        .collection("posts")
                        .get()
                        .then((Uposts) => {
                            Uposts.forEach((Upost) => Upost.ref.update({ active: false }));
                        });
                }
                //Del post from app
                Remove_User_Post();
            })
            .catch((e) => {
                console.log(e);
                setBtnLoading(false);
            });

        setBtnLoading(false);
        Toast.show({
            render: () => {
                return <ALert status="error" msg="Post Removed" />;
            },
            duration: 2000,
        });
    };

    const Update_User_Post = () => {
        $Posts_Ref
            .where("id", "==", data?.id)
            .get()
            .then((querySnapshot) => {
                if (querySnapshot?.size) {
                    querySnapshot.forEach((upost) => {
                        dispatch({
                            type: "userData/Set_User_Post",
                            payload: { ...upost.data(), key: upost.id },
                        });
                    });
                } else {
                    dispatch({
                        type: "userData/Del_User_Post",
                    });
                }
            });
    };

    const Remove_User_Post = () => {
        if (POSTS.length) {
            const updatedPosts = POSTS.filter((post) => {
                return post.id !== data?.id;
            });
            setPosts(updatedPosts);
        }
        dispatch({ type: "userData/Del_User_Post" });
    };

    const Add_User_Post = () => {
        if (POSTS.length) {
            const otherPosts = POSTS.filter((post) => {
                return post.id !== data?.id;
            });
            setPosts([userPost, ...otherPosts]);
        } else {
            setPosts([userPost]);
        }
    };

    const CHECK_LIMIT_POSTS = async () => {
        $User_Ref.collection("posts").onSnapshot((querySnapshot) => {
            let dayPosts = 0;

            if (querySnapshot?.size) {
                querySnapshot.forEach((post, indx) => {
                    const { date } = post.data();

                    const elapsed = __Get_Elapsed__(date, true) / (1000 * 60 * 60 * 24);

                    elapsed < 1 && dayPosts++;
                    if (indx + 1 == querySnapshot.size) {
                        setReachedLimit(dayPosts >= 5 ? true : false);
                    }
                });
            }
        });
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

    const __FLATLIST_POSTS__ = ({ navigation }) => {
        const Buttons = [
            {
                show: !data?.restaurant,
                key: 1,
                name: "search",
                size: 30,
                color: theme ? "#fff" : "#252525",
                fun: () => navigation.navigate("Search"),
            },
            {
                show: !data?.restaurant,
                key: 2,
                name: "heart-outline",
                size: 30,
                color: theme ? "#fff" : "#252525",
                fun: () => navigation.navigate("Favorites"),
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
        const HeaderTitle = !data?.restaurant ? (
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
        ) : (
            <Text
                style={{
                    flex: 1,
                    marginLeft: 6,
                    fontSize: 30,
                    color: theme ? "#fff" : "#252525",
                    fontWeight: "bold",
                }}
            >
                {CONTENT.homeTitle}
            </Text>
        );

        const skls = [
            { key: 0, fd: 0.1, sp: 1.2 },
            { key: 1, fd: 0.1, sp: 1.3 },
            { key: 2, fd: 0.1, sp: 1.4 },
        ];
        const Skeletons = skls.map((sk) => {
            return (
                <ScrollView key={sk.key} horizontal={true}>
                    <Skeleton
                        fadeDuration={sk.fd}
                        speed={sk.sp}
                        marginX={2}
                        w={280}
                        h={40}
                        startColor="darkBlue.800"
                        rounded={8}
                    />
                    <Skeleton
                        fadeDuration={sk.fd}
                        speed={sk.sp}
                        marginX={2}
                        w={280}
                        h={40}
                        startColor="darkBlue.800"
                        rounded={8}
                    />
                    <Skeleton
                        fadeDuration={sk.fd}
                        speed={sk.sp}
                        marginX={2}
                        w={280}
                        h={40}
                        startColor="darkBlue.800"
                        rounded={8}
                    />
                </ScrollView>
            );
        });

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

                        {!data?.restaurant && (
                            <TouchableOpacity style={Styles.favView} onPress={() => Toggle_Fav(item)}>
                                <Ionicons
                                    name={item.fav ? "heart" : "heart-outline"}
                                    size={25}
                                    color={item.fav ? "#0dbc79" : "#fff"}
                                />
                            </TouchableOpacity>
                        )}

                        <TouchableOpacity
                            style={{
                                position: "absolute",
                                left: 5,
                                bottom: 0,
                                flexDirection: "row",
                            }}
                            onPress={() => navigation.push("OpenProfile", item)}
                        >
                            {item.photo ? (
                                <View style={Styles.avatar}>
                                    <Image
                                        style={{ width: "100%", height: "100%" }}
                                        source={{ uri: item.photo }}
                                    />
                                </View>
                            ) : (
                                <View style={Styles.avatar}>
                                    <Ionicons name="person" size={20} color="#fff" />
                                </View>
                            )}
                            <Text style={Styles.postAuthor}>{item.Name}</Text>
                        </TouchableOpacity>
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
                            {!data?.restaurant && (
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
                            )}

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
                        style={{ width: 100, height: 100, marginBottom: 10 }}
                        source={require("../../../assets/lock.png")}
                    />
                    <Text style={{ color: "#7d7d7d", fontSize: 16, fontWeight: "bold" }}>
                        {CONTENT.homeEmptyPosts}
                    </Text>
                </View>
            );
        };
        const onRefresh = async () => {
            setRefreshing(true);
            await Fetch();
            setRefreshing(false);
        };
        return (
            <View style={Styles.Container}>
                <ScreenHeader title={HeaderTitle} btns={HeaderButtons} />

                {loading ? (
                    Skeletons
                ) : (
                    <ScrollView
                        style={Styles.scrollView}
                        contentOffset={scrollOffsets.main}
                        onMomentumScrollEnd={(e) => SaveScroll(e.nativeEvent.contentOffset, "Main")}
                        refreshControl={
                            <RefreshControl
                                colors={["#1785f5"]}
                                progressBackgroundColor={theme ? "#001837" : "#ffffff"}
                                progressViewOffset={30}
                                refreshing={refreshing}
                                onRefresh={onRefresh}
                            />
                        }
                        contentContainerStyle={
                            !POSTS.length
                                ? { flex: 1, justifyContent: "center", alignItems: "center" }
                                : false
                        }
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
                                                style={{ width: 25, height: 25, marginRight: 6 }}
                                                source={require("../../../assets/new.png")}
                                            />
                                            <Text style={[Styles.postsHeader, { marginBottom: 0 }]}>
                                                {CONTENT.flheaderNew}
                                            </Text>
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

                {data?.restaurant &&
                    userPost !== null &&
                    (!userPost ? (
                        <TouchableOpacity
                            style={[Styles.handlePostBtn]}
                            onPress={() => {
                                if (!reachedLimit) {
                                    navigation.navigate("CreatePost");
                                } else {
                                    Toast.show({
                                        render: () => {
                                            return (
                                                <ALert
                                                    status="success"
                                                    msg={
                                                        lang == "en"
                                                            ? "You have helped enough today,come tomorrow."
                                                            : "لقد ساعدت الكثير اليوم,عد غداً"
                                                    }
                                                />
                                            );
                                        },
                                        duration: 3000,
                                    });
                                }
                            }}
                        >
                            <Image
                                style={{ width: "100%", height: "100%" }}
                                source={require("../../../assets/add.png")}
                            />
                        </TouchableOpacity>
                    ) : (
                        <TouchableOpacity
                            style={[Styles.handlePostBtn, { backgroundColor: "#dd4c35" }]}
                            onPress={Remove_Post}
                            disabled={btnLoading}
                        >
                            <Image
                                style={{ width: "100%", height: "100%" }}
                                source={require("../../../assets/trash.png")}
                            />
                        </TouchableOpacity>
                    ))}
            </View>
        );
    };

    return (
        <Stack.Navigator
            initialRouteName="Main"
            screenOptions={{
                headerShown: false,
                presentation: "transparentModal",
            }}
        >
            <Stack.Screen name="Main" component={__FLATLIST_POSTS__} />
            <Stack.Screen name="OpenProfile" component={OpenProfile} />
            <Stack.Screen name="Favorites" component={Favorites} />
            <Stack.Screen name="Search" component={Search} />
            <Stack.Screen name="CreatePost" component={CreatePost} />
            <Stack.Screen name="PostInfo" component={PostInfo} />
        </Stack.Navigator>
    );
};
