import firestore from "@react-native-firebase/firestore";

const Check_Post_Expired = async (postKey) => {
    const $Posts_Ref = firestore().collection("posts");

    const closedIn = await $Posts_Ref
        .doc(postKey)
        .get()
        .then((post) => post.data().closedIn);

    const now = new Date(Date.now());
    const exDate = new Date(closedIn?.toDate());

    if (exDate.getTime() <= now.getTime()) {
        return true;
    } else {
        return false;
    }
};
export default Check_Post_Expired;
