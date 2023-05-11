import { StyleSheet } from "react-native";
import RootColor from "../../RootColor";

const styles = () => {
    const Root = RootColor();

    return StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: Root.CONTAINER,
            paddingTop: 100,
            paddingBottom: 50,
        },
        header: {
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingRight: 20,
        },
        avatar: {
            width: 150,
            height: 150,
            borderRadius: 150 / 2,
        },
        wrapper: {
            paddingHorizontal: 20,
        },
        row: {
            flexDirection: "row",
            alignItems: "center",
            padding: 15,
            marginBottom: 8,
            backgroundColor: Root.VIEW,
            borderRadius: 5,
        },
        mapView: {
            height: 140,
            backgroundColor: Root.VIEW,
            justifyContent: "center",
            alignItems: "center",
        },
        label: {
            marginRight: 10,
        },
        txtRows: {
            flex: 1,
            textAlign: "right",
            color: Root.VIEW_TXT,
            fontSize: 16,
        },
    });
};
export default styles;
