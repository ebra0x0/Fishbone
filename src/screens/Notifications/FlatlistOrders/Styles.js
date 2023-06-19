import { StyleSheet } from "react-native";
import RootColor from "../../../RootColor";

const Styles = () => {
    const Root = RootColor();

    return StyleSheet.create({
        Container: {
            flex: 1,
            backgroundColor: Root.CONTAINER,
            paddingTop: 100,
            paddingBottom: 50,
        },
        OrdersView: {
            paddingVertical: 20,
        },
        OrdersCont: {
            paddingHorizontal: 15,
            marginBottom: 15,
        },
        order: {
            borderRadius: 10,
            backgroundColor: Root.VIEW,
            elevation: 5,
            shadowColor: Root.VIEW_SHADOW,
            overflow: "hidden",
        },
        content: {
            flexDirection: "row",
            alignItems: "center",
            padding: 15,
        },
        avatar: {
            width: 40,
            height: 40,
            borderRadius: 20,
        },
        orderInfo: {
            flex: 1,
            flexDirection: "column",
            marginHorizontal: 10,
        },
        srcName: {
            fontSize: 16,
            fontWeight: "bold",
            color: Root.VIEW_TXT,
        },
        dateCont: {
            flexDirection: "row",
            alignItems: "center",
        },
        date: {
            fontSize: 14,
            color: "#00b379",
            marginRight: 3,
        },
        approvalBtnsCont: {
            flex: 1,
            flexDirection: "row",
            justifyContent: "flex-end",
        },
        approvalBtn: {
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            borderRadius: 5,
            marginLeft: 5,
        },
        orderFooter: {
            flex: 1,
            height: 40,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "#1785f5",
        },
    });
};
export default Styles;
