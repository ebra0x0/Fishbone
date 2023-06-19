import { StyleSheet } from "react-native";
import RootColor from "../../RootColor";

const styles = () => {
    const Root = RootColor();

    return StyleSheet.create({
        PhWrapper: {
            flexDirection: "column",
            backgroundColor: Root.VIEW,
            overflow: "hidden",
            borderRadius: 5,
        },
        input: {
            width: "100%",
            height: 60,
            color: Root.INPUT_TXT,
            paddingHorizontal: 20,
            fontSize: 16,
            letterSpacing: 1.2,
        },
        CodeBtn: {
            position: "absolute",
            right: 10,
            width: 80,
            height: 40,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: Root.VIEW_SHADOW,
            borderRadius: 6,
        },
        err: {
            color: Root.ERR_TXT,
        },
    });
};
export default styles;
