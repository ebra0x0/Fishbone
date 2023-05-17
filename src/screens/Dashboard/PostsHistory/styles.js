import { StyleSheet } from "react-native";
import RootColor from "../../../RootColor";

const styles = () => {
    const Root = RootColor();

    return StyleSheet.create({
        container: {
            flex: 1,
            paddingTop: 100,
            paddingBottom: 50,
            backgroundColor: Root.CONTAINER,
        },
        post: {
            height: 200,
            backgroundColor: Root.VIEW,
            marginBottom: 10,
            borderRadius: 6,
            overflow: "hidden",
        },
        postHeader: {
            color: Root.VIEW_TXT,
            fontSize: 24,
            fontWeight: "bold",
            paddingBottom: 5,
        },
        postFooter: {
            flexDirection: "row",
            justifyContent: "space-between",
            paddingHorizontal: 10,
            paddingBottom: 3,
            fontSize: 14,
        },
        postOrdersCount: {
            color: Root.VIEW_TXT,
        },
        postDate: {
            color: "#1785f5",
        },
        actvBuble: {
            position: "absolute",
            top: 10,
            right: 10,
            width: 10,
            height: 10,
            borderRadius: 10 / 2,
            backgroundColor: "#0dbc79",
            elevation: 3,
            shadowColor: "#00ff98",
        },
    });
};
export default styles;
