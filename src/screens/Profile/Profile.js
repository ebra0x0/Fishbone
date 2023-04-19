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
import ALert from "../../Components/Alert/Alert";
import { useToast } from "native-base";

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

    const dispatch = useDispatch();
    const Toast = useToast();

    const usersRef = firestore().collection("users").doc(data?.id);

    const CONTENT = {
        profNameLb: Translations().t("profNameLb"),
        profPhoneLb: Translations().t("profPhoneLb"),
        profEmailLb: Translations().t("profEmailLb"),
        profAddressLb: Translations().t("profAddressLb"),
        updateBtn: Translations().t("profUpdate"),
    };

    useEffect(() => {
        if (address.length > 10 && address.trim() !== data?.address) {
            setAllDone(true);
        } else {
            setAllDone(false);
        }
    }, [address]);

    const updateProfile = async () => {
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
                    return <ALert status="success" msg="Profile Updated" />;
                },
                duration: 2000,
            });
        }
    };

    const SignOut = async () => {
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
                                position: "absolute",
                                width: "100%",
                                height: "100%",
                                opacity: 0.3,
                                backgroundColor: "#000000",
                            }}
                            source={{ uri: data?.photo }}
                            blurRadius={30}
                        />
                    )}

                    <Avatar upload={true} />

                    <Text style={Styles.titleName}>{data?.Name || "User Name"}</Text>
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
                                onPress={updateProfile}
                            >
                                {loading ? (
                                    <ActivityIndicator size={30} color="#fff" />
                                ) : (
                                    <Text style={{ color: "#fff", fontSize: 16 }}>{CONTENT.updateBtn}</Text>
                                )}
                            </TouchableOpacity>

                            <TouchableOpacity onPress={SignOut}>
                                <Ionicons name="log-out-outline" size={25} color="#ff7762" />
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
