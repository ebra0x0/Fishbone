import { Image, StyleSheet, Text, View } from "react-native";
import React from "react";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useSelector } from "react-redux";
import RootColor from "../RootColor";
import Translations from "../Languages";

export default () => {
    const { theme } = useSelector((state) => state.user);
    const Root = RootColor();

    const CONTENT = {
        noconnectionTitle: Translations().t("noconnectionTitle"),
        noconnectionTrySteps: Translations().t("noconnectionTrySteps"),
        noconnectionStep1: Translations().t("noconnectionStep1"),
        noconnectionStep2: Translations().t("noconnectionStep2"),
        noconnectionStep3: Translations().t("noconnectionStep3"),
    };

    const Styles = StyleSheet.create({
        container: {
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: Root.CONTAINER,
        },
        row: {
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 7,
        },
        iconColor: "#919191",
        rowTxt: {
            marginLeft: 5,
            color: Root.SECONDARY_TXT,
            fontSize: 16,
        },
    });

    return (
        <View style={Styles.container}>
            <Image style={{ width: 120, height: 120 }} source={require("../../assets/no-connection.png")} />
            <Text
                style={{
                    fontSize: 18,
                    fontWeight: "bold",
                    marginTop: 10,
                    color: theme ? "#fff" : "#454545",
                }}
            >
                {CONTENT.noconnectionTitle}
            </Text>
            <Text style={{ fontSize: 16, marginTop: 5, color: Root.SECONDARY_TXT }}>
                {CONTENT.noconnectionTrySteps}
            </Text>

            <View style={{ marginTop: 50 }}>
                <View style={Styles.row}>
                    <Ionicons name="checkmark-circle" size={20} color={Styles.iconColor} />
                    <Text style={Styles.rowTxt}>{CONTENT.noconnectionStep1}</Text>
                </View>
                <View style={Styles.row}>
                    <Ionicons name="checkmark-circle" size={20} color={Styles.iconColor} />
                    <Text style={Styles.rowTxt}>{CONTENT.noconnectionStep2}</Text>
                </View>
                <View style={Styles.row}>
                    <Ionicons name="checkmark-circle" size={20} color={Styles.iconColor} />
                    <Text style={Styles.rowTxt}>{CONTENT.noconnectionStep3}</Text>
                </View>
            </View>
        </View>
    );
};
