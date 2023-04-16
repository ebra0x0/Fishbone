import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    View,
    Text,
    Image,
    FlatList,
    ActivityIndicator,
    TouchableOpacity,
    RefreshControl,
} from "react-native";
import Styles from "./Styles";
import firestore from "@react-native-firebase/firestore";
import { createStackNavigator } from "@react-navigation/stack";
import { Ionicons } from "@expo/vector-icons";
import ScreenHeader from "../../Components/ScreenHeader/ScreenHeader";
import OpenProfile from "../OpenProfile/OpenProfile";
import GetDirections from "../../Components/GetDirections";
import Translations from "../../Languages";
import SendNotification from "../../Components/SendNotification";
import { Toast } from "native-base";
import ALert from "../../Components/Alert/Alert";

export default () => {
    const styles = Styles();
    const { data, theme } = useSelector((state) => state.user);
    const [Orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [lastOrder, setLastOrder] = useState(null);
    const [hasPindingOrders, setHasPindingOrders] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    const limit = 10;
    const $Users_Ref = firestore().collection("users");
    const $User_Ref = firestore().collection("users").doc(data?.id);
    const $Orders_Ref = firestore().collection("users").doc(data?.id).collection("orders");

    const Stack = createStackNavigator();
    const CONTENT = {
        notfTitle: Translations().t("notfTitle"),
        notfDirections: Translations().t("notfDirections"),
        notfSubmit: Translations().t("notfSubmit"),
        Now: Translations().t("Now"),
    };

    useEffect(() => {
        Fetch();
    }, []);

    //Functions

    const __Get_Elapsed__ = (date) => {
        if (date) {
            const currDate = new Date();
            const start = new Date(date.toDate());
            const elapsedTime = currDate - start;

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

    const Fetch = async () => {
        try {
            const querySnapshot = await $Orders_Ref.orderBy("date", "desc").limit(limit).get();

            if (querySnapshot.size) {
                const newOrders = [];

                querySnapshot.forEach(async (order, indx) => {
                    const { source, dest, date, accepted, delievered, submitDate, approvalDate } =
                        order.data();
                    const dateType = submitDate ? submitDate : approvalDate ? approvalDate : date;
                    (delievered || accepted == false) && order.ref.update({ seened: true });
                    accepted == undefined && setHasPindingOrders(true);

                    if (!data?.restaurant && accepted === undefined) {
                        indx + 1 == querySnapshot.size && setLoading(false);
                        return;
                    }
                    await $Users_Ref
                        .doc(data?.restaurant ? source : dest)
                        .get()
                        .then((user) => {
                            newOrders.push({
                                ...user.data(),
                                ...order.data(),
                                key: order.id,
                                elapsed: __Get_Elapsed__(dateType),
                            });
                        })
                        .catch((e) => {
                            setLoading(false);
                            console.log(e);
                        });

                    if (indx + 1 == querySnapshot.size) {
                        setOrders(newOrders);
                        setLastOrder(querySnapshot.docs[querySnapshot.size - 1]);
                        setLoading(false);
                    }
                });
            } else {
                setLoading(false);
            }
        } catch (error) {
            setLoading(false);
            console.log("Error fetching msgs:", error);
        }
    };

    const Fetch_More = async () => {
        if (loading) return;
        try {
            if (data) {
                const querySnapshot = await $Orders_Ref
                    .orderBy("date", "desc")
                    .startAfter(lastOrder)
                    .limit(limit)
                    .get();

                const newOrders = [];

                if (querySnapshot.size) {
                    console.log("got new orders");

                    querySnapshot.docs.forEach(async (order, indx) => {
                        const { source, date, accepted, delievered, submitDate, approvalDate } = order.data();
                        const dateType = submitDate ? submitDate : approvalDate ? approvalDate : date;

                        (delievered || accepted == false) && order.ref.update({ seened: true });
                        accepted == undefined && setHasPindingOrders(true);
                        if (!data?.restaurant && accepted === undefined) {
                            indx + 1 == querySnapshot.size && setLoading(false);
                            return;
                        }

                        await $Users_Ref
                            .doc(source)
                            .get()
                            .then((user) => {
                                newOrders.push({
                                    ...user.data(),
                                    ...order.data(),
                                    key: order.id,
                                    elapsed: __Get_Elapsed__(dateType),
                                });
                            })
                            .catch(() => setLoading(false));

                        if (indx + 1 == querySnapshot.size) {
                            newOrders.length && setOrders((prev) => [...prev, ...newOrders]);
                            newOrders.length && setLastOrder(querySnapshot.docs[querySnapshot.size - 1]);
                            setLoading(false);
                        }
                    });
                } else {
                    setLoading(false);
                }
            }
        } catch (e) {
            setLoading(false);
            console.log("Error fetching more orders:", e);
        }
    };

    const Approval = async (accepted, userId, orderId, postId) => {
        const timestamp = firestore.FieldValue.serverTimestamp();
        const now = firestore.Timestamp.now();

        const notificationData = {
            token: userId,
            title: `Your order has been ${accepted ? "approved" : "rejected"}`,
            msg: `${data?.Name} has ${accepted ? "approved" : "rejected"} your order ${
                accepted && "enter to see directions"
            }`,
        };
        const approvalData = {
            accepted,
            approvalDate: timestamp,
        };
        if (!accepted) {
            approvalData.delievered = false;
        }

        try {
            // Send approval for user
            await $Users_Ref.doc(userId).collection("orders").doc(orderId).update(approvalData);

            SendNotification(notificationData);

            // Update public restaurant order
            $Orders_Ref.doc(orderId).update(approvalData);
            // Update post restaurant order
            $User_Ref.collection("posts").doc(postId).collection("orders").doc(orderId).update(approvalData);

            const newOrders = [];
            Orders.forEach((order) => {
                if (order.key == orderId) {
                    newOrders.push({ ...order, ...approvalData, approvalDate: now, elapsed: CONTENT.Now });
                } else {
                    newOrders.push(order);
                }
            });
            setOrders(newOrders);
            setHasPindingOrders(false);
        } catch (e) {
            console.log(e);
        }
    };

    const Refuse_All = () => {
        const timestamp = firestore.FieldValue.serverTimestamp();
        const now = firestore.Timestamp.now();
        const refuseData = { accepted: false, delievered: false, approvalDate: timestamp };

        const notificationData = {
            title: `Your order rejected`,
            msg: `Your order has been rejected by ${data?.Name}
          }`,
        };

        // Refuse all pinding orders
        Orders.forEach(async (order) => {
            const { key, id, accepted, postId, Token } = order;

            if (accepted == undefined) {
                // Refuse user order
                await $Users_Ref.doc(id).collection("orders").doc(key).update(refuseData);

                SendNotification({ ...notificationData, token: Token });

                // Refuse public restaurant order
                $Orders_Ref.doc(key).update(refuseData);

                // Refuse post restaurant order
                $User_Ref.collection("posts").doc(postId).collection("orders").doc(key).update(refuseData);

                // Update order state
                const newOrders = [];
                Orders.forEach((order) => {
                    if (order.accepted == undefined) {
                        newOrders.push({ ...order, ...refuseData, approvalDate: now });
                    } else {
                        newOrders.push(order);
                    }
                });
                setOrders(newOrders);
                setHasPindingOrders(false);
                Toast.show({
                    render: () => {
                        return <ALert status="success" msg="All pending orders removed." />;
                    },
                    duration: 2000,
                });
            }
        });
    };

    const Submit_Order = async (orderId, userId, postId) => {
        const timestamp = firestore.FieldValue.serverTimestamp();
        const now = firestore.Timestamp.now();
        const newOrders = [];
        const submitData = { delievered: true, submitDate: timestamp };

        const notificationData = {
            token: userId,
            title: `Your order is confirmed`,
            msg: `${data?.Name} has confirmed receipt of your order
          }`,
        };

        // Submit user order
        await $Users_Ref.doc(userId).collection("orders").doc(orderId).update(submitData);

        SendNotification(notificationData);

        // Submit public restaurant order
        $Orders_Ref.doc(orderId).update(submitData);

        // Submit post restaurant order
        $User_Ref.collection("posts").doc(postId).collection("orders").doc(orderId).update(submitData);

        // Update order state
        Orders.forEach((order) => {
            order.key == orderId
                ? newOrders.push({ ...order, ...submitData, submitDate: now })
                : newOrders.push(order);
        });
        setOrders(newOrders);
    };

    const __FLATLIST_NOTS__ = ({ navigation }) => {
        const Buttons = [
            {
                show: data?.restaurant && hasPindingOrders,
                key: 1,
                name: "trash-bin-outline",
                size: 25,
                color: "#dd4c35",
                fun: Refuse_All,
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
        const HeaderTitle = (
            <Text
                style={{
                    textAlign: "left",
                    flex: 1,
                    marginLeft: 6,
                    fontSize: 30,
                    color: theme ? "#fff" : "#252525",
                    fontWeight: "bold",
                }}
            >
                {CONTENT.notfTitle}
            </Text>
        );
        const renderItem = ({ item }) => {
            return (
                <View style={styles.OrdersCont}>
                    <View style={styles.order}>
                        <View style={styles.content}>
                            <TouchableOpacity
                                style={styles.avatar}
                                onPress={() => navigation.push("OpenProfile", item)}
                            >
                                {item.photo ? (
                                    <Image
                                        style={{ width: "100%", height: "100%" }}
                                        source={{ uri: item.photo }}
                                    />
                                ) : (
                                    <Ionicons name="person" size={20} color="#2ebeff" />
                                )}
                            </TouchableOpacity>
                            <View style={styles.orderInfo}>
                                <Text style={styles.srcName}>{item.Name}</Text>
                                <View style={styles.dateCont}>
                                    <Ionicons name="time-outline" size={12} color="#848484" />
                                    <Text style={styles.date}>{item.elapsed}</Text>
                                </View>
                            </View>
                            <View style={styles.approvalBtnsCont}>
                                {data?.restaurant &&
                                    (item.accepted === undefined ? (
                                        <>
                                            <TouchableOpacity
                                                style={[
                                                    styles.approvalBtn,
                                                    { backgroundColor: "#dd4c35", marginLeft: 0 },
                                                ]}
                                                underlayColor="transparent"
                                                onPress={() =>
                                                    Approval(false, item.id, item.key, item.postId)
                                                }
                                            >
                                                <Ionicons name="close-outline" size={25} color="#fff" />
                                            </TouchableOpacity>
                                            <TouchableOpacity
                                                style={[styles.approvalBtn, { backgroundColor: "#0dbc79" }]}
                                                underlayColor="transparent"
                                                onPress={() => Approval(true, item.id, item.key, item.postId)}
                                            >
                                                <Ionicons name="checkmark-outline" size={25} color="#fff" />
                                            </TouchableOpacity>
                                        </>
                                    ) : item.delievered ? (
                                        <Ionicons name="checkmark-done-circle" size={30} color="#4bbc83" />
                                    ) : item.accepted ? (
                                        <Ionicons name="checkmark-circle" size={30} color="#4bbc83" />
                                    ) : (
                                        <Ionicons name="close-circle" size={30} color="#ef4d4d" />
                                    ))}

                                {!data?.restaurant &&
                                    (item.delievered ? (
                                        <Ionicons name="checkmark-done-circle" size={30} color="#4bbc83" />
                                    ) : item.accepted ? (
                                        <Ionicons name="checkmark-circle" size={30} color="#4bbc83" />
                                    ) : (
                                        <Ionicons name="close-circle" size={30} color="#ef4d4d" />
                                    ))}
                            </View>
                        </View>
                        {item.accepted &&
                            !item.delievered &&
                            (data?.restaurant ? (
                                <TouchableOpacity
                                    style={styles.orderFooter}
                                    onPress={() => {
                                        Submit_Order(item.key, item.id, item.postId);
                                    }}
                                >
                                    <Text
                                        style={{
                                            fontSize: 16,
                                            fontWeight: "bold",
                                            color: "#fff",
                                            marginRight: 7,
                                        }}
                                    >
                                        {CONTENT.notfSubmit}
                                    </Text>
                                </TouchableOpacity>
                            ) : (
                                <TouchableOpacity
                                    style={styles.orderFooter}
                                    onPress={() => {
                                        GetDirections(item.id);
                                    }}
                                >
                                    <Text
                                        style={{
                                            fontSize: 16,
                                            fontWeight: "bold",
                                            color: "#fff",
                                            marginRight: 7,
                                        }}
                                    >
                                        {CONTENT.notfDirections}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                    </View>
                </View>
            );
        };
        const renderEmptyList = () => {
            if (!Orders.length) {
                return (
                    <View style={{ alignItems: "center", justifyContent: "center" }}>
                        <Image
                            style={{ width: 100, height: 100, marginBottom: 10 }}
                            source={require("../../../assets/emptyMsg.png")}
                        />
                    </View>
                );
            } else {
                return null;
            }
        };
        const onRefresh = async () => {
            setRefreshing(true);
            await Fetch();
            setRefreshing(false);
        };
        return (
            <View style={styles.Container}>
                <ScreenHeader title={HeaderTitle} btns={HeaderButtons} />
                {loading ? (
                    <ActivityIndicator style={{ flex: 1 }} size={50} color={"#1785f5"} />
                ) : (
                    <FlatList
                        style={styles.OrdersView}
                        data={Orders}
                        renderItem={renderItem}
                        keyExtractor={(item) => item.key}
                        onEndReached={Fetch_More}
                        onEndReachedThreshold={0.5}
                        showsVerticalScrollIndicator={false}
                        refreshControl={
                            <RefreshControl
                                colors={["#1785f5"]}
                                progressBackgroundColor={theme ? "#001837" : "#ffffff"}
                                progressViewOffset={30}
                                refreshing={refreshing}
                                onRefresh={onRefresh}
                            />
                        }
                        ListEmptyComponent={renderEmptyList}
                        contentContainerStyle={
                            !Orders.length
                                ? { flex: 1, justifyContent: "center", alignItems: "center" }
                                : false
                        }
                    />
                )}
            </View>
        );
    };

    return (
        <Stack.Navigator screenOptions={{ headerShown: false, presentation: "transparentModal" }}>
            <Stack.Screen name="Main" component={__FLATLIST_NOTS__} />
            <Stack.Screen name="OpenProfile" component={OpenProfile} />
        </Stack.Navigator>
    );
};
