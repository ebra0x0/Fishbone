import firestore from "@react-native-firebase/firestore";
import auth from "@react-native-firebase/auth";
import { LoginManager, AccessToken } from "react-native-fbsdk-next";

const FB_Authinticator = async (props) => {
    try {
        // Attempt login with permissions
        const result = await LoginManager.logInWithPermissions(["public_profile", "email"]);

        if (result.isCancelled) {
            throw "User cancelled the login process";
        }

        // Once signed in, get the users AccesToken
        const data = await AccessToken.getCurrentAccessToken();

        if (!data) {
            throw "Something went wrong obtaining access token";
        }

        // Create a Firebase credential with the AccessToken
        const facebookCredential = auth.FacebookAuthProvider.credential(data.accessToken);

        props.update(true);
        auth()
            .signInWithCredential(facebookCredential)
            .then((user) => {
                if (user.additionalUserInfo.isNewUser) {
                    const usersRef = firestore().collection("users");

                    const { uid, photoURL, displayName, email } = user.user;
                    const Data = {
                        id: uid,
                        Name: displayName,
                        email,
                        photo: photoURL,
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
        console.log(e);
        props.update(false);
    }
};

export default FB_Authinticator;
