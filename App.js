import React, { useEffect, useState } from "react";
import { I18nManager, Linking } from "react-native";
import "react-native-gesture-handler";
import NetInfo from "@react-native-community/netinfo";
import publicIp from "react-native-public-ip";
import { NavigationContainer } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Provider } from "react-redux";
import store from "./src/Store/store";
import { StatusBar } from "expo-status-bar";
import * as NavigationBar from "expo-navigation-bar";

import AuthNavigators from "./src/navigation/AuthNavigators";
import AccNavigators from "./src/navigation/AccNavigators";
import { Boot, ConfPhoto, NoConnection } from "./src/screens";

import auth from "@react-native-firebase/auth";
import firestore from "@react-native-firebase/firestore";
import messaging from "@react-native-firebase/messaging";
import { decode, encode } from "base-64";
import { createStackNavigator } from "@react-navigation/stack";
import { NativeBaseProvider } from "native-base";

if (!global.btoa) {
    global.btoa = encode;
}
if (!global.atob) {
    global.atob = decode;
}

const App = () => {
    const { theme } = store.getState().user;
    const [userData, setUserData] = useState(null);
    const [connection, setConnection] = useState(true);
    const [booting, setBooting] = useState(true);
    const [Token, setToken] = useState("");
    const [msg, setMsg] = useState(null);
    const [logged, setLogged] = useState(false);
    const [Theme, setTheme] = useState(theme);
    const [confPhoto, setConfPhoto] = useState({ has: null, orderId: "" });

    const usersRef = firestore().collection("users");
    const Stack = createStackNavigator();

    I18nManager.allowRTL(true);
    I18nManager.swapLeftAndRightInRTL(false);

    useEffect(() => {
        LoadStorage();
        onStoreChanged();
        Net_State();
        Get_Token();
        Notifications_Handelr();
        Notifications_Listeners();

        auth().onAuthStateChanged(async (user) => {
            if (user) {
                await Get_User(user);
            } else {
                setUserData(null);
            }
        });
    }, []);
    useEffect(() => {
        if (userData) {
            setLogged(true);
            setBooting(false);
        } else {
            setLogged(false);
            store.dispatch({ type: "userData/Del_User" });
        }
    }, [userData]);
    useEffect(() => {
        logged && msg && console.log(msg);
    }, [msg]);

    useEffect(() => {
        if (Token) {
            store.dispatch({ type: "userData/Set_Token", payload: Token });
        }
    }, [Token]);

    //Functions

    const Msgs_Permission = async () => {
        const authStatus = await messaging().requestPermission();
        const enabled =
            authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
            authStatus === messaging.AuthorizationStatus.PROVISIONAL;

        if (enabled) {
            return authStatus;
        }
    };

    const Get_Token = () => {
        if (Msgs_Permission()) {
            messaging()
                .getToken()
                .then((token) => {
                    setToken(token);
                })
                .catch((e) => console.log(e));
        } else {
            console.log("Failed get token !");
        }
    };

    const Notifications_Handelr = () => {
        // When react with notifications and app is terminated will open the app

        messaging()
            .getInitialNotification()
            .then((remoteMessage) => {
                if (remoteMessage) {
                    console.log(remoteMessage.notification);
                }
            });
    };

    const Notifications_Listeners = () => {
        // Notifications listiner in background
        messaging().setBackgroundMessageHandler(async (remoteMessage) => {
            setMsg(remoteMessage.notification);
        });

        // Notifications listiner in foreground
        messaging().onMessage(async (remoteMessage) => {
            setMsg(remoteMessage.notification);
        });
    };

    const Get_User = async (user) => {
        try {
            usersRef.doc(user?.uid).onSnapshot((querySnapshot) => {
                if (user) {
                    if (querySnapshot?.exists) {
                        store.dispatch({ type: "userData/Set_User", payload: querySnapshot?.data() });
                        setUserData(querySnapshot?.data());
                    } else {
                        setBooting(false);
                    }
                }
            });
        } catch (e) {
            console.log(e);
        }
    };

    const Net_State = () => {
        NetInfo.addEventListener(async (state) => {
            if (state.isInternetReachable) {
                await publicIp()
                    .then((ip) => setConnection(ip))
                    .catch((e) => {
                        console.log(e);
                        setConnection(false);
                    });
            } else setConnection(false);
        });
    };

    const LoadStorage = () => {
        AsyncStorage.getAllKeys().then((keys) => {
            keys.forEach(async (key) => {
                const item = await AsyncStorage.getItem(key);

                switch (key) {
                    case "User":
                        if (item) {
                            setUserData(JSON.parse(item));
                            store.dispatch({ type: "userData/Set_User", payload: JSON.parse(item) });
                        }
                        break;
                    case "THEME":
                        store.dispatch({ type: "userData/Set_Theme", payload: JSON.parse(item) });
                        break;
                    case "LANG":
                        store.dispatch({ type: "userData/Set_Lang", payload: item });
                        break;
                }
            });
        });
    };

    const onStoreChanged = () => {
        store.subscribe(() => {
            const { theme, data, hasUnconfirmedOrder } = store.getState().user;
            setTheme(theme);
            setUserData(data);
            setConfPhoto(hasUnconfirmedOrder);
        });
    };
    NavigationBar.setBackgroundColorAsync(theme ? "#00152d" : "#ccc");

    return (
        <Provider store={store}>
            <NativeBaseProvider>
                <StatusBar style={Theme ? "light" : "dark"} />
                <NavigationContainer>
                    <Stack.Navigator
                        screenOptions={{
                            headerShown: false,
                            animationEnabled: false,
                        }}
                    >
                        {connection ? (
                            <>
                                {booting && <Stack.Screen name="boot" component={Boot} />}
                                {logged ? (
                                    confPhoto.has ? (
                                        <Stack.Screen name="ConfPhoto" component={ConfPhoto} />
                                    ) : (
                                        <Stack.Screen name="AccNavigators" component={AccNavigators} />
                                    )
                                ) : (
                                    <Stack.Screen name="AuthNavigators" component={AuthNavigators} />
                                )}
                            </>
                        ) : (
                            <Stack.Screen name="noConnection" component={NoConnection} />
                        )}
                    </Stack.Navigator>
                </NavigationContainer>
            </NativeBaseProvider>
        </Provider>
    );
};
export default App;
