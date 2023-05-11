import { StyleSheet } from "react-native";
import RootColor from "../../RootColor";
import { useSelector } from "react-redux";

const styles = () => {
    const { theme } = useSelector((state) => state.user);
    const Root = RootColor();

    return StyleSheet.create({
        container: {
            flex: 1,
            paddingTop: 100,
            paddingBottom: 60,
            backgroundColor: Root.CONTAINER,
        },
        wrapper: {
            flex: 1,
            gap: 10,
            marginBottom: 10,
            paddingHorizontal: 10,
            paddingTop: 10,
        },
        row: {
            gap: 5,
        },
        header: {
            fontSize: 18,
            color: Root.VIEW_TXT,
        },
        post: {
            height: 150,
            backgroundColor: Root.VIEW,
            borderRadius: 12,
            padding: 10,
            gap: 5,
            elevation: theme ? 0 : 20,
            shadowColor: "#878787",
        },
        valueTxt: {
            color: Root.VIEW_TXT,
        },
        labelTxt: {
            color: "#a0a0a0",
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
        postBtn: {
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "#1785f5",
            height: 40,
            borderRadius: 7,
        },
        card: {
            flex: 1,
            height: 120,
            backgroundColor: Root.VIEW,
            borderRadius: 12,

            gap: 2,
            overflow: "hidden",
        },
        cardCount: {
            fontSize: 40,
            fontWeight: "bold",
        },
        cardDate: {
            fontSize: 20,
            fontWeight: "bold",
        },
        txtCard: {
            color: "#fff",
        },
    });
};
export default styles;
