import React from "react";
import { StyleSheet, View, Image } from "react-native";

export default () => {
    return (
        <View style={Styles.container}>
            <Image style={{ width: "100%", height: "100%" }} source={require("../../Local/splash.png")} />
        </View>
    );
};
const Styles = StyleSheet.create({
    container: {
        width: "100%",
        height: "100%",
        backgroundColor: "#000000",
    },
});
