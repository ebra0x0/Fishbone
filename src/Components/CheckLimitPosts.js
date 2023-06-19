import firestore from "@react-native-firebase/firestore";
const __Get_Elapsed__ = (date) => {
    if (date) {
        const currDate = new Date();
        const start = new Date(date?.toDate());
        const elapsedTime = currDate - start;

        return elapsedTime;
    } else {
        return "";
    }
};
const CheckLimitPosts = async (id) => {
    let reachedLimit = null;
    const $User_Ref = firestore().collection("users").doc(id);
    await $User_Ref
        .collection("posts")
        .get()
        .then((querySnapshot) => {
            let dayPosts = 0;

            if (querySnapshot?.size) {
                querySnapshot.forEach((post, indx) => {
                    const { date } = post.data();

                    const elapsed = __Get_Elapsed__(date) / (1000 * 60 * 60 * 24);

                    elapsed < 1 && dayPosts++;
                    if (indx + 1 == querySnapshot?.size) {
                        if (dayPosts >= 5) {
                            reachedLimit = true;
                        } else {
                            reachedLimit = false;
                        }
                    }
                });
            }
        });
    return reachedLimit;
};

export default CheckLimitPosts;
