import React, { useEffect, useState } from "react";
import {
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    ActivityIndicator,
    Keyboard,
    Image,
} from "react-native";
import Translations from "../../Languages";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import styles from "./styles";
import { MaterialIcons } from "@expo/vector-icons";
import auth from "@react-native-firebase/auth";
import firestore from "@react-native-firebase/firestore";

import Google_Authinticator from "../../Components/AuthinticationProviders/Google_Authinticator";
import FB_Authinticator from "../../Components/AuthinticationProviders/FB_Authinticator";
import { useSelector } from "react-redux";

export default ({ navigation }) => {
    const { lang, theme } = useSelector((state) => state.user);
    const Styles = styles();
    const [email, setEmail] = useState({ value: "", valid: null, error: "" });
    const [password, setPassword] = useState({ value: "", valid: null, error: "" });
    const [rePass, setRePassword] = useState({ value: "", valid: null, error: "" });
    const [hidePass, setHidePass] = useState({ pass: true, rePass: true });
    const [actvInput, setActvInput] = useState({
        name: "",
        email: "",
        pass: "",
        repass: "",
    });
    const [actvBtn, setActvBtn] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errMsg, setErrMsg] = useState("");

    const usersRef = firestore().collection("users");

    const registerBtnTitle = Translations().t("signupBtn");

    useEffect(() => {
        checkValidation();
    }, [email, password, rePass]);

    const checkValidation = () => {
        if (email.valid && password.valid && rePass.valid) {
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
                setEmail((prev) => {
                    return { ...prev, error: "Ahh, That doesn't look like a valid email. Let's try again" };
                });
            }
        } else {
            setEmail((prev) => {
                return { ...prev, error: "" };
            });
            setEmail((prev) => {
                return { ...prev, valid: true };
            });
            setActvInput((prev) => {
                return { ...prev, email: "right" };
            });
        }
    };
    const passwordValidation = (pass, out) => {
        const passRegex = new RegExp("[a-zA-Z0-9~!@#$%^&*.()_/=+]{8,15}");

        if (!pass.match(passRegex)) {
            setPassword((prev) => {
                return { ...prev, valid: false };
            });
            setRePassword((prev) => {
                return { ...prev, valid: false };
            });
            if (out) {
                setActvInput((prev) => {
                    return { ...prev, pass: "bad" };
                });
                setActvInput((prev) => {
                    return { ...prev, repass: "bad" };
                });
                setPassword((prev) => {
                    return { ...prev, error: "Weak password: make it stronger at least 8 characters" };
                });
            }
        } else {
            setPassword((prev) => {
                return { ...prev, error: "" };
            });

            setPassword((prev) => {
                return { ...prev, valid: true };
            });
            setActvInput((prev) => {
                return { ...prev, pass: "right" };
            });

            if (rePass.value !== pass) {
                setRePassword((prev) => {
                    return { ...prev, valid: false, error: "Ops, Password don't match" };
                });
                setActvInput((prev) => {
                    return { ...prev, repass: "bad" };
                });
            } else {
                setRePassword((prev) => {
                    return { ...prev, valid: true };
                });
                setActvInput((prev) => {
                    return { ...prev, repass: "right" };
                });
                setRePassword((prev) => {
                    return { ...prev, valid: false, error: "" };
                });
            }
        }
    };
    const rePassValidation = (rePass, out) => {
        if (password.valid) {
            if (rePass !== password.value) {
                setRePassword((prev) => {
                    return { ...prev, valid: false };
                });
                if (out) {
                    setActvInput((prev) => {
                        return { ...prev, repass: "bad" };
                    });

                    setRePassword((prev) => {
                        return { ...prev, error: "Ops, Password don't match" };
                    });
                }
            } else {
                setRePassword((prev) => {
                    return { ...prev, valid: true, error: "" };
                });
                setActvInput((prev) => {
                    return { ...prev, repass: "right" };
                });
            }
        } else {
            setActvInput((prev) => {
                return { ...prev, pass: "bad" };
            });
            setPassword((prev) => {
                return { ...prev, error: "Weak password: make it stronger at least 8 characters" };
            });
        }
    };

    const cropErr = (err) => {
        const sliceErr = err.split(" ").slice(1, -1).join(" ");
        return sliceErr;
    };
    const Register = () => {
        Keyboard.dismiss();
        setLoading(true);

        try {
            auth()
                .createUserWithEmailAndPassword(email.value, password.value)
                .then((response) => {
                    const uid = response.user.uid;
                    const data = {
                        id: uid,
                        photo: "",
                        email: email.value,
                        verified: false,
                    };
                    usersRef
                        .doc(uid)
                        .set(data)
                        .catch((e) => {
                            setLoading(false);
                            setErrMsg(cropErr(e.message));
                        });
                })
                .catch((e) => {
                    setLoading(false);
                    setErrMsg(cropErr(e.message));
                });
        } catch (e) {
            setLoading(false);
            console.log(e);
        }
    };

    return (
        <View style={Styles.container}>
            <KeyboardAwareScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
                <View style={{ marginBottom: 20 }}>
                    <Text style={Styles.headerTxt}>{Translations().t("signupTitle")}</Text>
                    <Text style={{ fontSize: 16, color: "#6e6e6e" }}>{Translations().t("signupDesc")}</Text>
                </View>

                <TextInput
                    style={[Styles.input, ActiveThem[actvInput.email]]}
                    placeholder={Translations().t("Email")}
                    placeholderTextColor="#aaaaaa"
                    cursorColor="#007eff"
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
                {email.error && <Text style={{ color: "#ff4a4a", fontSize: 12 }}>{email.error}</Text>}
                <View style={{ justifyContent: "center" }}>
                    <TextInput
                        style={[
                            Styles.input,
                            lang == "en" ? { paddingRight: 60 } : { paddingLeft: 60 },
                            ActiveThem[actvInput.pass],
                        ]}
                        placeholderTextColor="#aaaaaa"
                        secureTextEntry={hidePass.pass}
                        placeholder={Translations().t("Pass")}
                        textAlign={lang == "en" ? "left" : "right"}
                        cursorColor="#007eff"
                        onChangeText={(text) => {
                            setPassword((prev) => {
                                return { ...prev, value: text };
                            });
                            passwordValidation(text);
                        }}
                        value={password.value}
                        autoCapitalize="none"
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
                        onPress={() =>
                            hidePass.pass
                                ? setHidePass((prev) => {
                                      return { ...prev, pass: false };
                                  })
                                : setHidePass((prev) => {
                                      return { ...prev, pass: true };
                                  })
                        }
                    >
                        <MaterialIcons
                            name={hidePass.pass ? "visibility" : "visibility-off"}
                            size={25}
                            color={hidePass.pass ? (theme ? "#00408e" : "#e2e2e2") : "#1785f5"}
                        />
                    </TouchableOpacity>
                </View>
                {password.error && <Text style={{ color: "#ff4a4a", fontSize: 12 }}>{password.error}</Text>}
                <View style={{ justifyContent: "center" }}>
                    <TextInput
                        style={[
                            Styles.input,
                            lang == "en" ? { paddingRight: 60 } : { paddingLeft: 60 },
                            ActiveThem[actvInput.repass],
                        ]}
                        placeholderTextColor="#aaaaaa"
                        secureTextEntry={hidePass.rePass}
                        placeholder={Translations().t("signupRepass")}
                        textAlign={lang == "en" ? "left" : "right"}
                        cursorColor="#007eff"
                        onChangeText={(text) => {
                            setRePassword((prev) => {
                                return { ...prev, value: text };
                            });
                            rePassValidation(text);
                        }}
                        value={rePass.value}
                        autoCapitalize="none"
                        onFocus={() => {
                            !actvInput.repass &&
                                setActvInput((prev) => {
                                    return { ...prev, repass: "active" };
                                });
                        }}
                        onBlur={() => {
                            rePassValidation(rePass.value, true);
                        }}
                    />
                    <TouchableOpacity
                        style={[Styles.passToggle, lang == "ar" && { left: 20, right: null }]}
                        onPress={() =>
                            hidePass.rePass
                                ? setHidePass((prev) => {
                                      return { ...prev, rePass: false };
                                  })
                                : setHidePass((prev) => {
                                      return { ...prev, rePass: true };
                                  })
                        }
                    >
                        <MaterialIcons
                            name={hidePass.rePass ? "visibility" : "visibility-off"}
                            size={25}
                            color={hidePass.rePass ? (theme ? "#00408e" : "#e2e2e2") : "#1785f5"}
                        />
                    </TouchableOpacity>
                </View>
                {rePass.error && <Text style={{ color: "#ff4a4a", fontSize: 12 }}>{rePass.error}</Text>}
                <TouchableOpacity
                    style={[Styles.loginBtn, (actvBtn || loading) && { opacity: 1 }]}
                    onPress={Register}
                    disabled={!actvBtn || loading}
                >
                    <Text style={Styles.loginBtnTitle}>
                        {loading ? <ActivityIndicator size="large" color="#fff" /> : registerBtnTitle}
                    </Text>
                </TouchableOpacity>

                <View style={Styles.footerView}>
                    <Text style={Styles.footerText}>
                        {Translations().t("signupCreateAcc")}{" "}
                        <Text
                            onPress={() => !loading && navigation.navigate("Login")}
                            style={Styles.footerLink}
                        >
                            {Translations().t("greetingSignIn")}
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
const ActiveThem = StyleSheet.create({
    active: {
        backgroundColor: "#0072ff1c",
        borderWidth: 1,
        borderColor: "#2280ff",
        color: "#767676",
    },
    right: {
        backgroundColor: "#4caf501a",
        borderWidth: 1,
        borderColor: "#60ff98",
        color: "#767676",
    },
    bad: {
        backgroundColor: "#ff70701a",
        borderWidth: 1,
        borderColor: "#ff4040",
        color: "#767676",
    },
    actvBtn: {
        backgroundColor: "#007acc",
    },
    actvBtnTitle: {
        color: "#fff",
    },
});
