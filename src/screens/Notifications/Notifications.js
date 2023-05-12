import { useCallback, useEffect, useState } from "react";
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
} from "react-native";
import Styles from "./Styles";
import firestore from "@react-native-firebase/firestore";
import { CardStyleInterpolators, createStackNavigator } from "@react-navigation/stack";
import { Ionicons } from "@expo/vector-icons";
import ScreenHeader from "../../Components/ScreenHeader/ScreenHeader";
import OpenProfile from "../OpenProfile/OpenProfile";
import GetDirections from "../../Components/GetDirections";
import Translations from "../../Languages";
import SendNotification from "../../Components/SendNotification";
import { Toast } from "native-base";
import TOAST from "../../Components/Toast/Toast";
import { Linking } from "react-native";
import Animated, {
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming,
} from "react-native-reanimated";
import Avatar from "../../Components/Avatar/Avatar";
import { memo } from "react";

export default ({ route }) => {
    const styles = Styles();
    const { data, lang, theme, PendingOrder } = useSelector((state) => state.user);
    const [Orders, setOrders] = useState([]);
    const [newOrders, setNewOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingFooter, setLoadingFooter] = useState(false);
    const [lastOrder, setLastOrder] = useState(null);
    const [refreshing, setRefreshing] = useState(false);
    const _AnimScale = useSharedValue(1);
    const AnimStyle = useAnimatedStyle(() => {
        return {
            transform: [{ scale: _AnimScale.value }],
        };
    });

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
    useEffect(() => {
        if (route.params?.New) {
            !loading && Fetch();
        }
    }, [route.params]);

    useEffect(() => {
        newOrders.length && Orders.length && Animate();
    }, [newOrders]);

    //Functions

    const clearNewOrders = useCallback(() => {
        setNewOrders([]);
    });
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

    const Fetch = async () => {
        try {
            setLoading(true);
            const querySnapshot = await $Orders_Ref.orderBy("date", "desc").limit(limit).get();

            if (querySnapshot.size) {
                const newOrders = [];
                const New = [];

                querySnapshot.forEach(async (order, indx) => {
                    const { source, dest, date, accepted, delievered, submitDate, approvalDate, seened } =
                        order.data();
                    const dateType = submitDate ? submitDate : approvalDate ? approvalDate : date;

                    delievered !== undefined && order.ref.update({ seened: true });

                    if (!data?.restaurant && accepted === undefined) {
                        indx + 1 == querySnapshot.size && setLoading(false);
                        return;
                    } else if (!seened) {
                        New.push({ key: order.id });
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
                        setNewOrders(New);
                    }
                });
            } else {
                setLoading(false);
                setOrders([]);
            }
        } catch (error) {
            setLoading(false);
            console.log("Error fetching msgs:", error);
        }
    };

    const Fetch_More = async () => {
        if (loading || loadingFooter) return;
        try {
            if (data) {
                const querySnapshot = await $Orders_Ref
                    .orderBy("date", "desc")
                    .startAfter(lastOrder)
                    .limit(limit)
                    .get();

                const newOrders = [];
                const New = [];

                if (querySnapshot.size) {
                    setLoadingFooter(true);
                    querySnapshot.docs.forEach(async (order, indx) => {
                        const { source, dest, date, accepted, delievered, submitDate, approvalDate, seened } =
                            order.data();
                        const dateType = submitDate ? submitDate : approvalDate ? approvalDate : date;

                        delievered !== undefined && order.ref.update({ seened: true });

                        if (!data?.restaurant && accepted === undefined) {
                            indx + 1 == querySnapshot.size && setLoadingFooter(false);
                            return;
                        } else if (!seened) {
                            New.push({ key: order.id });
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
                            .catch(() => setLoadingFooter(false));

                        if (indx + 1 == querySnapshot.size) {
                            New.length && setNewOrders(New);
                            newOrders.length && setOrders((prev) => [...prev, ...newOrders]);
                            newOrders.length && setLastOrder(querySnapshot.docs[querySnapshot.size - 1]);
                            setLoadingFooter(false);
                        }
                    });
                } else {
                    setLoadingFooter(false);
                }
            }
        } catch (e) {
            setLoadingFooter(false);
            console.log("Error fetching more orders:", e);
        }
    };

    const Approval = async (accepted, token, userId, orderId, postId) => {
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
                .update({ ...approvalData, seened: false });

            SendNotification(notificationData);

            // Update public restaurant order
            $Orders_Ref.doc(orderId).update(approvalData);
            // Update post restaurant order
            $User_Ref.collection("posts").doc(postId).collection("orders").doc(orderId).update(approvalData);

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
            const { key, id, accepted, postId, Token } = order;

            const notificationData = {
                title: "Rejected Order",
                msg: `Your order has been rejected by ${data?.Name}
            }`,
                extraData: { orderKey: key, result: accepted },
            };

            if (accepted == undefined) {
                // Refuse user order
                await $Users_Ref
                    .doc(id)
                    .collection("orders")
                    .doc(key)
                    .update({ ...refuseData, seened: true });

                SendNotification({ ...notificationData, token: Token });

                // Refuse public restaurant order
                $Orders_Ref.doc(key).update(refuseData);

                // Refuse post restaurant order
                $User_Ref.collection("posts").doc(postId).collection("orders").doc(key).update(refuseData);

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

    const Submit_Order = async (orderId, userId, postId) => {
        const timestamp = firestore.FieldValue.serverTimestamp();
        const now = firestore.Timestamp.now();
        const newOrders = [];
        const submitData = { delievered: true, submitDate: timestamp, seened: true };

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
            .update({ ...submitData, seened: false });

        SendNotification(notificationData);

        // Submit public restaurant order
        $Orders_Ref.doc(orderId).update(submitData);

        // Submit post restaurant order
        $User_Ref.collection("posts").doc(postId).collection("orders").doc(orderId).update(submitData);

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

    const MAIN = memo(() => {
        const Buttons = [
            {
                show: data?.restaurant && PendingOrder,
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
        const HeaderTitle = CONTENT.notfTitle;

        const renderUserItems = ({ item }) => {
            const isNew = newOrders.find((New) => (New.key === item.key ? true : false));
            return (
                <View style={styles.OrdersCont}>
                    <View style={styles.order}>
                        <View style={styles.content}>
                            <Avatar profile={{ data: item }} style={styles.avatar} />
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
                                        GetDirections(item.id);
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
                            <Avatar profile={{ data: item }} style={styles.avatar} />
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
                                            onPress={() =>
                                                Approval(false, item.Token, item.id, item.key, item.postId)
                                            }
                                        >
                                            <Animated.View style={isNew && AnimStyle}>
                                                <Ionicons name="close-outline" size={25} color="#fff" />
                                            </Animated.View>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={[styles.approvalBtn, { backgroundColor: "#0dbc79" }]}
                                            underlayColor="transparent"
                                            onPress={() =>
                                                Approval(true, item.Token, item.id, item.key, item.postId)
                                            }
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
                        renderItem={data?.restaurant ? renderRestaurantItems : renderUserItems}
                        keyExtractor={(item) => item.key}
                        onEndReached={Orders.length && Fetch_More}
                        onEndReachedThreshold={0.5}
                        showsVerticalScrollIndicator={false}
                        ListFooterComponent={loadingFooter ? Loading_Footer : <View style={{ height: 20 }} />}
                        scrollEventThrottle={16}
                        refreshControl={
                            <RefreshControl
                                colors={["#1785f5"]}
                                progressBackgroundColor={theme ? "#021f46" : "#ffffff"}
                                progressViewOffset={0} // 30
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
        </Stack.Navigator>
    );
};
