import { StyleSheet } from "react-native";
import RootColor from "../../RootColor";

const styles = () => {
    const Root = RootColor();

    return StyleSheet.create({
        Container: {
            flex: 1,
            backgroundColor: Root.CONTAINER,
            paddingBottom: 50,
        },
        avatarCont: {
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#000000",
            overflow: "hidden",
            height: 250,
        },
        titleName: {
            marginTop: 5,
            fontSize: 20,
            color: "#fff",
            marginLeft: 4,
        },
        formContainer: {
            paddingTop: 30,
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
