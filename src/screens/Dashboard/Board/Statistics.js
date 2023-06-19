import React, { useEffect, useState, memo } from "react";
import { Text, TouchableHighlight, View } from "react-native";
import { useSelector } from "react-redux";
import firestore from "@react-native-firebase/firestore";
import { Box, HStack } from "native-base";
import { LinearGradient } from "expo-linear-gradient";
import styles from "./styles";
import Translations from "../../../Languages";
import { useNavigation } from "@react-navigation/native";

const Statistics = () => {
    const { data } = useSelector((state) => state.user);
    const Styles = styles();

    const [posts, setPosts] = useState({
        todays: 0,
        weeks: 0,
        total: 0,
    });
    const [orders, setOrders] = useState({
        done: 0,
        cancled: 0,
    });

    const navigation = useNavigation();

    const CONTENT = {
        dashboardStatsticsToday: Translations().t("dashboardStatsticsToday"),
        dashboardStatsticsWeek: Translations().t("dashboardStatsticsWeek"),
        dashboardStatsticsTotal: Translations().t("dashboardStatsticsTotal"),
        dashboardStatsticsDeliverd: Translations().t("dashboardStatsticsDeliverd"),
        dashboardStatsticsCancled: Translations().t("dashboardStatsticsCancled"),
        dashboardStatsticsTitle: Translations().t("dashboardStatsticsTitle"),
        dashboardStatsticsOrders: Translations().t("dashboardStatsticsOrders"),
        dashboardStatsticsPosts: Translations().t("dashboardStatsticsPosts"),
        todayPosts: Translations().t("todayPosts"),
        weekPosts: Translations().t("weekPosts"),
        totlaPosts: Translations().t("totlaPosts"),
        deliverdOrders: Translations().t("deliverdOrders"),
        cancledOrders: Translations().t("cancledOrders"),
    };

    const $User_Ref = firestore().collection("users").doc(data?.id);

    useEffect(() => {
        fetchPostsCount();
        fetchOrdersCount();
    }, []);

    const fetchPostsCount = () => {
        try {
            const postsQuery = $User_Ref.collection("posts");

            postsQuery.onSnapshot((querySnapshot) => {
                let Today = 0;
                let Weeks = 0;
                let Total = querySnapshot?.size;

                querySnapshot?.forEach(async (post) => {
                    const { date } = post.data();

                    const Now = new Date();
                    const Elapsed = parseInt((Now - new Date(date?.toDate())) / (1000 * 60 * 60 * 24));

                    if (Elapsed === 0) {
                        Today = Today + 1;
                        Weeks = Weeks + 1;
                    } else if (Elapsed <= 7) {
                        Weeks = Weeks + 1;
                    }
                });
                setPosts((prev) => ({
                    ...prev,
                    todays: Today,
                    weeks: Weeks,
                    total: Total,
                }));
            });
        } catch (e) {
            console.log(e);
        }
    };
    const fetchOrdersCount = async () => {
        try {
            const doneQuery = $User_Ref.collection("orders").where("delievered", "==", true);

            doneQuery.onSnapshot((querySnapshot) => {
                let DoneCount = querySnapshot?.size;
                setOrders((prev) => {
                    return { ...prev, done: DoneCount };
                });
            });

            const canceledQuery = $User_Ref.collection("orders").where("accepted", "==", false);

            canceledQuery.onSnapshot((querySnapshot) => {
                let CanceledCount = querySnapshot?.size;
                setOrders((prev) => {
                    return { ...prev, cancled: CanceledCount };
                });
            });
        } catch (e) {
            console.log(e);
        }
    };
    return (
        <Box style={[Styles.wrapper, { flex: 2.4, marginBottom: 0 }]}>
            <Text style={Styles.header}>{CONTENT.dashboardStatsticsTitle}</Text>

            <HStack style={Styles.row}>
                <TouchableHighlight
                    style={Styles.card}
                    underlayColor="#00B09A"
                    onPress={() =>
                        posts.todays &&
                        navigation.navigate("PostsHistory", {
                            title: CONTENT.todayPosts,
                            type: "t",
                        })
                    }
                >
                    <LinearGradient
                        style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
                        colors={["#00B09A", "#019583", "#027A6B"]}
                    >
                        <Text style={[Styles.txtCard, Styles.cardCount]}>{posts.todays}</Text>
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
                        posts.weeks &&
                        navigation.navigate("PostsHistory", {
                            title: CONTENT.weekPosts,
                            type: "w",
                        })
                    }
                >
                    <LinearGradient
                        style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
                        colors={["#6711B7", "#5709A0", "#470089"]}
                    >
                        <Text style={[Styles.txtCard, Styles.cardCount]}>{posts.weeks}</Text>
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
                    posts.total &&
                    navigation.navigate("PostsHistory", {
                        title: CONTENT.totlaPosts,
                        type: "a",
                    })
                }
            >
                <LinearGradient
                    style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
                    colors={["#1785F5", "#0C69C7", "#004C99"]}
                >
                    <Text style={[Styles.txtCard, Styles.cardCount]}>{posts.total}</Text>
                    <Text style={[Styles.txtCard, Styles.cardDate]}>{CONTENT.dashboardStatsticsTotal}</Text>
                    <Text style={Styles.txtCard}>{CONTENT.dashboardStatsticsPosts}</Text>
                </LinearGradient>
            </TouchableHighlight>

            <HStack style={Styles.row}>
                <TouchableHighlight
                    style={Styles.card}
                    underlayColor="#00B06A"
                    onPress={() =>
                        orders.done &&
                        navigation.navigate("OrdersHistory", {
                            title: CONTENT.deliverdOrders,
                            status: true,
                        })
                    }
                >
                    <LinearGradient
                        style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
                        colors={["#00B06A", "#00955B", "#007A4B"]}
                    >
                        <Text style={[Styles.txtCard, Styles.cardCount]}>{orders.done}</Text>
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
                        orders.cancled &&
                        navigation.navigate("OrdersHistory", {
                            title: CONTENT.cancledOrders,
                            status: false,
                        })
                    }
                >
                    <LinearGradient
                        style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
                        colors={["#FF2763", "#D01448", "#A1002C"]}
                    >
                        <Text style={[Styles.txtCard, Styles.cardCount]}>{orders.cancled}</Text>
                        <Text style={[Styles.txtCard, Styles.cardDate]}>
                            {CONTENT.dashboardStatsticsCancled}
                        </Text>
                        <Text style={Styles.txtCard}>{CONTENT.dashboardStatsticsOrders}</Text>
                    </LinearGradient>
                </TouchableHighlight>
            </HStack>
        </Box>
    );
};

export default memo(Statistics);
