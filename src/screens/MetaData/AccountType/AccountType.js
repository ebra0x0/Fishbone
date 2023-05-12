import React, { useState, useEffect } from "react";
import { View, TouchableOpacity, Text, TextInput, ActivityIndicator } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useDispatch, useSelector } from "react-redux";
import firestore from "@react-native-firebase/firestore";
import Map from "../../../Components/Map/Map";
import Avatar from "../../../Components/Avatar/Avatar";
import VirifyPhone from "../../../Components/VerifiyPhone/VirifyPhone";
import styles from "./styles";
import { Ionicons } from "@expo/vector-icons";
import Translations from "../../../Languages";
import { memo } from "react";

const AccountType = (props) => {
    const Styles = styles();
    const { data, lang } = useSelector((state) => state.user);
    const [loading, setLoading] = useState(false);
    const [mapState, setMapState] = useState(false);
    const [location, setLocation] = useState(null);
    const [fullName, setFullName] = useState({ value: "", valid: null, err: "" });
    const [address, setAddress] = useState({ value: "", valid: null, err: "" });
    const [verifyedPhone, setVerifyedPhone] = useState("");
    const [allDone, setAllDone] = useState(false);

    const { rest } = props;

    const dispatch = useDispatch();

    const CONTENT = {
        acctyperestTitle: Translations().t("acctyperestTitle"),
        acctyperestLocation: Translations().t("acctyperestLocation"),
        acctyperestAddress: Translations().t("acctyperestAddress"),
        acctypeuserTitle: Translations().t("acctypeuserTitle"),
        acctypeuserLocation: Translations().t("acctypeuserLocation"),
        acctypeuserAddress: Translations().t("acctypeuserAddress"),
        acctypeName: Translations().t("acctypeName"),
        acctypeSave: Translations().t("acctypeSave"),
    };

    useEffect(() => {
        if (location && verifyedPhone && address && fullName.valid && data?.photo) {
            setAllDone(true);
        } else {
            setAllDone(false);
        }
    }, [location, verifyedPhone, address, fullName, data?.photo]);

    const updateMapState = (location) => {
        location && setLocation(location);
        setMapState(false);
    };

    const nameValidation = (name, out) => {
        const regex = /^[a-zA-Zء-ي]{1}[a-zA-Zء-ي _]*([_ ][a-zA-Zء-ي]*)?[a-zA-Zء-ي]{2,18}$/;

        const validName = name.trim().match(regex);

        if (validName) {
            setFullName(() => {
                return { value: name.trim(), valid: true, err: "" };
            });
        } else {
            setFullName((prev) => {
                return { ...prev, valid: false, err: out && "This not a valid name !" };
            });
        }
    };

    const addressValidation = (txt, out) => {
        if (fullName.valid) {
            if (txt.length > 10) {
                setAddress((prev) => {
                    return { ...prev, valid: true, value: txt, err: "" };
                });
            } else {
                setAddress((prev) => {
                    return {
                        ...prev,
                        value: txt,
                        valid: false,
                        err: out && "The address isn't clear enough, set more details",
                    };
                });
            }
        }
    };

    const SubmitData = async (location, fullName, address, verifyedPhone) => {
        const MetaData = {
            verified: true,
            Name: fullName,
            userName: fullName.toLowerCase(),
            restaurant: rest,
            location,
            phone: verifyedPhone,
            address: address,
            photo: data?.photo,
        };

        setLoading(true);

        await firestore()
            .collection("users")
            .doc(data?.id)
            .update(MetaData)
            .then(() => {
                dispatch({ type: "userData/Set_User", payload: MetaData });
            })
            .catch((e) => console.log(e));

        setLoading(false);
    };

    return (
        <View style={Styles.container}>
            <Text style={Styles.header}>{rest ? CONTENT.acctyperestTitle : CONTENT.acctypeuserTitle}</Text>
            <View style={Styles.wrapper}>
                <KeyboardAwareScrollView
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    <View style={Styles.avatarCont}>
                        <Avatar style={Styles.avatar} upload={true} disabled={loading} />
                    </View>
                    <View style={{ height: 450 }}>
                        <TouchableOpacity
                            style={Styles.row}
                            onPress={() => {
                                setMapState(true);
                            }}
                            disabled={loading}
                        >
                            <Text style={Styles.txt}>
                                {rest ? CONTENT.acctyperestLocation : CONTENT.acctypeuserLocation}
                            </Text>
                            <Ionicons name="map" size={25} color={location ? "#0dbc79" : "#b7b7b7"} />
                        </TouchableOpacity>

                        <View style={{ justifyContent: "center" }}>
                            <TextInput
                                style={[Styles.row, Styles.input]}
                                placeholder={CONTENT.acctypeName}
                                placeholderTextColor="#7a7a7a"
                                textAlign={lang === "en" ? "left" : "right"}
                                maxLength={20}
                                editable={!loading}
                                value={fullName.value}
                                onChangeText={(text) => {
                                    setFullName((prev) => {
                                        return { ...prev, value: text };
                                    });
                                    nameValidation(text);
                                }}
                                onBlur={() => {
                                    nameValidation(fullName.value, true);
                                }}
                            />
                            {fullName.err && (
                                <Ionicons
                                    style={[
                                        { position: "absolute" },
                                        lang == "en" ? { right: 20 } : { left: 20 },
                                    ]}
                                    name="close-outline"
                                    size={20}
                                    color="#ff4040"
                                />
                            )}
                            {fullName.valid && (
                                <Ionicons
                                    style={[
                                        { position: "absolute" },
                                        lang == "en" ? { right: 20 } : { left: 20 },
                                    ]}
                                    name="checkmark-outline"
                                    size={20}
                                    color="#0dbc79"
                                />
                            )}
                        </View>
                        {fullName.err && <Text style={Styles.err}>{fullName.err}</Text>}

                        <View style={{ justifyContent: "center" }}>
                            <TextInput
                                style={[Styles.row, Styles.input]}
                                value={address.value}
                                placeholder={rest ? CONTENT.acctyperestAddress : CONTENT.acctypeuserAddress}
                                placeholderTextColor="#7a7a7a"
                                textAlign={lang === "en" ? "left" : "right"}
                                maxLength={60}
                                editable={!loading}
                                onChangeText={(txt) => {
                                    setAddress((prev) => {
                                        return { ...prev, value: txt };
                                    });
                                    addressValidation(txt);
                                }}
                                onBlur={() => {
                                    addressValidation(address.value, true);
                                }}
                            />
                            {address.err && (
                                <Ionicons
                                    style={[
                                        { position: "absolute" },
                                        lang == "en" ? { right: 20 } : { left: 20 },
                                    ]}
                                    name="close-outline"
                                    size={20}
                                    color="#ff4040"
                                />
                            )}
                            {address.valid && (
                                <Ionicons
                                    style={[
                                        { position: "absolute" },
                                        lang == "en" ? { right: 20 } : { left: 20 },
                                    ]}
                                    name="checkmark-outline"
                                    size={20}
                                    color="#0dbc79"
                                />
                            )}
                        </View>
                        {address.err && <Text style={Styles.err}>{address.err}</Text>}

                        <VirifyPhone updatePhone={setVerifyedPhone} disabled={loading} />
                    </View>
                </KeyboardAwareScrollView>
            </View>
            <View style={Styles.saveBtnCont}>
                <TouchableOpacity
                    disabled={!allDone}
                    style={[Styles.saveBtn, allDone && Styles.ActiveBtn]}
                    onPress={() => SubmitData(location, fullName.value, address.value, verifyedPhone)}
                >
                    {loading ? (
                        <ActivityIndicator size={30} color="#fff" />
                    ) : (
                        <Text style={{ fontSize: 18, color: "#fff" }}>{CONTENT.acctypeSave}</Text>
                    )}
                </TouchableOpacity>
            </View>

            {mapState && <Map updateMapState={updateMapState} Marker={location} />}
        </View>
    );
};
export default memo(AccountType);
