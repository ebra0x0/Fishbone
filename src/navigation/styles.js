import { Dimensions, StyleSheet } from "react-native";
import { useSelector } from "react-redux";

const ScreenX = Dimensions.get("screen").width;
const styles = () => {
    const { theme, lang } = useSelector((state) => state.user);
    return StyleSheet.create({
        tabBar: {
            position: "absolute",
            paddingHorizontal: ScreenX / 8,
            height: 50,
            paddingBottom: 10,
            bottom: 0,
            borderTopWidth: 0,
            backgroundColor: "#00102380",
            alignItems: "center",
            elevation: 0,
        },
        iconTabs: "#a5a5a5",
        Badge: {
            backgroundColor: "#dd4c35",
            width: 18,
            height: 18,
            top: 7,
            left: 0,
            borderWidth: 2,
            borderColor: theme ? "#001023" : "#efefef",
            fontSize: 10,
            fontWeight: "bold",
        },
        activeTabs: "#2ebeff",
    });
};
export default styles;
