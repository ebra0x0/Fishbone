import { StyleSheet } from "react-native";
import RootColor from "../../RootColor";
import { Dimensions } from "react-native";

const styles = () => {
    const Root = RootColor();
    const Screen = { x: Dimensions.get("screen").width, y: Dimensions.get("screen").height };

    return StyleSheet.create({
        msgWrapper: {
            position: "absolute",
            transform: [{ translateX: (Screen.x - 250) / 2 }, { translateY: (Screen.y - 250) / 2 }],
            width: 250,
            height: 250,
            padding: 15,
            paddingHorizontal: 25,
            borderRadius: 8,
            backgroundColor: Root.VIEW,
            alignItems: "center",
            justifyContent: "center",
        },
        icon: {
            width: 80,
            height: 80,
            marginBottom: 5,
        },
        title: {
            flex: 2,
            alignItems: "center",
            justifyContent: "center",
        },
        titleTxt: {
            color: Root.VIEW_TXT,
            fontSize: 18,
        },
        msg: {
            flex: 1,
            justifyContent: "center",
        },
        msgTxt: {
            color: Root.VIEW_TXT,
            textAlign: "center",
            fontSize: 16,
        },
        btnCont: {
            flex: 1,
            justifyContent: "center",
        },
        btn: {
            width: 130,
            height: 35,
            borderRadius: 4,
            backgroundColor: "#1785f5",
            justifyContent: "center",
            alignItems: "center",
        },
        close: {
            position: "absolute",
            top: 15,
            right: 15,
            color: Root.VIEW_TXT,
        },
    });
};
export default styles;
