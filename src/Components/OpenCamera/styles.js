import { StyleSheet } from "react-native";
import RootColor from "../../RootColor";

const styles = () => {
    const Root = RootColor();
    return StyleSheet.create({
        CameraContainer: {
            flex: 1,
            backgroundColor: Root.CONTAINER,
        },
        overlay: {
            position: "absolute",
            width: "100%",
            height: "100%",
            backgroundColor: "#00000066",
            justifyContent: "center",
            alignItems: "center",
        },
        alertBox: {
            width: "90%",
            height: 170,
            justifyContent: "space-evenly",
            alignItems: "center",
            borderRadius: 20,
            paddingHorizontal: 30,
            backgroundColor: "#0e1b2a",
        },
        camera: {
            flex: 1,
        },
        footer: {
            position: "absolute",
            width: "100%",
            height: 100,
            flexDirection: "row",
            bottom: 0,
            justifyContent: "space-around",
            alignItems: "center",
        },
        shutterCont: {
            flex: 1,
            alignItems: "center",
        },
        shutterBtn: {
            justifyContent: "center",
            alignItems: "center",
        },
        toggleCamBtnCont: {
            flex: 1,
            alignItems: "center",
        },
        toggleCamBtn: {
            width: 50,
            height: 50,
            borderRadius: 50 / 2,
            backgroundColor: "#eee",
            justifyContent: "center",
            alignItems: "center",
        },
    });
};
export default styles;
