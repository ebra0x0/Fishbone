import { StyleSheet } from "react-native";
import RootColor from "../../RootColor";
import { useSelector } from "react-redux";

const styles = () => {
    const { theme } = useSelector((state) => state.user);
    const Root = RootColor();

    return StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: Root.CONTAINER,
            paddingTop: 100,
            paddingBottom: 50,
        },
        wrapper: {
            paddingHorizontal: 20,
            minHeight: 580,
            paddingTop: 20,
        },
        pickImageBtn: {
            width: "100%",
            height: 150,
            justifyContent: "center",
            alignItems: "center",
            marginBottom: 60,
            backgroundColor: Root.VIEW,
            borderRadius: 4,
            shadowColor: "#878787",
            elevation: theme ? 0 : 20,
            overflow: "hidden",
        },
        input: {
            height: 50,
            backgroundColor: Root.VIEW,
            color: Root.VIEW_TXT,
            borderRadius: 5,
            paddingHorizontal: 10,
            marginBottom: 15,
        },
        saveBtnCont: {
            flex: 1,
            justifyContent: "flex-end",
            alignItems: "center",
            paddingVertical: 10,
        },
        saveBtn: {
            width: "60%",
            height: 50,
            opacity: 0.2,
            backgroundColor: Root.BUTTON,
            justifyContent: "center",
            alignItems: "center",
            borderRadius: 5,
        },
        ActiveBtn: {
            opacity: 1,
        },
    });
};
export default styles;
