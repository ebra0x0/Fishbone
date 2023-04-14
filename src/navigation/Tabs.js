import React, { useRef, useState, useEffect } from "react";
import { ActivityIndicator, Animated, Dimensions, Image, Keyboard, View } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import firestore from "@react-native-firebase/firestore";
import messaging from "@react-native-firebase/messaging";
import styles from "./styles";
import axios from "axios";

import { Discover, Profile, Settings, Notifications } from "../screens";

const Tab = createBottomTabNavigator();

const Tabs = () => {
    const Styles = styles();
    const { data, Token, theme } = useSelector((state) => state.user);
    const [msgsCount, setMsgsCount] = useState(0);
    const [confPhoto, setConfPhoto] = useState(null);
    const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);

    const $Orders_Ref = firestore().collection("users").doc(data?.id).collection("orders");
    const _AntMove = useRef(new Animated.Value(0)).current;
    const ANT_BAR = { x: 10, y: 3 };

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
        Animated.spring(_AntMove, {
            toValue: TAB_BAR_WIDTH(),
            useNativeDriver: true,
        }).start();
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
        let Count = 0;

        $Orders_Ref.onSnapshot((querySnapshot) => {
            if (querySnapshot?.size) {
                querySnapshot.forEach((order) => {
                    const { seened, delievered, accepted } = order.data();

                    if (!data?.restaurant && !seened && accepted !== undefined) {
                        Count++;
                    }
                    if (data?.restaurant && (!seened || delievered === undefined || accepted === undefined)) {
                        Count++;
                    }
                });
                setMsgsCount(Count);
            }
        });
    };

    const Check_Unconfirmed_Orders = async () => {
        try {
            await $Orders_Ref.get().then((querySnapshot) => {
                if (querySnapshot.size) {
                    querySnapshot.forEach((order, indx) => {
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

            confPhoto == null && setConfPhoto(false);
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

            $favRef.get().then((querySnapshot) => {
                if (querySnapshot?.size) {
                    const newFavs = [];
                    querySnapshot.forEach(async (doc, indx) => {
                        newFavs.push({
                            ...doc.data(),
                            key: doc.id,
                        });

                        if (indx + 1 == querySnapshot.size) {
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
                    component={Discover}
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
                            Animated.spring(_AntMove, {
                                toValue: TAB_BAR_WIDTH(),
                                useNativeDriver: true,
                            }).start();
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
                        focus: () => {
                            Animated.spring(_AntMove, {
                                toValue: TAB_BAR_WIDTH() * 2,
                                useNativeDriver: true,
                            }).start();
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
                            Animated.spring(_AntMove, {
                                toValue: TAB_BAR_WIDTH() * 3,
                                useNativeDriver: true,
                            }).start();
                        },
                    })}
                />
                <Tab.Screen
                    name="Profile"
                    component={Profile}
                    options={{
                        tabBarIcon: ({ focused }) => (
                            <>
                                {!data?.photo ? (
                                    <View
                                        style={[
                                            { width: 30, height: 30, padding: 2, borderRadius: 30 / 2 },
                                            focused && { backgroundColor: "#bdbdbd" },
                                        ]}
                                    >
                                        <Image
                                            style={{
                                                width: "100%",
                                                height: "100%",
                                                borderRadius: 30 / 2,
                                                opacity: focused ? 1 : 0.7,
                                            }}
                                            source={{ uri: data?.photo }}
                                        />
                                    </View>
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
                            Animated.spring(_AntMove, {
                                toValue: TAB_BAR_WIDTH() * 4,
                                useNativeDriver: true,
                            }).start();
                        },
                    })}
                />
            </Tab.Navigator>

            {!isKeyboardOpen && (
                <Animated.View
                    style={{
                        width: ANT_BAR.x,
                        height: ANT_BAR.y,
                        backgroundColor: Styles.activeTabs,
                        position: "absolute",
                        bottom: 10,
                        left: 7,
                        borderRadius: ANT_BAR.x / 2,
                        transform: [{ translateX: _AntMove }],
                    }}
                ></Animated.View>
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
