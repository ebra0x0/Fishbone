import { StyleSheet } from "react-native";
import RootColor from "../../RootColor";

const styles = () => {
    const Root = RootColor();

    return StyleSheet.create({
        Avatar: {
            width: 120,
            height: 120,
            borderRadius: 120 / 2,
            backgroundColor: Root.VIEW,
            overflow: "hidden",
            justifyContent: "center",
            alignItems: "center",
        },
    });
};
export default styles;
