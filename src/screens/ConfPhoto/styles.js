import { StyleSheet } from "react-native";
import { useSelector } from "react-redux";
import RootColor from "../../RootColor";

const styles = () => {
    const { theme } = useSelector((state) => state.user);
    const Root = RootColor();
    return StyleSheet.create({
        container: {
            flex: 1,
            flexDirection: "column",
            backgroundColor: Root.CONTAINER,
            paddingTop: 30,
            justifyContent: "space-evenly",
        },
        header: {
            width: "100%",
            paddingHorizontal: 30,
            marginVertical: 30,
        },
        title: {
            color: Root.VIEW_TXT,
            fontSize: 26,
            marginBottom: 20,
        },
        desc: {
            color: Root.SECONDARY_TXT,
            fontSize: 14,
            marginBottom: 5,
        },
        note: {
            color: Root.SECONDARY_TXT,
            fontSize: 14,
        },
        wrapper: {
            width: "100%",
            flexDirection: "column",
            paddingHorizontal: 30,
        },
        Cam: {
            width: "100%",
            height: 200,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: Root.VIEW,
            marginBottom: 10,
            borderRadius: 6,
        },
    });
};
export default styles;
