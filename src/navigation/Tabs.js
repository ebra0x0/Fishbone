import React, { useState, useEffect } from "react";
import { ActivityIndicator, Dimensions, Image, Keyboard } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import firestore from "@react-native-firebase/firestore";
import messaging from "@react-native-firebase/messaging";
import styles from "./styles";

import { Profile, Settings, Notifications } from "../screens";
import Animated, { useAnimatedStyle, useSharedValue, withSpring, withTiming } from "react-native-reanimated";
import Dashboard from "../screens/Dashboard/Dashboard";
import Explore from "../screens/Explore/Explore";

const Tab = createBottomTabNavigator();

const Tabs = () => {
    const Styles = styles();
    const { data, Token, theme } = useSelector((state) => state.user);
    const [msgsCount, setMsgsCount] = useState(0);
    const [confPhoto, setConfPhoto] = useState(null);
    const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);

    const $Orders_Ref = firestore().collection("users").doc(data?.id).collection("orders");
    const _AntMove = useSharedValue(0);
    const _AntWidth = useSharedValue(5);
    const _AntHeight = useSharedValue(5);
    const AnimStyle = useAnimatedStyle(() => {
        return {
            width: _AntWidth.value,
            height: _AntHeight.value,
            borderRadius: _AntWidth.value / 2,
            transform: [{ translateX: _AntMove.value }],
        };
    });

    const icons = {
        discover: {
            fill: require("../../assets/home.png"),
            outline: require("../../assets/home-outline.png"),
        },
        notifications: {
            fill: require("../../assets/notification.png"),
            outline: require("../../assets/notification-outline.png"),
            alarm: require("../../assets/notification-alarm.png"),
        },
        settings: {
            fill: require("../../assets/setting.png"),
            outline: require("../../assets/setting-outline.png"),
        },

        profile: {
            fill: require("../../assets/user.png"),
            outline: require("../../assets/user-outline.png"),
        },
    };

    const dispatch = useDispatch();

    useEffect(() => {
        AnimateTo(TAB_BAR_WIDTH());

        Upload_Token(data?.id);
        Topic_Subscribtion(data?.restaurant ? "rests" : "users");
        if (!data?.restaurant) {
            Fetch_Favorites();
            Check_Unconfirmed_Orders();
        } else {
            setConfPhoto(false);
        }
        Get_Notifications();

        KeyboardHandler();
    }, []);

    const AnimateTo = (value) => {
        _AntWidth.value = withTiming(25, { duration: 100 }, (end) => {
            if (end) {
                _AntWidth.value = withTiming(5);
            }
        });
        _AntHeight.value = withTiming(3, { duration: 100 }, (end) => {
            if (end) {
                _AntHeight.value = withTiming(5);
            }
        });
        _AntMove.value = withSpring(value, { mass: 0.5, damping: 10 });
    };

    const KeyboardHandler = () => {
        const keyboardOpenListener = Keyboard.addListener("keyboardDidShow", () => setIsKeyboardOpen(true));
        const keyboardCloseListener = Keyboard.addListener("keyboardDidHide", () => setIsKeyboardOpen(false));

        return () => {
            if (keyboardOpenListener) keyboardOpenListener.remove();
            if (keyboardCloseListener) keyboardCloseListener.remove();
        };
    };

    const TAB_BAR_WIDTH = () => {
        let width = Dimensions.get("screen").width;
        width = width - Styles.tabBar.paddingHorizontal * 2;

        return width / 4;
    };

    const Get_Notifications = async () => {
        $Orders_Ref.onSnapshot((querySnapshot) => {
            if (querySnapshot?.size) {
                const newOrders = querySnapshot.docs.filter((order) => !order.data()?.seened);

                setMsgsCount(newOrders.length);
            }
        });
    };

    const Check_Unconfirmed_Orders = async () => {
        try {
            let done = true;
            $Orders_Ref.onSnapshot((querySnapshot) => {
                if (querySnapshot?.size) {
                    querySnapshot.forEach((order) => {
                        done = false;
                        const { delievered, confirmed } = order.data();

                        if (delievered && !confirmed) {
                            setConfPhoto(true);
                            dispatch({
                                type: "userData/Set_ConfirmationPhoto",
                                payload: { has: true, orderId: order.id },
                            });
                        }
                    });
                } else {
                    setConfPhoto(false);
                }
            });
            done && confPhoto === null && setConfPhoto(false);
        } catch (e) {
            console.log(e);
            setConfPhoto(false);
        }
    };

    const Upload_Token = (user) => {
        if (Token) {
            firestore()
                .collection("users")
                .doc(user)
                .update({ Token: Token })
                .catch((e) => console.log(e));
        }
    };

    const Topic_Subscribtion = (topic) => {
        messaging()
            .subscribeToTopic(topic)
            .catch((e) => console.log(e));
    };

    const Fetch_Favorites = () => {
        try {
            const $favRef = firestore().collection("users").doc(data?.id).collection("favorites");
            const $UsersRef = firestore().collection("users");

            $favRef.get().then((querySnapshot) => {
                if (querySnapshot?.size) {
                    const newFavs = [];
                    querySnapshot.forEach(async (doc, indx) => {
                        const { id } = doc.data();

                        await $UsersRef
                            .doc(id)
                            .get()
                            .then((user) => {
                                newFavs.push({
                                    ...user.data(),
                                    key: doc.id,
                                });
                            });
                        if (indx + 1 == querySnapshot?.size) {
                            dispatch({ type: "userData/Set_Favorites", payload: newFavs });
                        }
                    });
                } else {
                    dispatch({ type: "userData/Set_Favorites", payload: [] });
                }
            });
        } catch (e) {
            console.log(e);
            setLoading(false);
        }
    };

    return confPhoto == false ? (
        <>
            <Tab.Navigator
                initialRouteName="HomeTab"
                screenOptions={{
                    headerShown: false,
                    tabBarShowLabel: false,
                    tabBarStyle: Styles.tabBar,
                    tabBarHideOnKeyboard: true,
                }}
            >
                <Tab.Screen
                    name="HomeTab"
                    component={data?.restaurant ? Dashboard : Explore}
                    options={{
                        tabBarIcon: ({ focused }) => (
                            <Image
                                style={{ width: 23, height: 23 }}
                                source={focused ? icons.discover.fill : icons.discover.outline}
                            />
                        ),
                    }}
                    listeners={() => ({
                        focus: () => {
                            AnimateTo(TAB_BAR_WIDTH());
                        },
                    })}
                ></Tab.Screen>
                <Tab.Screen
                    name="notifications"
                    component={Notifications}
                    options={{
                        tabBarIcon: ({ focused }) => (
                            <Image
                                style={{ width: 23, height: 23 }}
                                source={
                                    focused
                                        ? icons.notifications.fill
                                        : msgsCount
                                        ? icons.notifications.alarm
                                        : icons.notifications.outline
                                }
                            />
                        ),
                        tabBarBadge: msgsCount ? msgsCount : undefined,
                        tabBarBadgeStyle: Styles.Badge,
                    }}
                    listeners={() => ({
                        tabPress: () => {
                            setMsgsCount(0);
                        },
                        focus: () => {
                            AnimateTo(TAB_BAR_WIDTH() * 2);
                            setMsgsCount(0);
                        },
                    })}
                />

                <Tab.Screen
                    name="Settings"
                    component={Settings}
                    options={{
                        tabBarIcon: ({ focused }) => (
                            <Image
                                style={{ width: 23, height: 23 }}
                                source={focused ? icons.settings.fill : icons.settings.outline}
                            />
                        ),
                    }}
                    listeners={() => ({
                        focus: () => {
                            AnimateTo(TAB_BAR_WIDTH() * 3);
                        },
                    })}
                />
                <Tab.Screen
                    name="Profile"
                    component={Profile}
                    options={{
                        tabBarIcon: ({ focused }) => (
                            <>
                                {data?.photo ? (
                                    <Image
                                        style={{
                                            width: 23,
                                            height: 23,
                                            borderRadius: 23 / 2,
                                            opacity: focused ? 1 : 0.7,
                                            backgroundColor: "#001837",
                                        }}
                                        source={{ uri: data?.photo }}
                                    />
                                ) : (
                                    <Image
                                        style={{ width: 23, height: 23 }}
                                        source={focused ? icons.profile.fill : icons.profile.outline}
                                    />
                                )}
                            </>
                        ),
                    }}
                    listeners={() => ({
                        focus: () => {
                            AnimateTo(TAB_BAR_WIDTH() * 4);
                        },
                    })}
                />
            </Tab.Navigator>

            {!isKeyboardOpen && (
                <Animated.View
                    style={[
                        {
                            backgroundColor: Styles.activeTabs,
                            position: "absolute",
                            bottom: 10,
                            left: Styles.tabBar.paddingHorizontal / 5,
                        },
                        AnimStyle,
                    ]}
                />
            )}
        </>
    ) : (
        <ActivityIndicator
            style={{ flex: 1, backgroundColor: theme ? "#001023" : "#efefef" }}
            size={50}
            color="#1785f5"
        />
    );
};
export default Tabs;
