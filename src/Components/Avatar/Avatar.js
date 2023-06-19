import React, { useState } from "react";
import { View, TouchableOpacity, Image } from "react-native";
import * as ImagePicker from "expo-image-picker";
import firestore from "@react-native-firebase/firestore";
import storage from "@react-native-firebase/storage";
import { useDispatch, useSelector } from "react-redux";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { Skeleton } from "native-base";

const Avatar = (props) => {
    const { data, theme } = useSelector((state) => state.user);
    const [image, setImage] = useState(data?.photo);

    const { upload, disabled, profile, style } = props;

    const dispatch = useDispatch();
    const navigation = useNavigation();

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
        <TouchableOpacity
            onPress={() => (profile?.data ? navigation.navigate("OpenProfile", profile?.data) : pickImage())}
            touchSoundDisabled
            disabled={disabled}
        >
            <View
                style={[
                    {
                        overflow: "hidden",
                        justifyContent: "center",
                        alignItems: "center",
                    },
                    style,
                ]}
            >
                {profile?.data || image ? (
                    profile?.data?.photo || image ? (
                        <Skeleton
                            size={style.width}
                            startColor={theme ? "darkBlue.800" : "darkBlue.100"}
                            isLoaded={profile?.data?.photo || image}
                        >
                            <Image
                                style={{ width: "100%", height: "100%" }}
                                source={{ uri: profile?.data ? profile.data?.photo : image || !data?.photo }}
                            />
                        </Skeleton>
                    ) : (
                        <Ionicons name="person" size={style?.width / 2 || 20} color="#2ebeff" />
                    )
                ) : (
                    <Ionicons style={{ paddingLeft: 4 }} name="add-outline" size={60} color="#b7b7b7" />
                )}
            </View>
        </TouchableOpacity>
    );
};

export default Avatar;
