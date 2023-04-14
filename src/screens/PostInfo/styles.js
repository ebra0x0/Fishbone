import { StyleSheet } from "react-native";
import { useSelector } from "react-redux";
import RootColor from "../../RootColor";

const styles = () => {
    const { theme } = useSelector((state) => state.user);
    const Root = RootColor();

    return StyleSheet.create({
        container: {
            flex: 1,
            paddingBottom: 50,
            backgroundColor: Root.CONTAINER,
        },
        arrowView: {
            position: "absolute",
            width: 40,
            height: 40,
            top: 30,
            left: 20,
            borderRadius: 40 / 2,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "#0000004d",
            zIndex: 1,
        },
        imageView: {
            width: "100%",
            height: 300,
            overflow: "hidden",
        },
        restTitle: {
            position: "absolute",
            bottom: 10,
            flexDirection: "row",
            alignItems: "center",
            width: 200,
            paddingLeft: 10,
        },
        wrapper: {
            flex: 1,
            paddingLeft: 15,
        },
        postData: {
            flexDirection: "column",
            paddingTop: 30,
        },
        txt: {
            fontSize: 16,
            color: Root.VIEW_TXT,
        },
        row: {
            flexDirection: "row",
            alignItems: "center",
        },
        postContent: {
            marginTop: 60,
            paddingRight: 15,
        },
        postTitle: {
            fontSize: 24,
            fontWeight: "bold",
            color: Root.VIEW_TXT,
            marginBottom: 8,
        },
        btn: {
            width: "60%",
            height: 50,
            backgroundColor: Root.BUTTON,
            justifyContent: "center",
            alignItems: "center",
            borderRadius: 5,
            marginVertical: 5,
            alignSelf: "center",
        },
    });
};
export default styles;
