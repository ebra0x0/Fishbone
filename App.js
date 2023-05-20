import React, { useEffect, useState } from "react";
import { I18nManager } from "react-native";
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
import { NativeBaseProvider, Toast } from "native-base";
import TOAST from "./src/Components/Toast/Toast";
import Alert from "./src/Components/Alert/Alert";

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
    const [msgs, setMsgs] = useState([]);
    const [logged, setLogged] = useState(false);
    const [Theme, setTheme] = useState(theme);
    const [confPhoto, setConfPhoto] = useState({ has: null, orderId: "" });

    const $UserRef = firestore().collection("users");

    I18nManager.allowRTL(true);
    I18nManager.swapLeftAndRightInRTL(false);

    useEffect(() => {
        LoadStorage();
        onStoreChanged();
        Net_State();
        Get_Token();
        Notifications_Listeners();

        auth()
            .currentUser?.reload()
            .catch(() => {
                Toast.show({
                    render: () => {
                        return <TOAST status="error" msg="Your account has been deleted!" />;
                    },
                    duration: 2000,
                });
            });

        auth().onAuthStateChanged(async (session) => {
            if (session) {
                Get_User(session);
            } else {
                setUserData(null);
                store.dispatch({ type: "userData/Del_User" });
                setBooting(false);
            }
        });
    }, []);
    useEffect(() => {
        if (userData) {
            setLogged(true);
            setBooting(false);
        } else {
            setLogged(false);
        }
    }, [userData]);

    useEffect(() => {
        Token && store.dispatch({ type: "userData/Set_Token", payload: Token });
    }, [Token]);

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

    const Notifications_Listeners = () => {
        // Notifications listiner in background
        messaging().setBackgroundMessageHandler(async (remoteMessage) => {
            // Save messages list in storage
            const currentMessages = await AsyncStorage.getItem("MESSAGES");

            const messageArray = currentMessages ? JSON.parse(currentMessages) : [];
            Object.keys(remoteMessage.data) !== 0 && messageArray.push(remoteMessage.data);

            await AsyncStorage.setItem("MESSAGES", JSON.stringify(messageArray));
        });

        // Notifications listiner in foreground
        messaging().onMessage(async (remoteMessage) => {
            Handle_Msgs([remoteMessage.data]);
        });
    };

    const Handle_Msgs = (msgs) => {
        const newMsgs = [];
        if (msgs) {
            msgs.forEach((msg, indx) => {
                if (msg.orderKey) {
                    newMsgs.push(msg);
                }
                if (msgs.length === indx + 1) {
                    setMsgs(newMsgs);
                }
            });
        }
    };

    const Get_User = async (user) => {
        try {
            $UserRef.doc(user?.uid).onSnapshot((querySnapshot) => {
                if (querySnapshot?.exists) {
                    store.dispatch({ type: "userData/Set_User", payload: querySnapshot?.data() });
                    setUserData(querySnapshot?.data());
                } else {
                    setBooting(false);
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
                    case "THEME":
                        store.dispatch({ type: "userData/Set_Theme", payload: JSON.parse(item) });
                        break;
                    case "LANG":
                        store.dispatch({ type: "userData/Set_Lang", payload: item });
                        break;
                    case "MESSAGES":
                        item && Handle_Msgs(item);
                        break;
                }
            });
        });
    };

    const onStoreChanged = () => {
        store.subscribe(() => {
            const { theme, hasUnconfirmedOrder } = store.getState().user;
            setTheme(theme);
            setConfPhoto(hasUnconfirmedOrder);
        });
    };

    NavigationBar.setBackgroundColorAsync(Theme ? "#00152d" : "#ccc");

    return (
        <Provider store={store}>
            <NativeBaseProvider>
                <StatusBar
                    backgroundColor={Theme ? "#00142f33" : "#ebebeb4d"}
                    style={Theme ? "light" : "dark"}
                />
                <NavigationContainer>
                    {connection ? (
                        <>
                            {booting && <Boot />}
                            {logged ? (
                                confPhoto.has ? (
                                    <ConfPhoto />
                                ) : (
                                    <>
                                        <AccNavigators />
                                        {msgs.length ? <Alert data={msgs} close={setMsgs} /> : false}
                                    </>
                                )
                            ) : (
                                <AuthNavigators />
                            )}
                        </>
                    ) : (
                        <NoConnection />
                    )}
                </NavigationContainer>
            </NativeBaseProvider>
        </Provider>
    );
};
export default App;
