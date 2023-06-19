import { StyleSheet } from "react-native";

const Styles = () => {
    return StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: "#001023",
        },
        SVG: {
            flex: 1,
        },
        wrapper: {
            position: "absolute",
            width: "100%",
            bottom: 0,
            gap: 30,
            paddingVertical: 30,
            paddingHorizontal: 15,
            backgroundColor: "#011631",
            borderRadius: 30,
        },
        title: {
            paddingLeft: 20,
            paddingRight: 50,
        },
        button: {
            flex: 1,
            height: 48,
            backgroundColor: "#001837",
            borderRadius: 10,
            justifyContent: "center",
            alignItems: "center",
        },
    });
};
export default Styles;
