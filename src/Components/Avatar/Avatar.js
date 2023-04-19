import React, { useState } from "react";
import { View, TouchableOpacity, Image } from "react-native";
import * as ImagePicker from "expo-image-picker";
import firestore from "@react-native-firebase/firestore";
import storage from "@react-native-firebase/storage";
import { useDispatch, useSelector } from "react-redux";
import { Ionicons } from "@expo/vector-icons";
import styles from "./styles";

const Avatar = (props) => {
    const Styles = styles();
    const { data } = useSelector((state) => state.user);
    const [image, setImage] = useState(data?.photo);

    const { upload } = props;

    const dispatch = useDispatch();

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 4],
            quality: 1,
        });

        if (!result.canceled) {
            setImage(result.assets[0].uri);
            dispatch({ type: "userData/Set_User", payload: { photo: result.assets[0].uri } });
            upload && uploadImage(result.assets[0].uri);
        }
    };

    const uploadImage = async (img) => {
        if (!img) {
            return null;
        }

        const response = await fetch(img);
        const blob = await response.blob();
        const ref = storage()
            .ref()
            .child(img.substring(img.lastIndexOf("/") + 1));
        const snapshot = await ref.put(blob);

        const url = await storage().ref(snapshot.metadata.fullPath).getDownloadURL();

        firestore()
            .collection("users")
            .doc(data?.id)
            .update({ photo: url })
            .catch((e) => console.log(e));
    };

    return (
        <TouchableOpacity onPress={() => pickImage()} touchSoundDisabled>
            <View style={Styles.Avatar}>
                {image ? (
                    <Image
                        style={{ width: "100%", height: "100%" }}
                        source={{ uri: image || !data?.photo }}
                    />
                ) : (
                    <Ionicons style={{ paddingLeft: 4 }} name="add-outline" size={60} color="#b7b7b7" />
                )}
            </View>
        </TouchableOpacity>
    );
};

export default Avatar;
