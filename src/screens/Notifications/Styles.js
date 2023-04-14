import { StyleSheet } from "react-native";
import { useSelector } from "react-redux";
import RootColor from "../../RootColor";

const Styles = () => {
    const { lang } = useSelector((state) => state.user);
    const Root = RootColor();

    return StyleSheet.create({
        Container: {
            flex: 1,
            backgroundColor: Root.CONTAINER,
            paddingBottom: 50,
        },
        OrdersView: {
            paddingTop: 10,
        },
        OrdersCont: {
            paddingHorizontal: 25,
        },
        order: {
            marginBottom: 10,
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
            backgroundColor: Root.AVATAR,
            overflow: "hidden",
            justifyContent: "center",
            alignItems: "center",
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
            height: 40,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "#1785f5",
        },
    });
};
export default Styles;
