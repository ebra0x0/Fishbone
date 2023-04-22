import React, { useState, useEffect, useRef } from "react";
import { View, Text, Keyboard, TextInput, TouchableOpacity, ActivityIndicator } from "react-native";
import auth from "@react-native-firebase/auth";
import { Ionicons } from "@expo/vector-icons";
import { isDevice } from "expo-device";
import styles from "./styles";
import ALert from "../Alert/Alert";
import { Toast } from "native-base";
import Translations from "../../Languages";

const VirifyPhone = (props) => {
    const Styles = styles();
    const [Phone, setPhone] = useState({
        value: "",
        valid: false,
        err: "",
        verified: false,
    });
    const [verification, setVerification] = useState({ id: "", code: "", number: "" });
    const [userVCode, setUserVCode] = useState("");
    const [loading, setLoading] = useState({ send: false, virify: false });

    const { updatePhone, disabled } = props;

    const [timer, setTimer] = useState({ started: false, value: 60 });
    const intervalRef = useRef();

    const CONTENT = {
        acctypePhone: Translations().t("acctypePhone"),
        acctypeSendCode: Translations().t("acctypeSendCode"),
        acctypeResend: Translations().t("acctypeResend"),
        acctypeCode: Translations().t("acctypeCode"),
        acctypeVcode: Translations().t("acctypeVcode"),
    };

    useEffect(() => {
        if (Phone.verified) {
            updatePhone(Phone.value);
        }
    }, [Phone]);
    useEffect(() => {
        return () => {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        };
    }, []);

    const phoneValidation = (value, out) => {
        const REGEX = /^(01)(0|1|2|5)(\d{8})$/;
        if (value.match(REGEX)) {
            setPhone((prev) => {
                return { ...prev, value, valid: true, err: "" };
            });
        } else {
            setPhone((prev) => {
                return { ...prev, value, valid: false, err: out && "Invalid phone number !" };
            });
        }
    };

    const sendVerificationCode = async (Pnumber) => {
        try {
            if (isDevice) {
                setLoading((prev) => {
                    return { ...prev, send: true };
                });
                const confirmation = await auth()
                    .verifyPhoneNumber("+2" + Pnumber)
                    .catch((e) => {
                        Toast.show({
                            render: () => {
                                return <ALert status="error" msg="Verification code failed to sent!" />;
                            },
                            duration: 2000,
                        });

                        setLoading(false);
                        console.log(e);
                    });
                setLoading(false);
                if (confirmation) {
                    verification.id && StartTimer();
                    setVerification({
                        id: confirmation.verificationId,
                        code: confirmation.code,
                        number: Pnumber,
                    });
                }
            } else {
                Toast.show({
                    render: () => {
                        return (
                            <ALert
                                status="error"
                                msg="Looks like your using an emulator! please try with a real phone"
                            />
                        );
                    },
                    duration: 5000,
                });
            }
        } catch (e) {
            setLoading(false);
            console.log(e);
        }
    };

    const verifyVerificationCode = async () => {
        try {
            const number = Phone.value === verification.number;
            const code = userVCode === verification.code;

            Keyboard.dismiss();

            if (code && number) {
                setLoading((prev) => {
                    return { ...prev, virify: true };
                });
                setPhone((prev) => {
                    return { ...prev, verified: true, err: "" };
                });
                setVerification({ id: "", code: "" });
            } else {
                setPhone((prev) => {
                    return { ...prev, err: "The Code is'nt correct !" };
                });
            }
        } catch (e) {
            console.log(e);
        }
    };

    const StartTimer = () => {
        if (!intervalRef.current) {
            intervalRef.current = setInterval(() => {
                setTimer((prevTimer) => {
                    if (prevTimer.value === 1) {
                        clearInterval(intervalRef.current);
                        intervalRef.current = null;
                        return { started: false, value: 60 };
                    } else {
                        return { started: true, value: prevTimer.value - 1 };
                    }
                });
            }, 1000);
        }
    };

    return (
        <>
            <View style={Styles.PhWrapper}>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <TextInput
                        style={Styles.input}
                        value={Phone.value}
                        placeholder={CONTENT.acctypePhone}
                        placeholderTextColor="#7a7a7a"
                        keyboardType="phone-pad"
                        maxLength={11}
                        editable={Phone.verified ? !disabled : true}
                        onChangeText={(value) => {
                            setPhone((prev) => {
                                return { ...prev, value: value };
                            });

                            phoneValidation(value);
                        }}
                        onBlur={() => {
                            phoneValidation(Phone.value, true);
                        }}
                    />
                    {!Phone.verified ? (
                        <TouchableOpacity
                            style={[
                                Styles.CodeBtn,
                                Phone.valid && !timer.started && { backgroundColor: "#1785f5" },
                            ]}
                            disabled={
                                !disabled
                                    ? Phone.valid
                                        ? timer.started
                                            ? true
                                            : loading.send
                                        : true
                                    : true
                            }
                            onPress={() => sendVerificationCode(Phone.value)}
                        >
                            {loading.send ? (
                                <ActivityIndicator size={20} color="#fff" />
                            ) : (
                                <Text
                                    style={{
                                        color: Phone.valid ? (timer.started ? "#6a6a6a" : "#fff") : "#6a6a6a",
                                        fontSize: 14,
                                    }}
                                >
                                    {timer.started
                                        ? timer.value
                                        : verification.id
                                        ? CONTENT.acctypeResend
                                        : CONTENT.acctypeSendCode}
                                </Text>
                            )}
                        </TouchableOpacity>
                    ) : (
                        <Ionicons
                            style={{ position: "absolute", right: 15 }}
                            name="checkmark-done-circle-outline"
                            size={30}
                            color="#0dbc79"
                        />
                    )}
                </View>

                {verification.id && (
                    <View style={{ flexDirection: "row", alignItems: "center" }}>
                        <TextInput
                            style={Styles.input}
                            placeholder={CONTENT.acctypeCode}
                            placeholderTextColor="#7a7a7a"
                            maxLength={10}
                            editable={!disabled}
                            textAlign="left"
                            value={userVCode}
                            onChangeText={(code) => setUserVCode(code)}
                        />
                        <TouchableOpacity
                            disabled={!disabled ? (userVCode ? loading.virify : true) : true}
                            style={[Styles.CodeBtn, userVCode && { backgroundColor: "#1785f5" }]}
                            onPress={() => verifyVerificationCode()}
                        >
                            {loading.virify ? (
                                <ActivityIndicator size={20} color="#fff" />
                            ) : (
                                <Text style={{ color: userVCode ? "#fff" : "#6a6a6a" }}>
                                    {CONTENT.acctypeVcode}
                                </Text>
                            )}
                        </TouchableOpacity>
                    </View>
                )}
            </View>
            {Phone.err && <Text style={Styles.err}>{Phone.err}</Text>}
        </>
    );
};
export default VirifyPhone;
