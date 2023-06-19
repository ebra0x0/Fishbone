import { useCallback, useState, memo, useEffect } from "react";
import { useSelector } from "react-redux";
import {
    View,
    Text,
    Image,
    FlatList,
    ActivityIndicator,
    TouchableOpacity,
    RefreshControl,
    TouchableHighlight,
    Linking,
} from "react-native";
import Animated, {
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming,
} from "react-native-reanimated";
import firestore from "@react-native-firebase/firestore";
import { Toast } from "native-base";
import Styles from "./Styles";
import { Ionicons } from "@expo/vector-icons";
import Translations from "../../../Languages";
import ScreenHeader from "../../../Components/ScreenHeader/ScreenHeader";
import Avatar from "../../../Components/Avatar/Avatar";
import TOAST from "../../../Components/TOAST/TOAST";
import GetDirections from "../../../Components/GetDirections";
import SendNotification from "../../../Components/SendNotification";

const FlatlistOrders = ({ route }) => {
    const styles = Styles();
    const { data, lang, theme } = useSelector((state) => state.user);
    const [Orders, setOrders] = useState([]);
    const [newOrders, setNewOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingFooter, setLoadingFooter] = useState(false);
    const [noMore, setNoMore] = useState(false);
    const [lastOrder, setLastOrder] = useState(0);
    const [pendingOrders, setPendingOrders] = useState(0);

    const [refreshing, setRefreshing] = useState(false);
    const _AnimScale = useSharedValue(1);
    const AnimStyle = useAnimatedStyle(() => {
        return {
            transform: [{ scale: _AnimScale.value }],
        };
    });

    const $Users_Ref = firestore().collection("users");
    const $Orders_Ref = firestore().collection("users").doc(data?.id).collection("orders");

    const limit = 10;

    const CONTENT = {
        notfTitle: Translations().t("notfTitle"),
        notfDirections: Translations().t("notfDirections"),
        notfSubmit: Translations().t("notfSubmit"),
        Now: Translations().t("Now"),
    };

    const Buttons = [
        {
            show: data?.restaurant && pendingOrders > 1 ? true : false,
            key: 1,
            name: require("../../../../assets/delete-list.png"),
            size: 30,
            fun: () => Refuse_All(),
        },
    ];
    const HeaderButtons = Buttons.map((btn) => {
        if (!btn.show) {
            return (
                <TouchableOpacity style={{ marginLeft: 15 }} key={btn.key} onPress={() => btn.fun()}>
                    <Image style={{ width: btn.size, height: btn.size }} source={btn.name} />
                </TouchableOpacity>
            );
        }
    });
    const HeaderTitle = CONTENT.notfTitle;

    useEffect(() => {
        Fetch();
    }, []);

    useEffect(() => {
        if (route.params?.New) {
            !loading && Fetch();
        }
    }, [route.params]);

    useEffect(() => {
        newOrders.length && Orders.length && Animate();
    }, [newOrders]);
    useEffect(() => {
        if (Orders.length) {
            const pending = Orders.filter((order) => order.accepted === undefined);
            setPendingOrders(pending.length);
        } else {
            setPendingOrders(0);
        }
    }, [Orders]);

    const Fetch = async () => {
        try {
            const ordersData = [];
            const New = [];

            setLoading(true);
            const querySnapshot = await $Orders_Ref.orderBy("date", "desc").limit(limit).get();

            if (querySnapshot.size) {
                const $lastOrder = querySnapshot.docs[querySnapshot.docs.length - 1];
                querySnapshot.forEach((order, indx) => {
                    const { date, accepted, delievered, submitDate, approvalDate, seened } = order.data();

                    const dateType = submitDate ? submitDate : approvalDate ? approvalDate : date;

                    delievered !== undefined && order.ref.update({ seened: true });

                    if (!data?.restaurant && accepted === undefined) {
                        return;
                    } else if (!seened) {
                        New.push({ key: order.id });
                    }

                    ordersData.push({
                        ...order.data(),
                        key: order.id,
                        elapsed: __Get_Elapsed__(dateType),
                    });
                    if (indx + 1 === querySnapshot.size) {
                        setOrders(ordersData);
                        setLastOrder($lastOrder);
                        setNewOrders(New);
                        setLoading(false);
                    }
                });
            } else {
                setOrders([]);
                setLoading(false);
            }
        } catch (error) {
            console.log("Error fetching msgs:", error);
        }
    };
    const Fetch_More = async () => {
        if (loading || loadingFooter) return;
        try {
            const newOrders = [];
            const New = [];

            setLoadingFooter(true);
            const querySnapshot = await $Orders_Ref
                .orderBy("date", "desc")
                .startAfter(lastOrder)
                .limit(limit)
                .get();

            if (querySnapshot.size) {
                const $lastOrder = querySnapshot.docs[querySnapshot.docs.length - 1];
                querySnapshot.docs.forEach((order, indx) => {
                    const { date, accepted, delievered, submitDate, approvalDate, seened } = order.data();

                    const dateType = submitDate ? submitDate : approvalDate ? approvalDate : date;

                    delievered !== undefined && order.ref.update({ seened: true });

                    if (!data?.restaurant && accepted === undefined) {
                        return;
                    } else if (!seened) {
                        New.push({ key: order.id });
                    }

                    newOrders.push({
                        ...order.data(),
                        key: order.id,
                        elapsed: __Get_Elapsed__(dateType),
                    });
                    if (indx + 1 === querySnapshot.size) {
                        setOrders((prev) => [...prev, ...newOrders]);
                        setLastOrder($lastOrder);
                        setNewOrders(New);
                        setLoadingFooter(false);
                    }
                });
            } else {
                setNoMore(true);
                setLoadingFooter(false);
            }
        } catch (e) {
            console.log("Error fetching more orders:", e);
        }
    };
    const renderUserItems = ({ item }) => {
        const isNew = newOrders.find((New) => (New.key === item.key ? true : false));
        return (
            <View style={styles.OrdersCont}>
                <View style={styles.order}>
                    <View style={styles.content}>
                        <Avatar
                            profile={{ data: { id: item.dest, Name: item.Name, photo: item.photo } }}
                            style={styles.avatar}
                        />
                        <View style={styles.orderInfo}>
                            <Text style={styles.srcName}>{item.Name}</Text>
                            <View style={styles.dateCont}>
                                <Ionicons name="time-outline" size={12} color="#848484" />
                                <Text style={styles.date}>{item.elapsed}</Text>
                            </View>
                        </View>
                        <View style={styles.approvalBtnsCont}>
                            {item.delievered ? (
                                <Animated.View style={isNew && AnimStyle}>
                                    <Ionicons name="checkmark-circle" size={30} color="#4bbc83" />
                                </Animated.View>
                            ) : item.accepted ? (
                                <Animated.View style={isNew && AnimStyle}>
                                    <Ionicons name="checkmark" size={25} color="#4bbc83" />
                                </Animated.View>
                            ) : (
                                <Animated.View style={isNew && AnimStyle}>
                                    <Ionicons name="close-circle" size={30} color="#ef4d4d" />
                                </Animated.View>
                            )}
                        </View>
                    </View>
                    {item.accepted && !item.delievered && (
                        <View style={{ flexDirection: "row" }}>
                            <TouchableHighlight
                                style={[styles.orderFooter, { backgroundColor: "transparent" }]}
                                onPress={() => {
                                    GetDirections(item.dest);
                                }}
                                underlayColor="#0027584d"
                            >
                                <View style={{ flexDirection: "row", alignItems: "center" }}>
                                    <Ionicons name="navigate" size={15} color="#1785f5" />
                                    <Text
                                        style={{
                                            color: "#1785f5",
                                            marginLeft: 4,
                                        }}
                                    >
                                        {CONTENT.notfDirections}
                                    </Text>
                                </View>
                            </TouchableHighlight>

                            <TouchableHighlight
                                style={[styles.orderFooter, { backgroundColor: "transparent" }]}
                                underlayColor="#0027584d"
                                onPress={() => Call(item.phone)}
                            >
                                <View style={{ flexDirection: "row", alignItems: "center" }}>
                                    <Ionicons name="call-outline" size={15} color="#00d781" />
                                    <Text style={{ color: "#00d781", marginLeft: 4 }}>Call</Text>
                                </View>
                            </TouchableHighlight>
                        </View>
                    )}
                </View>
            </View>
        );
    };
    const renderRestaurantItems = ({ item }) => {
        const isNew = newOrders.find((New) => (New.key === item.key ? true : false));
        return (
            <View style={styles.OrdersCont}>
                <View style={styles.order}>
                    <View style={styles.content}>
                        <Avatar
                            profile={{ data: { id: item.source, Name: item.Name, photo: item.photo } }}
                            style={styles.avatar}
                        />
                        <View style={styles.orderInfo}>
                            <Text style={styles.srcName}>{item.Name}</Text>
                            <View style={styles.dateCont}>
                                <Ionicons name="time-outline" size={12} color="#848484" />
                                <Text style={styles.date}>{item.elapsed}</Text>
                            </View>
                        </View>
                        <View style={styles.approvalBtnsCont}>
                            {item.accepted === undefined ? (
                                <>
                                    <TouchableOpacity
                                        style={[
                                            styles.approvalBtn,
                                            { backgroundColor: "#dd4c35", marginLeft: 0 },
                                        ]}
                                        underlayColor="transparent"
                                        onPress={() => Approval(false, item.Token, item.source, item.key)}
                                    >
                                        <Animated.View style={isNew && AnimStyle}>
                                            <Ionicons name="close-outline" size={25} color="#fff" />
                                        </Animated.View>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={[styles.approvalBtn, { backgroundColor: "#0dbc79" }]}
                                        underlayColor="transparent"
                                        onPress={() => Approval(true, item.Token, item.source, item.key)}
                                    >
                                        <Animated.View style={isNew && AnimStyle}>
                                            <Ionicons name="checkmark-outline" size={25} color="#fff" />
                                        </Animated.View>
                                    </TouchableOpacity>
                                </>
                            ) : item.delievered ? (
                                <Animated.View style={isNew && AnimStyle}>
                                    <Ionicons name="checkmark-circle" size={30} color="#4bbc83" />
                                </Animated.View>
                            ) : item.accepted ? (
                                <Animated.View style={isNew && AnimStyle}>
                                    <Ionicons name="checkmark" size={25} color="#4bbc83" />
                                </Animated.View>
                            ) : (
                                <Animated.View style={isNew && AnimStyle}>
                                    <Ionicons name="close-circle" size={30} color="#ef4d4d" />
                                </Animated.View>
                            )}
                        </View>
                    </View>
                    {item.accepted && !item.delievered && (
                        <TouchableOpacity
                            style={styles.orderFooter}
                            onPress={() => {
                                Submit_Order(item.key, item.source);
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
                    )}
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
    const renderEmptyList = () => {
        if (!Orders.length) {
            return (
                <View style={{ alignItems: "center", justifyContent: "center" }}>
                    <Image
                        style={{ width: 100, height: 100, marginBottom: 10, opacity: 0.7 }}
                        source={require("../../../../assets/emptyMsg.png")}
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
        setNoMore(false);
    };
    const clearNewOrders = useCallback(() => {
        setNewOrders([]);
    });
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
    const Approval = async (accepted, token, userId, orderId) => {
        const timestamp = firestore.FieldValue.serverTimestamp();
        const now = firestore.Timestamp.now();

        const notificationData = {
            token: token,
            title: `${accepted ? "Accepted Order" : "Rejected Order"}`,
            msg: `${data?.Name} has ${accepted ? "accepted" : "rejected"} your order ${
                accepted && "let's see the directions"
            }`,
            extraData: { orderKey: orderId, result: accepted },
        };
        const approvalData = {
            accepted,
            approvalDate: timestamp,
            seened: !accepted,
        };
        if (!accepted) {
            approvalData.delievered = false;
        }

        try {
            // Send approval for user
            await $Users_Ref
                .doc(userId)
                .collection("orders")
                .doc(orderId)
                .update({ ...approvalData, seened: false, photo: data?.photo, Name: data?.Name });

            SendNotification(notificationData);

            // Update public restaurant order
            $Orders_Ref.doc(orderId).update(approvalData);

            const newOrders = [];
            Orders.forEach((order) => {
                if (order.key == orderId) {
                    newOrders.push({
                        ...order,
                        ...approvalData,
                        approvalDate: now,
                        elapsed: CONTENT.Now,
                    });
                } else {
                    newOrders.push(order);
                }
            });
            setOrders(newOrders);
        } catch (e) {
            console.log(e);
        }
    };
    const Refuse_All = () => {
        const timestamp = firestore.FieldValue.serverTimestamp();
        const now = firestore.Timestamp.now();
        const refuseData = { accepted: false, delievered: false, approvalDate: timestamp, seened: true };

        // Refuse all pinding orders
        Orders.forEach(async (order) => {
            const { key, source, accepted, Token } = order;

            const notificationData = {
                title: "Rejected Order",
                msg: `Your order has been rejected by ${data?.Name}
          }`,
                extraData: { orderKey: key, result: accepted },
            };

            if (accepted == undefined) {
                // Refuse user order
                await $Users_Ref
                    .doc(source)
                    .collection("orders")
                    .doc(key)
                    .update({ ...refuseData, seened: true, photo: data?.photo, Name: data?.Name });

                SendNotification({ ...notificationData, token: Token });

                // Refuse public restaurant order
                $Orders_Ref.doc(key).update(refuseData);

                // Update order state
                const newOrders = [];
                Orders.forEach((order) => {
                    if (order.accepted == undefined) {
                        newOrders.push({
                            ...order,
                            ...refuseData,
                            approvalDate: now,
                            elapsed: CONTENT.Now,
                        });
                    } else {
                        newOrders.push(order);
                    }
                });
                setOrders(newOrders);

                Toast.show({
                    render: () => {
                        return <TOAST status="success" msg="All pending orders removed." />;
                    },
                    duration: 2000,
                });
            }
        });
    };
    const Submit_Order = async (orderId, userId) => {
        const timestamp = firestore.FieldValue.serverTimestamp();
        const now = firestore.Timestamp.now();
        const newOrders = [];
        const submitData = {
            delievered: true,
            submitDate: timestamp,
            seened: true,
        };

        const notificationData = {
            token: userId,
            title: `Confirmed Order`,
            msg: `${data?.Name} confirmed your order
        }`,
        };

        // Submit user order
        await $Users_Ref
            .doc(userId)
            .collection("orders")
            .doc(orderId)
            .update({ ...submitData, seened: false, photo: data?.photo, Name: data?.Name });

        SendNotification(notificationData);

        // Submit public restaurant order
        $Orders_Ref.doc(orderId).update(submitData);

        // Update order state
        Orders.forEach((order) => {
            order.key == orderId
                ? newOrders.push({
                      ...order,
                      ...submitData,
                      submitDate: now,
                      elapsed: CONTENT.Now,
                  })
                : newOrders.push(order);
        });
        setOrders(newOrders);
    };
    const Call = (phone) => {
        Linking.openURL(`tel:${phone}`);
    };
    const Animate = () => {
        setTimeout(() => {
            _AnimScale.value = withSpring(0.6, {}, (end) => {
                if (end) {
                    _AnimScale.value = withTiming(1, { mass: 0.4, damping: 2 });
                    runOnJS(clearNewOrders)();
                }
            });
        }, 500);
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
                    renderItem={data?.restaurant ? renderRestaurantItems : renderUserItems}
                    keyExtractor={(item) => item.key}
                    onEndReached={!noMore && Orders.length && Fetch_More}
                    onEndReachedThreshold={0.1}
                    showsVerticalScrollIndicator={false}
                    ListFooterComponent={loadingFooter ? Loading_Footer : <View style={{ height: 20 }} />}
                    scrollEventThrottle={150}
                    refreshControl={
                        <RefreshControl
                            colors={["#1785f5"]}
                            progressBackgroundColor={theme ? "#021f46" : "#ffffff"}
                            progressViewOffset={0}
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                        />
                    }
                    ListEmptyComponent={renderEmptyList}
                    contentContainerStyle={
                        !Orders.length ? { flex: 1, justifyContent: "center", alignItems: "center" } : false
                    }
                />
            )}
        </View>
    );
};

export default memo(FlatlistOrders);
