import { StyleSheet } from "react-native";
import RootColor from "../../../RootColor";
import { useSelector } from "react-redux";

const styles = () => {
    const { theme } = useSelector((state) => state.user);
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
            fontSize: 22,
            fontWeight: "bold",
            paddingBottom: 5,
        },
        postDate: {
            color: "#1785f5",
            alignSelf: "flex-end",
            fontSize: 12,
            padding: 5,
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
