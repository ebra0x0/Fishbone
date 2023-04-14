import React, { useEffect, useState } from "react";
import { View, Text, Image, TouchableOpacity, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSelector } from "react-redux";
import firestore from "@react-native-firebase/firestore";
import styles from "./styles";
import { Toast } from "native-base";
import ALert from "../../Components/Alert/Alert";
import SendNotification from "../../Components/SendNotification";
import Translations from "../../Languages";

const PostInfo = ({ route, navigation }) => {
    const { data, theme } = useSelector((state) => state.user);
    const { postImage, photo, Name, date, foodType, postDesc, key, id, closedIn } = route.params;
    const [pindingOrder, setPindingOrder] = useState(null);
    const [loading, setLoading] = useState(false);
    const Styles = styles();

    const $Posts_Ref = firestore().collection("posts");
    const $Users_Ref = firestore().collection("users");
    const $User_Ref = firestore().collection("users").doc(data?.id);

    const CONTENT = {
        PostSendBtn: Translations().t("PostSendBtn"),
    };

    useEffect(() => {
        !data?.restaurant && Pending_Orders();
    }, []);

    const Check_Post_Expired = (closedDate) => {
        const now = new Date(Date.now());
        const exDate = new Date(closedDate?.toDate());

        if (exDate.getTime() <= now.getTime()) {
            return true;
        } else {
            return false;
        }
    };

    const Send_Order = async () => {
        try {
            const check = Check_Post_Expired(closedIn);
            const RestToken = await $Users_Ref
                .doc(id)
                .get()
                .then((query) => query.data().Token);

            if (!check) {
                setLoading(true);
                await $Posts_Ref
                    .doc(key)
                    .get()
                    .then(async (post) => {
                        if (post.exists) {
                            const timestamp = firestore.FieldValue.serverTimestamp();
                            const orderData = {
                                source: data?.id,
                                dest: id,
                                date: timestamp,
                                postId: key,
                            };
                            // create new order
                            await $User_Ref
                                .collection("orders")
                                .add(orderData)
                                .then(async (order) => {
                                    // Add order for restaurant post orders
                                    await $Users_Ref
                                        .doc(id)
                                        .collection("posts")
                                        .doc(key)
                                        .collection("orders")
                                        .doc(order.id)
                                        .set(orderData);

                                    // Add order for restaurant orders
                                    await $Users_Ref
                                        .doc(id)
                                        .collection("orders")
                                        .doc(order.id)
                                        .set(orderData);

                                    setLoading(false);
                                    SendNotification({
                                        token: RestToken,
                                        title: "New Order",
                                        msg: `You got a new order from "${data?.Name}" check it out`,
                                    });
                                    Toast.show({
                                        render: () => {
                                            return <ALert status="success" msg="Order sent successfully." />;
                                        },
                                        duration: 2000,
                                    });
                                });
                        } else {
                            setLoading(false);

                            Toast.show({
                                render: () => {
                                    return <ALert status="error" msg="This post has been removed !" />;
                                },
                                duration: 2000,
                            });
                        }
                    });
            } else {
                Toast.show({
                    render: () => {
                        return <ALert status="error" msg="This post is expired" />;
                    },
                    duration: 2000,
                });
            }
        } catch (e) {
            console.log(e);
            setLoading(false);
        }
    };

    const Pending_Orders = () => {
        $User_Ref.collection("orders").onSnapshot((orders) => {
            if (orders) {
                orders.forEach((order) => {
                    const { delievered } = order.data();
                    if (delievered === undefined) {
                        setPindingOrder(order.data());
                    }
                });
            } else {
                setPindingOrder(null);
            }
        });
    };

    return (
        <View style={Styles.container}>
            <TouchableOpacity style={Styles.arrowView} onPress={() => navigation.goBack()}>
                <Ionicons name="arrow-back" size={25} color="#fff" />
            </TouchableOpacity>
            <View style={Styles.imageView}>
                <Image style={{ width: "100%", height: "100%" }} source={{ uri: postImage }} />
                <View style={Styles.restTitle}>
                    <Image style={{ width: 60, height: 60, borderRadius: 60 / 2 }} source={{ uri: photo }} />
                    <Text style={{ fontSize: 22, fontWeight: "bold", color: "#fff", marginLeft: 5 }}>
                        {Name}
                    </Text>
                </View>
            </View>

            <View style={Styles.wrapper}>
                <View style={Styles.postData}>
                    <View style={Styles.row}>
                        <Ionicons name="time-outline" size={15} color="#7a7a7a" />
                        <Text style={{ color: theme ? "#fff" : "#252525", marginLeft: 6 }}>
                            {date.toDate().toDateString()}
                        </Text>
                    </View>
                </View>

                <View style={Styles.postContent}>
                    <Text style={Styles.postTitle}>{foodType}</Text>
                    <Text style={{ color: "#7a7a7a", marginLeft: 2 }}>{postDesc}</Text>
                </View>
            </View>

            {!data?.restaurant && !pindingOrder ? (
                <TouchableOpacity style={Styles.btn} disabled={loading} onPress={Send_Order}>
                    {loading ? (
                        <ActivityIndicator size={30} color="#fff" />
                    ) : (
                        <Text style={{ fontSize: 16, color: "#fff" }}>{CONTENT.PostSendBtn}</Text>
                    )}
                </TouchableOpacity>
            ) : (
                pindingOrder?.postId == key && (
                    <View style={[Styles.btn, { backgroundColor: "#0dbc7912" }]}>
                        <Ionicons name="checkmark-outline" size={20} color="#0dbc79" />
                    </View>
                )
            )}
        </View>
    );
};
export default PostInfo;
