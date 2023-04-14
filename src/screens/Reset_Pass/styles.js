import { StyleSheet } from "react-native";
import RootColor from "../../RootColor";

const styles = () => {
    const Root = RootColor();

    return StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: Root.CONTAINER,
        },
        wrapper: {
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            paddingHorizontal: 20,
        },
        header: {
            alignItems: "center",
        },
        input: {
            width: "100%",
            height: 60,
            borderRadius: 6,
            color: Root.INPUT_TXT,
            paddingHorizontal: 15,
            marginVertical: 50,
            letterSpacing: 1.5,
            fontSize: 16,
            backgroundColor: Root.VIEW,
        },
        active: {
            backgroundColor: "#001c41",
        },
        sendBtn: {
            width: 150,
            height: 45,
            borderRadius: 6,
            opacity: 0.2,
            backgroundColor: Root.BUTTON,
            justifyContent: "center",
            alignItems: "center",
        },
    });
};
export default styles;
