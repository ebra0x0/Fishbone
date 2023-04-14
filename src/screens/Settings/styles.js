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
            paddingBottom: 50,
        },
        wrapper: {
            flexDirection: "column",
            flex: 1,
            paddingTop: 50,
            paddingHorizontal: 20,
        },
        row: {
            flexDirection: lang == "en" ? "row" : "row-reverse",
            height: 60,
            marginBottom: 10,
            alignItems: "center",
            justifyContent: "space-between",
        },
        rowTxt: {
            fontSize: 18,
            color: Root.VIEW_TXT,
        },
        toggleBtn: {
            flexDirection: "row",
            width: "49%",
            height: 40,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: Root.TOGGLEVIEW,
            borderRadius: 6,
        },
    });
};
export default styles;
