import { StyleSheet } from "react-native";
import RootColor from "../../RootColor";

const styles = () => {
    const Root = RootColor();

    return StyleSheet.create({
        Btn: {
            height: 50,
            borderRadius: 6,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: Root.VIEW,
        },
    });
};
export default styles;
