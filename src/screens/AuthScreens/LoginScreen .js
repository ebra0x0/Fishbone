import React, { useEffect, useState } from "react";
import {
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    Keyboard,
    ActivityIndicator,
    Image,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import styles from "./styles";
import Translations from "../../Languages";

import firestore from "@react-native-firebase/firestore";
import auth from "@react-native-firebase/auth";
import Google_Authinticator from "../../Components/AuthinticationProviders/Google_Authinticator";
import FB_Authinticator from "../../Components/AuthinticationProviders/FB_Authinticator";
import Reset_Pass from "../Reset_Pass/Reset_Pass";
import { MaterialIcons } from "@expo/vector-icons";
import { createStackNavigator } from "@react-navigation/stack";
import { useSelector } from "react-redux";

export default () => {
    const Stack = createStackNavigator();

    const MAIN = ({ navigation }) => {
        const { lang, theme } = useSelector((state) => state.user);
        const Styles = styles();
        const [email, setEmail] = useState({ value: "", valid: null });
        const [password, setPassword] = useState({ value: "", valid: null });
        const [actvBtn, setActvBtn] = useState(false);
        const [hidePass, setHidePass] = useState(true);
        const [loading, setLoading] = useState(false);
        const [errMsg, setErrMsg] = useState("");
        const [actvInput, setActvInput] = useState({
            email: "",
            pass: "",
        });

        const loginBtnTitle = Translations().t("signinBtn");

        useEffect(() => {
            checkValidation();
        }, [email, password]);

        const checkValidation = () => {
            if (email.valid && password.valid) {
                setActvBtn(true);
            } else setActvBtn(false);
        };

        const emailValidation = (Email, out) => {
            const regexE = new RegExp("[a-zA-Z0-9]+@+(gmail|outlook|iCloud|yahoo|hotmail).com");

            if (!Email.match(regexE)) {
                setEmail((prev) => {
                    return { ...prev, valid: false };
                });
                if (out) {
                    setActvInput((prev) => {
                        return { ...prev, email: "bad" };
                    });
                    setErrMsg("Oh no! This email is invalid");
                }
            } else {
                setErrMsg("");
                setEmail((prev) => {
                    return { ...prev, valid: true };
                });
                setActvInput((prev) => {
                    return { ...prev, email: "" };
                });
            }
        };
        const passwordValidation = (pass, out) => {
            const passRegex = new RegExp("[a-zA-Z0-9~!@#$%^&*.()_/=+]{8,15}");

            if (email.valid) {
                if (!pass.match(passRegex)) {
                    setPassword((prev) => {
                        return { ...prev, valid: false };
                    });
                    if (out) {
                        setActvInput((prev) => {
                            return { ...prev, pass: "bad" };
                        });
                        setErrMsg("No! This field is requires at least 8 characters.");
                    }
                } else {
                    setErrMsg("");
                    setPassword((prev) => {
                        return { ...prev, valid: true };
                    });
                    setActvInput((prev) => {
                        return { ...prev, pass: "" };
                    });
                }
            } else {
                setActvInput((prev) => {
                    return { ...prev, pass: "" };
                });
            }
        };

        const cropErr = (err) => {
            const sliceErr = err.split(" ").slice(1, -1).join(" ");
            return sliceErr;
        };

        const Login = () => {
            try {
                Keyboard.dismiss();
                setLoading(true);

                auth()
                    .signInWithEmailAndPassword(email.value, password.value)
                    .then((response) => {
                        const uid = response.user.uid;
                        const usersRef = firestore().collection("users");

                        usersRef
                            .doc(uid)
                            .get()
                            .then((firestoreDocument) => {
                                if (!firestoreDocument.exists) {
                                    setLoading(false);
                                    setErrMsg("User does not exist anymore");
                                    return null;
                                }
                            })
                            .catch((e) => {
                                setLoading(false);
                                setErrMsg(cropErr(e.message));
                            });
                    })
                    .catch(() => {
                        setLoading(false);
                        setErrMsg("Incorrect Email or Password");
                    });
            } catch (e) {
                setLoading(false);
                console.log(e);
            }
        };

        return (
            <View style={Styles.container}>
                <KeyboardAwareScrollView
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    <View style={{ marginBottom: 30 }}>
                        <Text style={Styles.headerTxt}>{Translations().t("signinTitle")}</Text>
                        <Text style={{ fontSize: 16, color: "#6e6e6e" }}>
                            {Translations().t("signinDesc")}
                        </Text>
                    </View>
                    {errMsg && (
                        <View style={Styles.errMsg}>
                            <Text style={Styles.errMsgTxt}>{errMsg}</Text>
                        </View>
                    )}
                    <TextInput
                        cursorColor="#007eff"
                        style={[Styles.input, ActiveThem[actvInput.email]]}
                        placeholder={Translations().t("Email")}
                        placeholderTextColor="#aaaaaa"
                        textAlign={lang == "en" ? "left" : "right"}
                        onChangeText={(text) => {
                            const cropEmail = text.trim().replace(" ", "");
                            setEmail((prev) => {
                                return { ...prev, value: cropEmail };
                            });
                            emailValidation(cropEmail);
                        }}
                        value={email.value}
                        keyboardType="email-address"
                        maxLength={40}
                        autoCapitalize="none"
                        onFocus={() => {
                            !actvInput.email &&
                                setActvInput((prev) => {
                                    return { ...prev, email: "active" };
                                });
                        }}
                        onBlur={() => {
                            emailValidation(email.value, true);
                        }}
                    />
                    <View style={{ justifyContent: "center" }}>
                        <TextInput
                            style={[
                                Styles.input,
                                lang == "en" ? { paddingRight: 60 } : { paddingLeft: 60 },
                                ActiveThem[actvInput.pass],
                            ]}
                            placeholderTextColor="#aaaaaa"
                            secureTextEntry={hidePass}
                            textAlign={lang == "en" ? "left" : "right"}
                            placeholder={Translations().t("Pass")}
                            cursorColor="#007eff"
                            onChangeText={(text) => {
                                setPassword((prev) => {
                                    return { ...prev, value: text };
                                });
                                passwordValidation(text);
                            }}
                            value={password.value}
                            autoCapitalize="none"
                            maxLength={30}
                            onFocus={() => {
                                !actvInput.pass &&
                                    setActvInput((prev) => {
                                        return { ...prev, pass: "active" };
                                    });
                            }}
                            onBlur={() => {
                                passwordValidation(password.value, true);
                            }}
                        />
                        <TouchableOpacity
                            style={[Styles.passToggle, lang == "ar" && { left: 20, right: null }]}
                            onPress={() => (hidePass ? setHidePass(false) : setHidePass(true))}
                        >
                            <MaterialIcons
                                name={hidePass ? "visibility" : "visibility-off"}
                                size={25}
                                color={hidePass ? (theme ? "#00408e" : "#e2e2e2") : "#1785f5"}
                            />
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity onPress={() => navigation.navigate("resetPass")}>
                        <Text style={{ fontSize: 16, color: "#1785f5", marginRight: 7 }}>
                            {Translations().t("signinForgotPass")}
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[Styles.loginBtn, (actvBtn || loading) && { opacity: 1 }]}
                        onPress={Login}
                        disabled={!actvBtn || loading}
                    >
                        <Text style={Styles.loginBtnTitle}>
                            {loading ? <ActivityIndicator size="large" color="#fff" /> : loginBtnTitle}
                        </Text>
                    </TouchableOpacity>
                    <View style={Styles.footerView}>
                        <Text style={Styles.footerText}>
                            {Translations().t("signinCreateAcc")}{" "}
                            <Text
                                onPress={() => !loading && navigation.navigate("Registration")}
                                style={Styles.footerLink}
                            >
                                {Translations().t("greetingSignUp")}
                            </Text>
                        </Text>
                    </View>

                    <View style={{ flex: 1, alignItems: "center", marginTop: 20 }}>
                        <Text style={{ fontSize: 18, color: "#6e6e6e" }}>{Translations().t("Or")}</Text>
                    </View>

                    <View style={Styles.linksCont}>
                        <TouchableOpacity
                            style={Styles.link}
                            onPress={() => FB_Authinticator({ update: setLoading })}
                        >
                            <Image
                                style={{ width: 35, height: 35 }}
                                source={require("../../../assets/Facebook.png")}
                            />
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={Styles.link}
                            onPress={() => Google_Authinticator({ update: setLoading })}
                        >
                            <Image
                                style={{ width: 40, height: 40 }}
                                source={require("../../../assets/google.png")}
                            />
                        </TouchableOpacity>
                    </View>
                </KeyboardAwareScrollView>
            </View>
        );
    };

    return (
        <Stack.Navigator screenOptions={{ headerShown: false, presentation: "modal" }}>
            <Stack.Screen name="Main" component={MAIN} />
            <Stack.Screen name="resetPass" component={Reset_Pass} />
        </Stack.Navigator>
    );
};

const ActiveThem = StyleSheet.create({
    active: {
        backgroundColor: "#0072ff1c",
        borderWidth: 1,
        borderColor: "#2280ff",
        color: "#767676",
    },
    bad: {
        backgroundColor: "#ff70701a",
        borderWidth: 1,
        borderColor: "#ff4040",
        color: "#767676",
    },
});
