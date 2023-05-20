import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
    StyleSheet,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Keyboard,
    ImageBackground,
    ActivityIndicator,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import auth from "@react-native-firebase/auth";
import firestore from "@react-native-firebase/firestore";
import messaging from "@react-native-firebase/messaging";
import styles from "./styles";
import { Ionicons } from "@expo/vector-icons";
import Avatar from "../../Components/Avatar/Avatar";
import { useEffect } from "react";
import Translations from "../../Languages";
import { Toast } from "native-base";
import TOAST from "../../Components/Toast/Toast";

export default () => {
    const Styles = styles();
    const { data } = useSelector((state) => state.user);
    const [Name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [address, setAddress] = useState(data?.address);
    const [phone, setPhone] = useState("");
    const [actvInput, setActvInput] = useState({
        Name: "",
        email: "",
        address: "",
        phone,
    });
    const [allDone, setAllDone] = useState(false);
    const [loading, setLoading] = useState(false);
    const [loadingSignOut, setLoadingSignOut] = useState(false);

    const dispatch = useDispatch();

    const usersRef = firestore().collection("users").doc(data?.id);

    const CONTENT = {
        profNameLb: Translations().t("profNameLb"),
        profPhoneLb: Translations().t("profPhoneLb"),
        profEmailLb: Translations().t("profEmailLb"),
        profAddressLb: Translations().t("profAddressLb"),
        updateBtn: Translations().t("profUpdate"),
    };

    useEffect(() => {
        CheckValidation(address);
    }, [address]);

    const CheckValidation = (add) => {
        if (add.length > 10 && add.trim() !== data?.address) {
            setAllDone(true);
        } else {
            setAllDone(false);
        }
    };

    const updateProfile = async (address) => {
        if (allDone) {
            Keyboard.dismiss();
            setLoading(true);

            await usersRef
                .update({ address })
                .then(() => {
                    dispatch({ type: "userData/Set_User", payload: { address } });
                    setLoading(false);
                    setAllDone(false);
                })
                .catch((e) => console.log(e));

            Toast.show({
                render: () => {
                    return <TOAST status="success" msg="Profile Updated" />;
                },
                duration: 2000,
            });
        }
    };

    const SignOut = async () => {
        setLoadingSignOut(true);
        await messaging().deleteToken();
        auth()
            .signOut()
            .catch((e) => {
                console.log(e);
            });
    };

    return (
        <>
            <View style={Styles.Container}>
                <View style={Styles.avatarCont}>
                    {data?.photo && (
                        <ImageBackground
                            style={{
                                width: "100%",
                                height: "100%",
                                opacity: 0.5,
                                backgroundColor: "#000",
                            }}
                            source={{ uri: data?.photo }}
                            blurRadius={40}
                        />
                    )}

                    <View style={{ position: "absolute", alignItems: "center" }}>
                        <Avatar upload={true} style={Styles.avatar} />
                        <Text style={Styles.titleName}>{data?.Name}</Text>
                    </View>
                </View>

                <KeyboardAwareScrollView style={Styles.formContainer} keyboardShouldPersistTaps="handled">
                    <View style={{ minHeight: 430 }}>
                        <View>
                            <Text style={{ marginBottom: 5, color: "#2196f3" }}>{CONTENT.profNameLb}</Text>
                            <TextInput
                                style={[Styles.input, ActiveThem[actvInput.Name]]}
                                value={Name}
                                placeholder={data?.Name}
                                placeholderTextColor="#919191"
                                onChangeText={(value) => setName(value)}
                                maxLength={20}
                                editable={false}
                                onFocus={() =>
                                    !actvInput.Name &&
                                    setActvInput((prev) => {
                                        return { ...prev, Name: "active" };
                                    })
                                }
                                onBlur={() =>
                                    setActvInput((prev) => {
                                        return { ...prev, Name: "" };
                                    })
                                }
                            />
                        </View>

                        <View>
                            <Text style={{ marginBottom: 5, color: "#2196f3" }}>{CONTENT.profEmailLb}</Text>
                            <TextInput
                                style={[Styles.input, ActiveThem[actvInput.email]]}
                                value={email}
                                placeholder={data?.email}
                                placeholderTextColor="#919191"
                                onChangeText={(value) => setEmail(value)}
                                editable={false}
                                onFocus={() =>
                                    !actvInput.email &&
                                    setActvInput((prev) => {
                                        return { ...prev, email: "active" };
                                    })
                                }
                                onBlur={() =>
                                    setActvInput((prev) => {
                                        return { ...prev, email: "" };
                                    })
                                }
                            />
                        </View>

                        <View>
                            <Text style={{ marginBottom: 5, color: "#2196f3" }}>{CONTENT.profPhoneLb}</Text>
                            <TextInput
                                style={[Styles.input, ActiveThem[actvInput.phone]]}
                                value={phone}
                                placeholder={data?.phone}
                                placeholderTextColor="#919191"
                                onChangeText={(value) => setPhone(value)}
                                maxLength={50}
                                editable={false}
                                onFocus={() =>
                                    !actvInput.phone &&
                                    setActvInput((prev) => {
                                        return { ...prev, phone: "active" };
                                    })
                                }
                                onBlur={() =>
                                    setActvInput((prev) => {
                                        return { ...prev, phone: "" };
                                    })
                                }
                            />
                        </View>
                        <View>
                            <Text style={{ marginBottom: 5, color: "#2196f3" }}>{CONTENT.profAddressLb}</Text>
                            <TextInput
                                style={[Styles.input, ActiveThem[actvInput.address]]}
                                value={address}
                                placeholder={data?.address}
                                placeholderTextColor="#919191"
                                onChangeText={(value) => setAddress(value)}
                                maxLength={50}
                                onFocus={() =>
                                    !actvInput.address &&
                                    setActvInput((prev) => {
                                        return { ...prev, address: "active" };
                                    })
                                }
                                onBlur={() =>
                                    setActvInput((prev) => {
                                        return { ...prev, address: "" };
                                    })
                                }
                            />
                        </View>

                        <View style={Styles.buttonsCont}>
                            <TouchableOpacity
                                style={[Styles.button, allDone && { opacity: 1 }]}
                                disabled={!allDone || loading}
                                onPress={() => updateProfile(address)}
                            >
                                {loading ? (
                                    <ActivityIndicator size={25} color="#fff" />
                                ) : (
                                    <Text style={{ color: "#fff", fontSize: 16 }}>{CONTENT.updateBtn}</Text>
                                )}
                            </TouchableOpacity>

                            <TouchableOpacity onPress={SignOut}>
                                {loadingSignOut ? (
                                    <ActivityIndicator size={25} color="#ff7762" />
                                ) : (
                                    <Ionicons name="log-out-outline" size={25} color="#ff7762" />
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </KeyboardAwareScrollView>
            </View>
        </>
    );
};

const ActiveThem = StyleSheet.create({
    active: {
        borderBottomWidth: 2,
        borderBottomColor: "#2094f3",
    },
});
