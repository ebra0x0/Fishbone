import { StyleSheet } from "react-native";
import RootColor from "../../RootColor";

const styles = () => {
    const Root = RootColor();

    return StyleSheet.create({
        overlay: {
            position: "absolute",
            width: "100%",
            height: "100%",
            backgroundColor: Root.CONTAINER,
        },
        XBtn: {
            position: "absolute",
            top: 50,
            right: 10,
            zIndex: 1,
        },
        map: {
            width: "100%",
            height: "93%",
        },
        confBtn: {
            position: "absolute",
            bottom: 0,
            width: "100%",
            height: "7%",
            opacity: 0.2,
            backgroundColor: Root.BUTTON,
            justifyContent: "center",
            alignItems: "center",
        },
        activeBtn: { opacity: 1 },
    });
};
export default styles;
