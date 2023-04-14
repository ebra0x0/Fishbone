import { StyleSheet } from "react-native";
import { useSelector } from "react-redux";
import RootColor from "../../RootColor";

const styles = () => {
    const { theme } = useSelector((state) => state.user);
    const Root = RootColor();
    return StyleSheet.create({
        container: {
            flex: 1,
            paddingTop: 120,
            backgroundColor: Root.CONTAINER,
            paddingHorizontal: 30,
        },
        headerTxt: {
            fontSize: 35,
            color: Root.VIEW_TXT,
        },
        errMsg: {
            alignItems: "center",
            marginBottom: 15,
        },
        errMsgTxt: {
            color: Root.ERR_TXT,
            fontSize: 16,
        },
        input: {
            height: 55,
            borderRadius: 6,
            overflow: "hidden",
            backgroundColor: Root.VIEW,
            borderColor: Root.BORDER,
            marginVertical: 8,
            paddingHorizontal: 15,
            color: Root.ACTIVE,
            fontSize: 14,
            letterSpacing: 1.5,
        },
        passToggle: {
            position: "absolute",
            right: 20,
        },
        loginBtn: {
            backgroundColor: Root.BUTTON,
            opacity: 0.2,
            marginTop: 30,
            height: 50,
            borderRadius: 6,
            alignItems: "center",
            justifyContent: "center",
        },
        loginBtnTitle: {
            color: "#fff",
            fontSize: 17,
            fontWeight: "bold",
        },
        footerView: {
            alignItems: "center",
            marginTop: 20,
        },
        footerText: {
            fontSize: 16,
            color: Root.FOTTER_TXT,
        },
        footerLink: {
            color: Root.ACTIVE,
            fontWeight: "bold",
            fontSize: 16,
        },
        linksCont: {
            width: "100%",
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
            marginTop: 30,
        },
        link: {
            width: 70,
            justifyContent: "center",
            alignItems: "center",
        },
    });
};
export default styles;
