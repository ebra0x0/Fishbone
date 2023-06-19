import { StyleSheet } from "react-native";
import RootColor from "../../../RootColor";
import { useSelector } from "react-redux";

const styles = () => {
    const Root = RootColor();

    return StyleSheet.create({
        container: {
            flex: 1,
            paddingTop: 100,
            paddingBottom: 50,
            backgroundColor: Root.CONTAINER,
        },
        order: {
            flex: 1,
            flexDirection: "row",
            backgroundColor: Root.VIEW,
            paddingHorizontal: 20,
            paddingVertical: 10,
            marginBottom: 10,
            alignItems: "center",
            borderRadius: 6,
            gap: 6,
            overflow: "hidden",
        },
        avatar: {
            width: 70,
            height: 70,
            borderRadius: 70 / 2,
        },
        orderName: {
            fontSize: 18,
            color: Root.VIEW_TXT,
        },
        orderStatus: {
            width: 130,
            height: 35,
            justifyContent: "center",
            alignItems: "center",
            borderRadius: 4,
        },
        statusTxt: {
            color: "#fff",
        },
        postDate: {
            color: "#1785f5",
            fontSize: 12,
            paddingTop: 5,
        },
    });
};
export default styles;
