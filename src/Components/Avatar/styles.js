import { StyleSheet } from "react-native";
import { useSelector } from "react-redux";
import RootColor from "../../RootColor";

const styles = () => {
    const { theme } = useSelector((state) => state.user);
    const Root = RootColor();

    return StyleSheet.create({
        Avatar: {
            width: 120,
            height: 120,
            borderRadius: 120 / 2,
            backgroundColor: Root.SECONDARY_TXT,
            overflow: "hidden",
            justifyContent: "center",
            alignItems: "center",
        },
    });
};
export default styles;
