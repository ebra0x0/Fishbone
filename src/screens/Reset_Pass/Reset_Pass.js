import React, { useEffect, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Keyboard } from "react-native";
import auth from "@react-native-firebase/auth";
import { Ionicons } from "@expo/vector-icons";
import styles from "./styles";
import Translations from "../../Languages";
import { Toast } from "native-base";
import ALert from "../../Components/Alert/Alert";

const Reset_Pass = ({ navigation }) => {
    const Styles = styles();
    const [email, setEmail] = useState("");
    const [focus, setFocus] = useState(false);
    const [done, setDone] = useState(false);
    const [loading, setLoading] = useState(false);

    const CONTENT = {
        resetpassTitle: Translations().t("resetpassTitle"),
        resetpassDesc: Translations().t("resetpassDesc"),
        resetpassEmail: Translations().t("resetpassEmail"),
        resetpassSend: Translations().t("resetpassSend"),
    };

    useEffect(() => {
        if (EmailValidation()) {
            setDone(true);
        } else {
            setDone(false);
        }
    }, [email]);
    const EmailValidation = () => {
        const regexE = new RegExp("[a-zA-Z0-9]+@+(gmail|outlook|iCloud|yahoo|hotmail).com");

        return regexE.test(email);
    };
    const Send_Email = () => {
        const regexE = new RegExp("[a-zA-Z0-9]+@+(gmail|outlook|iCloud|yahoo|hotmail).com");
        if (email.match(regexE)) {
            try {
                Keyboard.dismiss();
                setLoading(true);
                auth()
                    .sendPasswordResetEmail(email)
                    .then(() => {
                        Toast.show({
                            render: () => {
                                return <ALert status="success" msg="Check your email to reset password." />;
                            },
                            duration: 3000,
                        });

                        navigation.goBack();
                    })
                    .catch((e) => {
                        setLoading(false);
                        console.log(e);
                    });
            } catch (e) {
                console.log(e);
                setLoading(false);
            }
        } else {
            Toast.show({
                render: () => {
                    return <ALert status="error" msg="Please set a valid email !" />;
                },
                duration: 2000,
            });
            setLoading(false);
        }
    };

    return (
        <View style={Styles.container}>
            <TouchableOpacity
                style={{ position: "absolute", top: 50, left: 20 }}
                onPress={() => navigation.goBack()}
            >
                <Ionicons name="arrow-back" size={30} color="#fff" />
            </TouchableOpacity>
            <View style={Styles.wrapper}>
                <View style={Styles.header}>
                    <Text style={{ color: "#fff", fontSize: 30 }}>{CONTENT.resetpassTitle}</Text>
                    <Text style={{ color: "#909090", marginVertical: 7 }}>{CONTENT.resetpassDesc}</Text>
                </View>

                <TextInput
                    cursorColor="#007eff"
                    style={[Styles.input, focus && Styles.active]}
                    placeholder={CONTENT.resetpassEmail}
                    placeholderTextColor="#aaaaaa"
                    onChangeText={(text) => {
                        setEmail(text);
                    }}
                    value={email}
                    keyboardType="email-address"
                    maxLength={40}
                    autoCapitalize="none"
                    autoFocus={true}
                    onFocus={() => {
                        setFocus(true);
                    }}
                    onBlur={() => {
                        setFocus(false);
                    }}
                />
                <TouchableOpacity
                    style={[Styles.sendBtn, done && { opacity: 1 }]}
                    onPress={Send_Email}
                    disabled={loading || !done}
                >
                    {loading ? (
                        <ActivityIndicator size={25} color="#fff" />
                    ) : (
                        <Text style={{ color: "#fff", fontSize: 16 }}>{CONTENT.resetpassSend}</Text>
                    )}
                </TouchableOpacity>
            </View>
        </View>
    );
};
export default Reset_Pass;
