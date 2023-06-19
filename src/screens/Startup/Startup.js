import React from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import Styles from "./Styles";
import Translations from "../../Languages";

export default ({ navigation }) => {
    const styles = Styles();

    return (
        <View style={styles.container}>
            <Image
                style={{ width: "100%", height: "100%", opacity: 0.6 }}
                source={require("../../../assets/canava.jpg")}
            />

            <View style={styles.wrapper}>
                <View style={styles.title}>
                    <Text style={{ fontSize: 40, color: "#fff", marginBottom: 10, fontWeight: "bold" }}>
                        {Translations().t("greeting")}
                    </Text>
                    <Text style={{ fontSize: 16, color: "#fff" }}>
                        {Translations().t("greetingDesc")}
                        <Text style={{ color: "#3e9cfb", fontWeight: "bold" }}>
                            {Translations().t("greetingDescJoin")}
                        </Text>
                    </Text>
                </View>
                <View
                    style={{
                        marginHorizontal: 15,
                        justifyContent: "center",
                        flexDirection: "column",
                        gap: 15,
                    }}
                >
                    <TouchableOpacity style={styles.button} onPress={() => navigation.replace("Login")}>
                        <Text style={{ fontSize: 17, fontWeight: "bold", color: "#fff" }}>
                            {Translations().t("greetingSignIn")}
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.button, { backgroundColor: "#0e0e0e" }]}
                        onPress={() => navigation.replace("Registration")}
                    >
                        <Text style={{ fontSize: 17, fontWeight: "bold", color: "#fff" }}>
                            {Translations().t("greetingSignUp")}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
};
