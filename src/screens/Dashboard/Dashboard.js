import React, { useEffect, useState, memo } from "react";
import { View, Text, TouchableHighlight, ActivityIndicator, TouchableOpacity, Image } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { createStackNavigator, CardStyleInterpolators } from "@react-navigation/stack";
import { useNavigation } from "@react-navigation/native";
import firestore from "@react-native-firebase/firestore";
import { Box, HStack, Skeleton, VStack, useToast } from "native-base";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import styles from "./styles";
import Translations from "../../Languages";
import CreatePost from "./CreatePost/CreatePost";
import TOAST from "../../Components/Toast/Toast";
import ScreenHeader from "../../Components/ScreenHeader/ScreenHeader";
import PostInfo from "../PostInfo/PostInfo";
import PostsHistory from "./PostsHistory/PostsHistory";
import OrdersHistory from "./OrdersHistory/OrdersHistory";
import OpenProfile from "../OpenProfile/OpenProfile";
import Check_Post_Expired from "../../Components/CheckPostExpired";

const Dashboard = () => {
    const { data, userPost, theme, lang } = useSelector((state) => state.user);
    const Styles = styles();
    const [loading, setLoading] = useState(false);
    const [btnLoading, setBtnLoading] = useState(false);
    const [reachedLimit, setReachedLimit] = useState(null);

    const [activePost, setActivePost] = useState({
        id: "",
        from: "",
        to: "",
        Data: {},
    });
    const [statstics, setStatstics] = useState({
        postT: { count: 0, Data: [] },
        postW: { count: 0, Data: [] },
        postTo: { count: 0, Data: [] },
    });
    const [orders, setOrders] = useState({
        done: { count: 0, Data: [] },
        cancled: { count: 0, Data: [] },
    });

    const CONTENT = {
        dashboardTitle: Translations().t("dashboardTitle"),
        dashboardActivePost: Translations().t("dashboardActivePost"),
        dashboardActivePostId: Translations().t("dashboardActivePostId"),
        dashboardActivePostCreatedAt: Translations().t("dashboardActivePostCreatedAt"),
        ExpiresIn: Translations().t("ExpiresIn"),
        dashboardActivePostDetails: Translations().t("dashboardActivePostDetails"),
        dashboardActivePostDelete: Translations().t("dashboardActivePostDelete"),
        dashboardStatsticsToday: Translations().t("dashboardStatsticsToday"),
        dashboardStatsticsWeek: Translations().t("dashboardStatsticsWeek"),
        dashboardStatsticsTotal: Translations().t("dashboardStatsticsTotal"),
        dashboardStatsticsDeliverd: Translations().t("dashboardStatsticsDeliverd"),
        dashboardStatsticsCancled: Translations().t("dashboardStatsticsCancled"),
        dashboardStatsticsPosts: Translations().t("dashboardStatsticsPosts"),
        dashboardStatsticsOrders: Translations().t("dashboardStatsticsOrders"),
        todayPosts: Translations().t("todayPosts"),
        weekPosts: Translations().t("weekPosts"),
        totlaPosts: Translations().t("totlaPosts"),
        deliverdOrders: Translations().t("deliverdOrders"),
        cancledOrders: Translations().t("cancledOrders"),
    };

    const $Posts_Ref = firestore().collection("posts");
    const $Users_Ref = firestore().collection("users");
    const $User_Ref = firestore().collection("users").doc(data?.id);

    const dispatch = useDispatch();
    const Stack = createStackNavigator();
    const Toast = useToast();
    const navigation = useNavigation();

    useEffect(() => {
        fetchActivePost();
        fetchStatistics();
        fetchOrders();
    }, []);
    useEffect(() => {
        CHECK_LIMIT_POSTS();
    }, [statstics]);
    useEffect(() => {
        if (userPost) {
            const Id = userPost.key?.slice(0, 6).toUpperCase();

            const From = new Date(userPost?.date?.toDate()).toDateString() || "";
            const To = new Date(userPost?.closedIn?.toDate()).toDateString() || "";
            setActivePost((prev) => ({ ...prev, id: Id, from: From, to: To, Data: userPost }));
        }
    }, [userPost]);

    const fetchActivePost = () => {
        try {
            setLoading(true);
            $User_Ref
                .collection("posts")
                .where("active", "==", true)
                .get()
                .then((query) => {
                    query?.size
                        ? query.forEach(async (active) => {
                              const { date, closedIn } = active.data();
                              const isExpired = await Check_Post_Expired(active.id);

                              if (isExpired) {
                                  await Remove_Post(active.id, false);

                                  setLoading(false);
                                  return;
                              } else {
                                  const Id = active.id.slice(0, 6).toUpperCase();
                                  const From = new Date(date?.toDate()).toDateString();
                                  const To = new Date(closedIn?.toDate()).toDateString();

                                  setActivePost((prev) => ({
                                      ...prev,
                                      id: Id,
                                      from: From,
                                      to: To,
                                      Data: active.data(),
                                  }));

                                  dispatch({
                                      type: "userData/Set_User_Post",
                                      payload: { ...active.data(), key: active.id },
                                  });

                                  setLoading(false);
                              }
                          })
                        : setLoading(false);
                    dispatch({
                        type: "userData/Del_User_Post",
                    });
                });
        } catch (e) {
            console.log(e);
        }
    };

    const fetchStatistics = () => {
        try {
            $User_Ref.collection("posts").onSnapshot((querySnapshot) => {
                let Today = { count: 0, Data: [] };
                let Weeks = { count: 0, Data: [] };
                let Total = { count: querySnapshot?.size, Data: [] };

                querySnapshot?.size &&
                    querySnapshot.forEach(async (post, indx) => {
                        const { date } = post.data();
                        const PostOrdersCount = await post.ref
                            .collection("orders")
                            .count()
                            .get()
                            .then((c) => c.data().count);
                        const Now = new Date();
                        const Elapsed = parseInt((Now - new Date(date?.toDate())) / (1000 * 60 * 60 * 24));

                        const PostData = {
                            ...post.data(),
                            ordersCount: PostOrdersCount,
                            key: indx,
                        };

                        Total.Data.push(PostData);
                        if (Elapsed <= 1) {
                            Today = {
                                count: Today.count + 1,
                                Data: [...Today.Data, PostData],
                            };
                            Weeks = {
                                count: Weeks.count + 1,
                                Data: [...Weeks.Data, PostData],
                            };
                        } else if (Elapsed <= 7) {
                            Weeks = {
                                count: Weeks.count + 1,
                                Data: [...Weeks.Data, PostData],
                            };
                        }

                        if (indx + 1 === querySnapshot?.size) {
                            setStatstics((prev) => ({
                                ...prev,
                                postT: Today,
                                postW: Weeks,
                                postTo: Total,
                            }));
                        }
                    });
            });
        } catch (e) {
            console.log(e);
        }
    };

    const fetchOrders = () => {
        try {
            $User_Ref
                .collection("orders")
                .where("delievered", "==", true)
                .onSnapshot((querySnapshot) => {
                    let Done = { count: querySnapshot?.size, Data: [] };

                    querySnapshot?.size &&
                        querySnapshot.forEach(async (order, indx) => {
                            await $Users_Ref
                                .doc(order.data().source)
                                .get()
                                .then((user) => {
                                    const { id, photo, Name, phone, address, location, email, social } =
                                        user.data();
                                    Done = {
                                        count: Done.count,
                                        Data: [
                                            ...Done.Data,
                                            {
                                                ...order.data(),
                                                id,
                                                photo,
                                                Name,
                                                phone,
                                                address,
                                                location,
                                                email,
                                                social,
                                                key: indx,
                                            },
                                        ],
                                    };
                                });
                            if (Done.Data.length == indx + 1) {
                                setOrders((prev) => ({ ...prev, done: Done }));
                            }
                        });
                });

            $User_Ref
                .collection("orders")
                .where("accepted", "==", false)
                .onSnapshot((querySnapshot) => {
                    let Canceled = { count: querySnapshot?.size, Data: [] };

                    querySnapshot?.size &&
                        querySnapshot.forEach(async (order, indx) => {
                            await $Users_Ref
                                .doc(order.data().source)
                                .get()
                                .then((user) => {
                                    const { id, photo, Name, phone, address, location, email, social } =
                                        user.data();

                                    Canceled = {
                                        count: Canceled.count,
                                        Data: [
                                            ...Canceled.Data,
                                            {
                                                ...order.data(),
                                                id,
                                                photo,
                                                Name,
                                                phone,
                                                address,
                                                location,
                                                email,
                                                social,
                                                key: indx,
                                            },
                                        ],
                                    };
                                });

                            if (Canceled.Data.length == indx + 1) {
                                setOrders((prev) => ({ ...prev, cancled: Canceled }));
                            }
                        });
                });
        } catch (e) {
            console.log(e);
        }
    };

    const Remove_Post = async (key, action) => {
        if (key) {
            action && setBtnLoading((prev) => !prev);
            //Del post from global posts
            await $Posts_Ref
                .doc(key)
                .delete()
                .then(() => {
                    // Inactivate post from private posts
                    $User_Ref.collection("posts").doc(key).update({ active: false });
                });

            //Del post from app
            dispatch({
                type: "userData/Del_User_Post",
            });
            setActivePost((prev) => ({ ...prev, id: "", from: "", to: "", Data: {} }));

            if (action) {
                setBtnLoading((prev) => !prev);
                Toast.show({
                    render: () => {
                        return <TOAST status="error" msg="Post Removed" />;
                    },
                    duration: 2000,
                });
            }
        }
    };

    const __Get_Elapsed__ = (date) => {
        if (date) {
            const currDate = new Date();
            const start = new Date(date?.toDate());
            const elapsedTime = currDate - start;

            return elapsedTime;
        } else {
            return "";
        }
    };

    const OpenCreatePost = async () => {
        if (reachedLimit === false) {
            navigation.navigate("CreatePost");
        } else {
            Toast.show({
                render: () => {
                    return (
                        <TOAST
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
    };

    const CHECK_LIMIT_POSTS = async () => {
        $User_Ref
            .collection("posts")
            .get()
            .then((querySnapshot) => {
                let dayPosts = 0;

                if (querySnapshot?.size) {
                    querySnapshot.forEach((post, indx) => {
                        const { date } = post.data();

                        const elapsed = __Get_Elapsed__(date) / (1000 * 60 * 60 * 24);

                        elapsed < 1 && dayPosts++;
                        if (indx + 1 == querySnapshot?.size) {
                            if (dayPosts >= 5) {
                                setReachedLimit(true);
                            } else {
                                setReachedLimit(false);
                            }
                        }
                    });
                }
            });
    };

    const MAIN = memo(() => {
        const Buttons = [
            {
                key: 1,
                name: "refresh",
                size: 30,
                color: "#1785F5",
                fun: () => fetchActivePost(),
            },
        ];
        const HeaderButtons = Buttons.map((btn) => {
            return (
                <TouchableOpacity style={{ marginLeft: 15 }} key={btn.key} onPress={btn.fun}>
                    <Ionicons name={btn.name} size={btn.size} color={btn.color} />
                </TouchableOpacity>
            );
        });
        return (
            <View style={Styles.container}>
                <ScreenHeader title={CONTENT.dashboardTitle} btns={HeaderButtons} />
                <Box style={Styles.wrapper}>
                    <Text style={Styles.header}>{CONTENT.dashboardActivePost}</Text>

                    {loading ? (
                        <Skeleton
                            style={{
                                height: 150,
                                borderRadius: 12,
                                backgroundColor: "transparent",
                            }}
                            startColor={theme ? "darkBlue.800" : "darkBlue.100"}
                            speed={1.3}
                        />
                    ) : (
                        <VStack style={Styles.post}>
                            {userPost ? (
                                <>
                                    <View style={Styles.actvBuble} />
                                    <HStack style={Styles.row}>
                                        <Text style={Styles.labelTxt}>{CONTENT.dashboardActivePostId}</Text>
                                        <Text style={Styles.valueTxt}>#{activePost.id}</Text>
                                    </HStack>

                                    <HStack style={Styles.row}>
                                        <Text style={Styles.labelTxt}>
                                            {CONTENT.dashboardActivePostCreatedAt}
                                        </Text>
                                        <Text style={Styles.valueTxt}>{activePost.from}</Text>
                                    </HStack>

                                    <HStack style={Styles.row}>
                                        <Text style={Styles.labelTxt}>{CONTENT.ExpiresIn}</Text>
                                        <Text style={Styles.valueTxt}>{activePost.to}</Text>
                                    </HStack>

                                    <HStack style={Styles.row}>
                                        <TouchableHighlight
                                            style={[
                                                Styles.postBtn,
                                                {
                                                    backgroundColor: "#1785f533",
                                                    borderWidth: 1,
                                                    borderColor: "#1785f5",
                                                },
                                            ]}
                                            underlayColor="#1785f5"
                                            onPress={() => navigation.navigate("PostInfo", activePost.Data)}
                                        >
                                            <Text style={{ color: theme ? "#fff" : "#252525" }}>
                                                {CONTENT.dashboardActivePostDetails}
                                            </Text>
                                        </TouchableHighlight>

                                        <TouchableHighlight
                                            style={[Styles.postBtn, { backgroundColor: "#ff2b4e" }]}
                                            underlayColor="#cd1735"
                                            onPress={() => Remove_Post(userPost.key, true)}
                                        >
                                            {btnLoading ? (
                                                <ActivityIndicator color="#fff" size={25} />
                                            ) : (
                                                <Text style={{ color: "#fff" }}>
                                                    {CONTENT.dashboardActivePostDelete}
                                                </Text>
                                            )}
                                        </TouchableHighlight>
                                    </HStack>
                                </>
                            ) : (
                                <TouchableOpacity
                                    style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
                                    onPress={OpenCreatePost}
                                    underlayColor="transparent"
                                >
                                    <Image
                                        style={{ width: 30, height: 30 }}
                                        source={require("../../../assets/add.png")}
                                    />
                                </TouchableOpacity>
                            )}
                        </VStack>
                    )}
                </Box>

                <Box style={[Styles.wrapper, { flex: 2.4, marginBottom: 0 }]}>
                    <Text style={Styles.header}>{CONTENT.dashboardStatsticsPosts}</Text>

                    <HStack style={Styles.row}>
                        <TouchableHighlight
                            style={Styles.card}
                            underlayColor="#00B09A"
                            onPress={() =>
                                statstics.postT.Data.length &&
                                navigation.navigate("PostsHistory", {
                                    title: CONTENT.todayPosts,
                                    posts: statstics.postT.Data,
                                })
                            }
                        >
                            <LinearGradient
                                style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
                                colors={["#00B09A", "#019583", "#027A6B"]}
                            >
                                <Text style={[Styles.txtCard, Styles.cardCount]}>
                                    {statstics.postT.count}
                                </Text>
                                <Text style={[Styles.txtCard, Styles.cardDate]}>
                                    {CONTENT.dashboardStatsticsToday}
                                </Text>
                                <Text style={Styles.txtCard}>{CONTENT.dashboardStatsticsPosts}</Text>
                            </LinearGradient>
                        </TouchableHighlight>

                        <TouchableHighlight
                            style={Styles.card}
                            underlayColor="#6711B7"
                            onPress={() =>
                                statstics.postW.Data.length &&
                                navigation.navigate("PostsHistory", {
                                    title: CONTENT.weekPosts,
                                    posts: statstics.postW.Data,
                                })
                            }
                        >
                            <LinearGradient
                                style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
                                colors={["#6711B7", "#5709A0", "#470089"]}
                            >
                                <Text style={[Styles.txtCard, Styles.cardCount]}>
                                    {statstics.postW.count}
                                </Text>
                                <Text style={[Styles.txtCard, Styles.cardDate]}>
                                    {CONTENT.dashboardStatsticsWeek}
                                </Text>
                                <Text style={Styles.txtCard}>{CONTENT.dashboardStatsticsPosts}</Text>
                            </LinearGradient>
                        </TouchableHighlight>
                    </HStack>

                    <TouchableHighlight
                        style={Styles.card}
                        underlayColor="#1785F5"
                        onPress={() =>
                            statstics.postTo.Data.length &&
                            navigation.navigate("PostsHistory", {
                                title: CONTENT.totlaPosts,
                                posts: statstics.postTo.Data,
                            })
                        }
                    >
                        <LinearGradient
                            style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
                            colors={["#1785F5", "#0C69C7", "#004C99"]}
                        >
                            <Text style={[Styles.txtCard, Styles.cardCount]}>{statstics.postTo.count}</Text>
                            <Text style={[Styles.txtCard, Styles.cardDate]}>
                                {CONTENT.dashboardStatsticsTotal}
                            </Text>
                            <Text style={Styles.txtCard}>{CONTENT.dashboardStatsticsPosts}</Text>
                        </LinearGradient>
                    </TouchableHighlight>

                    <HStack style={Styles.row}>
                        <TouchableHighlight
                            style={Styles.card}
                            underlayColor="#00B06A"
                            onPress={() =>
                                orders.done.Data.length &&
                                navigation.navigate("OrdersHistory", {
                                    title: CONTENT.deliverdOrders,
                                    status: true,
                                    orders: orders.done.Data,
                                })
                            }
                        >
                            <LinearGradient
                                style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
                                colors={["#00B06A", "#00955B", "#007A4B"]}
                            >
                                <Text style={[Styles.txtCard, Styles.cardCount]}>{orders.done.count}</Text>
                                <Text style={[Styles.txtCard, Styles.cardDate]}>
                                    {CONTENT.dashboardStatsticsDeliverd}
                                </Text>
                                <Text style={Styles.txtCard}>{CONTENT.dashboardStatsticsOrders}</Text>
                            </LinearGradient>
                        </TouchableHighlight>

                        <TouchableHighlight
                            style={Styles.card}
                            underlayColor="#FF2763"
                            onPress={() =>
                                orders.cancled.Data.length &&
                                navigation.navigate("OrdersHistory", {
                                    title: CONTENT.cancledOrders,
                                    status: false,
                                    orders: orders.cancled.Data,
                                })
                            }
                        >
                            <LinearGradient
                                style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
                                colors={["#FF2763", "#D01448", "#A1002C"]}
                            >
                                <Text style={[Styles.txtCard, Styles.cardCount]}>{orders.cancled.count}</Text>
                                <Text style={[Styles.txtCard, Styles.cardDate]}>
                                    {CONTENT.dashboardStatsticsCancled}
                                </Text>
                                <Text style={Styles.txtCard}>{CONTENT.dashboardStatsticsOrders}</Text>
                            </LinearGradient>
                        </TouchableHighlight>
                    </HStack>
                </Box>
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
            initialRouteName="MAIN"
            screenOptions={{
                headerShown: false,
                gestureEnabled: true,
                gestureDirection: "horizontal",
                gestureResponseDistance: 150,
                detachPreviousScreen: false,
                transitionSpec: {
                    open: config,
                    close: config,
                },
                cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
            }}
        >
            <Stack.Screen name="MAIN" component={MAIN} />
            <Stack.Screen name="PostsHistory" component={PostsHistory} />
            <Stack.Screen name="OrdersHistory" component={OrdersHistory} />
            <Stack.Screen
                name="CreatePost"
                component={CreatePost}
                options={{ cardStyleInterpolator: CardStyleInterpolators.forFadeFromBottomAndroid }}
            />
            <Stack.Screen name="PostInfo" component={PostInfo} />
            <Stack.Screen name="OpenProfile" component={OpenProfile} />
        </Stack.Navigator>
    );
};
export default Dashboard;
