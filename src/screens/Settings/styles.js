import { StyleSheet } from "react-native";
import RootColor from "../../RootColor";
import { useSelector } from "react-redux";

const styles = () => {
    const { lang } = useSelector((state) => state.user);
    const Root = RootColor();

    return StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: Root.CONTAINER,
            paddingTop: 100,
            paddingBottom: 50,
        },
        button: {
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#2196F3",
            height: 50,
            borderRadius: 25,
        },
        wrapper: {
            flexDirection: "column",
            flex: 1,
            paddingTop: 50,
            paddingHorizontal: 20,
            gap: 15,
        },
        row: {
            flexDirection: lang == "en" ? "row" : "row-reverse",
            height: 50,
            alignItems: "center",
            justifyContent: "space-between",
            backgroundColor: Root.VIEW,
            paddingHorizontal: 10,
            borderRadius: 6,
        },
        rowTxt: {
            fontSize: 18,
            color: Root.VIEW_TXT,
        },
        toggleBtn: {
            flexDirection: "row",
            height: 50,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: Root.TOGGLEVIEW,
            borderRadius: 6,
        },
    });
};
export default styles;
