import { StyleSheet } from "react-native";
import RootColor from "../../RootColor";

const styles = () => {
    const Root = RootColor();

    return StyleSheet.create({
        Container: {
            flex: 1,
            backgroundColor: Root.CONTAINER,
        },
        avatarCont: {
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
            height: 270,
            borderBottomRightRadius: 20,
            borderBottomLeftRadius: 20,
        },
        avatar: {
            width: 120,
            height: 120,
            borderRadius: 120 / 2,
        },
        titleName: {
            marginTop: 5,
            fontSize: 20,
            color: "#fff",
            marginLeft: 4,
        },
        formContainer: {
            paddingTop: 20,
            paddingHorizontal: 30,
        },
        input: {
            borderBottomWidth: 2,
            borderBottomColor: Root.BORDER,
            paddingBottom: 5,
            paddingHorizontal: 6,
            marginBottom: 15,
            fontSize: 18,
            color: Root.VIEW_TXT,
        },
        buttonsCont: {
            height: 90,
            flexDirection: "column",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: 10,
        },
        button: {
            alignItems: "center",
            justifyContent: "center",
            width: 150,
            height: 40,
            borderRadius: 6,
            backgroundColor: Root.BUTTON,
            opacity: 0.2,
        },
    });
};
export default styles;
