import firestore from "@react-native-firebase/firestore";

const Check_Post_Expired = async (postKey, expiresAt) => {
    const $Posts_Ref = firestore().collection("posts");
    const Post = await $Posts_Ref.doc(postKey).get();

    if (!Post.exists) {
        return true;
    }

    const Timestamp = firestore.Timestamp.now().toDate();

    if (expiresAt <= Timestamp) {
        return true;
    } else {
        return false;
    }
};
export default Check_Post_Expired;
