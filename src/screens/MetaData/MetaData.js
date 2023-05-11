import React, { useState } from "react";
import { TouchableOpacity, View, Text } from "react-native";
import styles from "./styles";
import AccountType from "./AccountType/AccountType";
import { Ionicons } from "@expo/vector-icons";
import { useSelector } from "react-redux";
import Translations from "../../Languages";
import { Image } from "react-native";

export default () => {
    const Styles = styles();
    const { theme } = useSelector((state) => state.user);
    const [accType, setAccType] = useState({ rest: null });

    const CONTENT = {
        metadataTitle: Translations().t("metadataTitle"),
        metadataDesc: Translations().t("metadataDesc"),
        metadataNote: Translations().t("metadataNote"),
        metadataRest: Translations().t("metadataRest"),
        metadataUser: Translations().t("metadataUser"),
    };

    const MAIN = () => {
        return (
            <View style={Styles.container}>
                <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                    <View style={Styles.header}>
                        <Text style={Styles.title}>{CONTENT.metadataTitle}</Text>
                        <Text style={Styles.desc}>{CONTENT.metadataDesc}</Text>
                        <Text style={Styles.desc}>{CONTENT.metadataNote}</Text>
                    </View>

                    <View style={Styles.wrapper}>
                        <TouchableOpacity style={Styles.option} onPress={() => setAccType({ rest: true })}>
                            <Image
                                style={{ width: 90, height: 90 }}
                                source={require("../../../assets/rest.png")}
                            />
                            <Text style={Styles.optTxt}>{CONTENT.metadataRest}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={Styles.option} onPress={() => setAccType({ rest: false })}>
                            <Image
                                style={{ width: 90, height: 90 }}
                                source={require("../../../assets/user.png")}
                            />
                            <Text style={Styles.optTxt}>{CONTENT.metadataUser}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        );
    };

    return accType.rest === null ? <MAIN /> : <AccountType rest={accType.rest} />;
};
