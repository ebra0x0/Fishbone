import { StyleSheet } from "react-native";
import { useSelector } from "react-redux";
import RootColor from "../../RootColor";

const styles = () => {
    const Root = RootColor();

    return StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: Root.CONTAINER,
            paddingBottom: 50,
        },
        wrapper: {
            paddingHorizontal: 20,
        },
        row: {
            flexDirection: "row",
            backgroundColor: Root.VIEW,
            padding: 15,
            borderRadius: 8,
            marginBottom: 10,
            elevation: 5,
            shadowColor: Root.VIEW_SHADOW,
        },
        avatar: {
            width: 48,
            height: 48,
            backgroundColor: Root.AVATAR,
            borderRadius: 48 / 2,
            justifyContent: "center",
            alignItems: "center",
            overflow: "hidden",
        },
    });
};
export default styles;
