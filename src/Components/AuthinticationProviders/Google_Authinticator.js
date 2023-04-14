import { GoogleSignin } from "@react-native-google-signin/google-signin";
import firestore from "@react-native-firebase/firestore";
import auth from "@react-native-firebase/auth";

const Google_Authinticator = async (props) => {
    GoogleSignin.configure({
        webClientId: "42110445955-vcjih6qgrbmmca3o174u02a1ud24ujk0.apps.googleusercontent.com",
    });

    try {
        // Check if your device supports Google Play
        await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });

        // Get the users ID token
        const { idToken } = await GoogleSignin.signIn();

        // Create a Google credential with the token
        const Credential = auth.GoogleAuthProvider.credential(idToken);

        props.update(true);
        auth()
            .signInWithCredential(Credential)
            .then(async (user) => {
                if (user.additionalUserInfo.isNewUser) {
                    const usersRef = firestore().collection("users");

                    const { uid, photoURL, displayName, email } = user.user;
                    const Data = {
                        id: uid,
                        Name: displayName,
                        email,
                        photo: await Resized_Img(photoURL),
                        verified: false,
                    };

                    usersRef
                        .doc(uid)
                        .set(Data)
                        .catch((e) => {
                            console.log(e);
                            props.update(false);
                        });
                }
            })
            .catch((e) => {
                console.log(e);
                props.update(false);
            });
    } catch (e) {
        props.update(false);
    }

    const Resized_Img = (img) => {
        let target = "=";
        let url = "";

        if (img.includes(target)) {
            let index = img.indexOf(target);
            let last = img.substring(index + 1);
            let newSize = last.replace("s", "l");
            url = img.substring(0, index + 1).concat(newSize);
            return url;
        } else {
            console.log("image not changed");
            return img;
        }
    };
};
export default Google_Authinticator;
