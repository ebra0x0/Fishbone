import { StyleSheet } from "react-native";
import RootColor from "../../RootColor";

const Styles = () => {
    return StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: "#00152d",
        },
        SVG: {
            flex: 1,
        },
        wrapper: {
            flex: 1,
            justifyContent: "space-evenly",
        },
        title: {
            paddingLeft: 20,
            paddingRight: 50,
        },
        button: {
            flex: 1,
            height: 48,
            backgroundColor: "#001b3c",
            borderRadius: 20,
            justifyContent: "center",
            alignItems: "center",
        },
    });
};
export default Styles;
