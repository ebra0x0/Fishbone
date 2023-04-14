import { StyleSheet } from "react-native";
import RootColor from "../../RootColor";

const styles = () => {
    const Root = RootColor();

    return StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: Root.CONTAINER,
        },
        row: {
            flexDirection: "row",
            backgroundColor: Root.VIEW,
            marginHorizontal: 10,
            borderRadius: 6,
            padding: 10,
            marginBottom: 6,
            elevation: 5,
            shadowColor: Root.VIEW_SHADOW,
        },
        avatar: {
            width: 38,
            height: 38,
            backgroundColor: Root.AVATAR,
            borderRadius: 38 / 2,
            justifyContent: "center",
            alignItems: "center",
            overflow: "hidden",
        },
        name: {
            fontSize: 16,
            color: Root.VIEW_TXT,
            marginLeft: 6,
        },
    });
};
export default styles;
