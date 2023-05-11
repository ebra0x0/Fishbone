import { StyleSheet } from "react-native";
import RootColor from "../../../RootColor";
import { useSelector } from "react-redux";

const styles = () => {
    const { lang } = useSelector((state) => state.user);
    const Root = RootColor();

    return StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: Root.CONTAINER,
        },
        header: {
            fontSize: 24,
            color: Root.VIEW_TXT,
            paddingHorizontal: 20,
            marginTop: 50,
        },
        wrapper: {
            width: "100%",
            paddingHorizontal: 20,
        },
        avatarCont: {
            height: 180,
            justifyContent: "center",
            alignItems: "center",
        },
        avatar: {
            width: 120,
            height: 120,
            borderRadius: 120 / 2,
        },
        row: {
            flexDirection: lang == "en" ? "row" : "row-reverse",
            marginVertical: 7,
            height: 60,
            alignItems: "center",
            paddingHorizontal: 20,
            borderRadius: 6,
            backgroundColor: Root.VIEW,
            overflow: "hidden",
        },
        input: {
            color: Root.INPUT_TXT,
            fontSize: 16,
            letterSpacing: 1.2,
        },
        txt: { flex: 1, color: Root.VIEW_TXT, fontSize: 18 },
        err: {
            color: Root.ERR_TXT,
        },
        saveBtnCont: {
            flex: 1,
            justifyContent: "flex-end",
            alignItems: "center",
            paddingVertical: 20,
        },
        saveBtn: {
            width: "60%",
            height: 50,
            opacity: 0.2,
            backgroundColor: Root.BUTTON,
            justifyContent: "center",
            alignItems: "center",
            borderRadius: 5,
        },
        ActiveBtn: {
            opacity: 1,
        },
    });
};
export default styles;
