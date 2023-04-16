import { StyleSheet } from "react-native";
import RootColor from "../../RootColor";
import { useSelector } from "react-redux";

const styles = () => {
    const { lang } = useSelector((state) => state.user);
    const Root = RootColor();

    return StyleSheet.create({
        Container: {
            flex: 1,
            backgroundColor: Root.CONTAINER,
            paddingBottom: 50,
        },
        scrollView: {
            paddingHorizontal: 10,
            marginTop: 10,
        },
        flatList: {
            marginBottom: 30,
        },
        postsHeader: {
            textAlign: "left",
            fontSize: 24,
            fontWeight: "bold",
            color: Root.VIEW_TXT,
            marginBottom: 7,
        },
        post: {
            width: 280,
            height: 160,
            marginRight: 10,
            borderRadius: 12,
            padding: 5,
            backgroundColor: Root.VIEW,
            elevation: 5,
            shadowColor: Root.VIEW_SHADOW,
            overflow: "hidden",
        },
        postImage: {
            width: "100%",
            height: "100%",
            backgroundColor: "#000",
            opacity: 0.9,
            borderRadius: 7,
        },
        content: {
            flex: 1,
            paddingHorizontal: 7,
            paddingVertical: 10,
            flexDirection: "column",
            justifyContent: "center",
        },
        postState: {
            flexDirection: "row",
        },
        avatar: {
            width: 40,
            height: 40,
            borderRadius: 40 / 2,
            backgroundColor: Root.AVATAR,
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 3,
            overflow: "hidden",
        },
        postAuthor: {
            alignSelf: "center",
            fontSize: 16,
            fontWeight: "bold",
            color: "#fff",
            backgroundColor: "#25252580",
            borderRadius: 4,
            paddingHorizontal: 4,
            marginLeft: 3,
        },
        distance: {
            flexDirection: "row",
            alignItems: "center",
            marginRight: 5,
        },
        dateCont: {
            flexDirection: "row",
            alignItems: "center",
        },
        favView: {
            position: "absolute",
            width: 40,
            height: 40,
            top: 5,
            right: 5,
            borderRadius: 40 / 2,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "#0000004d",
            zIndex: 1,
        },
        handlePostBtn: {
            position: "absolute",
            bottom: 80,
            right: 20,
            width: 50,
            height: 50,
            borderRadius: 50 / 2,
            justifyContent: "center",
            alignItems: "center",
            elevation: 10,
            zIndex: 1,
        },
    });
};
export default styles;
