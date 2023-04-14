import { Linking } from "react-native";
import firestore from "@react-native-firebase/firestore";

const GetDirections = (source) => {
    const $Users_Ref = firestore().collection("users");
    if (source) {
        $Users_Ref
            .doc(source)
            .get()
            .then((user) => {
                const { location } = user.data();

                const url = `google.navigation:q=${location.latitude},${location.longitude}`;

                Linking.canOpenURL(url).then((supported) => {
                    if (supported) {
                        Linking.openURL(url);
                    } else {
                        console.log(`Can't open URL: ${url}`);
                    }
                });
            });
    }
};
export default GetDirections;
