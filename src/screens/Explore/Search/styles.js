import { StyleSheet } from "react-native";
import RootColor from "../../../RootColor";
import { useSelector } from "react-redux";

const styles = () => {
    const { theme } = useSelector((state) => state.user);
    const Root = RootColor();

    return StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: Root.CONTAINER,
        },
        flatlist: {
            paddingHorizontal: 10,
        },
        foodTypeWrapper: {
            height: 80,
            flexDirection: "column",
            elevation: 5,
            marginTop: 100,
            marginBottom: 20,
            justifyContent: "flex-end",
            backgroundColor: theme ? "#00142f" : "#fff",
        },
        foodTypeBtn: {
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
        },
        foodTypeTxt: {
            color: Root.VIEW_TXT,
        },
        row: {
            flex: 1,
            flexDirection: "row",
            minHeight: 100,
            backgroundColor: Root.VIEW,
            borderRadius: 6,
            marginBottom: 6,
            elevation: 5,
            shadowColor: Root.VIEW_SHADOW,
            overflow: "hidden",
        },
        avatar: {
            width: "100%",
            height: "100%",
        },
        contentWrapper: {
            flex: 2,
            flexDirection: "row",
            paddingHorizontal: 10,
        },
        content: {
            flex: 2,
            justifyContent: "center",
            paddingVertical: 5,
            gap: 5,
        },
        name: {
            fontSize: 20,
            fontWeight: "bold",
            color: Root.VIEW_TXT,
            textAlign: "left",
        },
        address: {
            color: Root.VIEW_TXT,
        },
        author: {
            color: "#a0a0a0",
            fontSize: 12,
        },
        expDate: {
            color: Root.VIEW_TXT,
        },
        date: {
            color: "#1785f5",
        },
        btnWrapper: {
            flex: 1,
            alignItems: "flex-end",
            justifyContent: "space-evenly",
            gap: 5,
        },
        btn: {
            paddingHorizontal: 10,
            borderRadius: 4,
            justifyContent: "center",
            alignItems: "center",
        },
    });
};
export default styles;
