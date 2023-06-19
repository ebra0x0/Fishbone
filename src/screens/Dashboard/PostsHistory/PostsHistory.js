import React, { useEffect, useState, memo } from "react";
import { View, Text, FlatList, Image } from "react-native";
import styles from "./styles";
import ScreenHeader from "../../../Components/ScreenHeader/ScreenHeader";
import Translations from "../../../Languages";
import firestore from "@react-native-firebase/firestore";
import { useSelector } from "react-redux";
import { HStack, Skeleton } from "native-base";
import { ActivityIndicator } from "react-native";

const PostsHistory = ({ route }) => {
    const { data, theme } = useSelector((state) => state.user);
    const [posts, setPosts] = useState([]);
    const [limit, setLimit] = useState(10);
    const [lastPost, setLastPost] = useState(0);
    const [noMore, setNoMore] = useState(false);
    const [loadingFooter, setLoadingFooter] = useState(false);
    const [days, setDays] = useState(1);
    const Styles = styles();
    const { type, title } = route.params;

    useEffect(() => {
        switch (type) {
            case "t":
                Fetch(1);
                break;
            case "w":
                Fetch(7);
                setDays(7);
                break;
            case "a":
                Fetch(99);
                setDays(99);
                break;
        }
    }, []);

    const CONTENT = {
        dashboardStatsticsOrders: Translations().t("dashboardStatsticsOrders"),
    };
    const $User_Ref = firestore().collection("users").doc(data?.id);

    const Fetch = async (days) => {
        const daysToSubtract = days;
        const Now = firestore.Timestamp.now().toDate();

        const desiredDate = new Date(Now);
        desiredDate.setDate(desiredDate.getDate() - daysToSubtract);

        const Timestamp = firestore.Timestamp.fromDate(desiredDate);

        const querySnapshot = await $User_Ref
            .collection("posts")
            .orderBy("date", "desc")
            .where("date", ">", Timestamp)
            .limit(limit)
            .get();

        querySnapshot.size < limit && setNoMore(true);

        const Promises = querySnapshot.docs.map(async (post) => {
            const { date, postImage, foodType, postDesc, active } = post.data();

            const postCountSnapshot = await $User_Ref
                .collection("orders")
                .where("postId", "==", post.id)
                .get();
            const postCount = postCountSnapshot.size;

            return {
                key: post.id,
                active,
                date,
                postImage,
                foodType,
                postDesc,
                ordersCount: postCount,
            };
        });
        const finalPosts = await Promise.all(Promises);
        if (finalPosts.length == querySnapshot.size) {
            setLastPost(querySnapshot.docs[querySnapshot.size - 1]);
            setPosts(finalPosts);
        }
    };
    const fetchMore = async () => {
        if (loadingFooter) {
            return;
        }
        setLoadingFooter(true);
        const daysToSubtract = days;
        const Now = firestore.Timestamp.now().toDate();

        const desiredDate = new Date(Now);
        desiredDate.setDate(desiredDate.getDate() - daysToSubtract);

        const Timestamp = firestore.Timestamp.fromDate(desiredDate);

        const querySnapshot = await $User_Ref
            .collection("posts")
            .where("date", ">", Timestamp)
            .orderBy("date", "desc")
            .startAfter(lastPost)
            .limit(limit)
            .get();

        if (querySnapshot.size) {
            const Promises = querySnapshot.docs.map(async (post) => {
                const { date, postImage, foodType, postDesc, active } = post.data();

                const postCountSnapshot = await $User_Ref
                    .collection("orders")
                    .where("postId", "==", post.id)
                    .get();
                const postCount = postCountSnapshot.size;

                return {
                    key: post.id,
                    active,
                    date,
                    postImage,
                    foodType,
                    postDesc,
                    ordersCount: postCount,
                };
            });
            const finalPosts = await Promise.all(Promises);
            if (finalPosts.length == querySnapshot.size) {
                setLastPost(querySnapshot.docs[querySnapshot.size - 1]);
                setPosts((prev) => [...prev, ...finalPosts]);
                setLoadingFooter(false);
            }
        } else {
            setNoMore(true);
            setLoadingFooter(false);
        }
    };
    const renderEmptyComponent = () => {
        const emptyItems = [1, 2, 3, 4, 5, 6, 7];

        return emptyItems.map((_, indx) => (
            <View key={indx} style={Styles.post}>
                <Skeleton flex={2} startColor={theme ? "darkBlue.800" : "darkBlue.100"} />

                <View style={{ flex: 1, gap: 10, paddingVertical: 5 }}>
                    <Skeleton.Text
                        px={"2"}
                        w={120}
                        lines={1}
                        startColor={theme ? "darkBlue.800" : "darkBlue.100"}
                    />
                    <Skeleton.Text px={"2"} lines={1} startColor={theme ? "darkBlue.800" : "darkBlue.100"} />
                    <HStack justifyContent={"space-between"}>
                        <Skeleton.Text
                            px={"2"}
                            w={70}
                            lines={1}
                            startColor={theme ? "darkBlue.800" : "darkBlue.100"}
                        />
                        <Skeleton.Text
                            px={"2"}
                            w={170}
                            lines={1}
                            startColor={theme ? "darkBlue.800" : "darkBlue.100"}
                        />
                    </HStack>
                </View>
            </View>
        ));
    };
    const renderItems = ({ item }) => {
        return (
            <View style={Styles.post}>
                <View style={{ flex: 1 }}>
                    <Image style={{ flex: 1.5 }} source={{ uri: item.postImage }} />
                    <View style={{ flex: 1, paddingHorizontal: 10 }}>
                        <Text style={Styles.postHeader}>{item.foodType}</Text>
                        <Text style={{ color: "#a0a0a0" }} numberOfLines={2} ellipsizeMode="tail">
                            {item.postDesc}
                        </Text>
                    </View>
                    <View style={Styles.postFooter}>
                        <Text style={Styles.postOrdersCount}>
                            {CONTENT.dashboardStatsticsOrders}:
                            <Text style={{ color: "#0dbc79", fontWeight: "bold" }}> {item.ordersCount} </Text>
                        </Text>
                        <Text style={Styles.postDate}>{item.date?.toDate().toDateString()}</Text>
                    </View>
                    {item.active && <View style={Styles.actvBuble} />}
                </View>
            </View>
        );
    };
    const Loading_Footer = () => {
        return (
            <Text
                style={{
                    flex: 1,
                    height: 50,
                    textAlign: "center",
                }}
            >
                <ActivityIndicator size={25} color="#1785f5" />
            </Text>
        );
    };
    const HeaderTitle = title;

    return (
        <View style={Styles.container}>
            <ScreenHeader arrow={true} title={HeaderTitle} />
            <FlatList
                style={{ paddingHorizontal: 10, paddingTop: 10 }}
                data={posts}
                renderItem={renderItems}
                ListEmptyComponent={renderEmptyComponent}
                keyExtractor={(item) => item.key}
                onEndReached={!noMore && fetchMore}
                onEndReachedThreshold={0.01}
                ListFooterComponent={loadingFooter ? Loading_Footer : <View style={{ height: 20 }} />}
            />
        </View>
    );
};

export default memo(PostsHistory);
