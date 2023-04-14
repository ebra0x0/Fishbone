import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import styles from "./styles";
import ScreenHeader from "../../Components/ScreenHeader/ScreenHeader";
import { Ionicons } from "@expo/vector-icons";
import Translations from "../../Languages";

export default () => {
    const Styles = styles();
    const { theme, lang } = useSelector((state) => state.user);

    const dispatch = useDispatch();

    const themeToggle = () => {
        dispatch({ type: "userData/Set_Theme", payload: theme ? false : true });
    };
    const langToggle = () => {
        dispatch({ type: "userData/Set_Lang", payload: lang == "en" ? "ar" : "en" });
    };

    const CONTENT = {
        settVersion: Translations().t("settVersion"),
        settLightTheme: Translations().t("settLightTheme"),
        settDarkTheme: Translations().t("settDarkTheme"),
    };
    const HeaderTitle = (
        <Text
            style={{
                textAlign: "left",
                flex: 1,
                marginLeft: 6,
                fontSize: 30,
                color: theme ? "#fff" : "#252525",
                fontWeight: "bold",
            }}
        >
            {Translations().t("settTitle")}
        </Text>
    );

    return (
        <View style={Styles.container}>
            <ScreenHeader title={HeaderTitle} />
            <View style={Styles.wrapper}>
                <View style={Styles.row}>
                    <Text style={Styles.rowTxt}>{CONTENT.settVersion}</Text>
                    <Text style={Styles.rowTxt}>1.0.0</Text>
                </View>
                <View
                    style={{
                        flexDirection: "row",
                        marginTop: 20,
                        alignItems: "center",
                        justifyContent: "space-between",
                    }}
                >
                    <TouchableOpacity style={Styles.toggleBtn} onPress={themeToggle}>
                        <Ionicons
                            name={theme ? "sunny-outline" : "moon-outline"}
                            size={20}
                            color={theme ? "#000" : "#fff"}
                        />
                        <Text style={{ color: theme ? "#000" : "#fff", marginLeft: 5, fontWeight: "bold" }}>
                            {theme ? CONTENT.settLightTheme : CONTENT.settDarkTheme}
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[Styles.toggleBtn, { backgroundColor: theme ? "#1e1e1e" : "#fff" }]}
                        onPress={langToggle}
                    >
                        <Text style={{ color: theme ? "#fff" : "#000", fontWeight: "bold" }}>
                            {lang == "en" ? "عربي" : "English"}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
};
