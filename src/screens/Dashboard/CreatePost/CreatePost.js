import React, { useState, useEffect, memo } from "react";
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Image, Keyboard } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import firestore from "@react-native-firebase/firestore";
import storage from "@react-native-firebase/storage";
import * as ImagePicker from "expo-image-picker";
import { Toast } from "native-base";
import styles from "./styles";
import Translations from "../../../Languages";
import ScreenHeader from "../../../Components/ScreenHeader/ScreenHeader";
import TOAST from "../../../Components/TOAST/TOAST";
import SendNotification from "../../../Components/SendNotification";
import PickTime from "../../../Components/PickTime/PickTime";

const CreatePost = ({ navigation }) => {
    const { data, theme } = useSelector((state) => state.user);
    const [foodType, setFoodType] = useState("");
    const [postDesc, setPostDesc] = useState("");
    const [done, setDone] = useState(false);
    const [image, setImage] = useState(null);
    const [loading, setLoading] = useState(false);
    const [expiresAt, setExpiresAt] = useState({
        value: firestore.Timestamp.now().toDate(),
        valid: false,
    });

    const Styles = styles();

    const dispatch = useDispatch();

    const $Posts_Ref = firestore().collection("posts");
    const $User_Ref = firestore().collection("users").doc(data?.id);

    const CONTENT = {
        postfoodImg: Translations().t("postfoodImg"),
        postTypeFood: Translations().t("postTypeFood"),
        postFoodContains: Translations().t("postFoodContains"),
        postCreateBtn: Translations().t("postCreateBtn"),
        postPickAt: Translations().t("postPickAt"),
        Now: Translations().t("Now"),
    };

    const HeaderTitle = Translations().t("postTitle");

    useEffect(() => {
        if (image && foodType && postDesc && expiresAt.valid) {
            setDone(true);
        } else {
            setDone(false);
        }
    }, [image, foodType, postDesc, expiresAt]);

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        if (!result.canceled) {
            setImage(result.assets[0].uri);
        }
    };
    const uploadImage = async (img) => {
        if (!img) {
            return null;
        }

        const response = await fetch(img);
        const blob = await response.blob();
        const ref = storage()
            .ref("Post Pictures")
            .child(img.substring(img.lastIndexOf("/") + 1));
        const snapshot = await ref.put(blob);

        const url = await storage().ref(snapshot.metadata.fullPath).getDownloadURL();

        return url;
    };
    const HAS_ACTIVE_POST = async () => {
        let has = null;
        await $Posts_Ref
            .where("id", "==", data?.id)
            .get()
            .then((query) => {
                if (query.size) {
                    has = true;
                } else {
                    has = false;
                }
            });
        return has;
    };
    const Publish = async (foodType, postDesc, image, expiresAt) => {
        if (done) {
            try {
                setLoading(true);
                Keyboard.dismiss();
                const hasActivePost = await HAS_ACTIVE_POST();
                if (hasActivePost) {
                    Toast.show({
                        render: () => {
                            return <TOAST status="success" msg="You have active post already" />;
                        },
                        duration: 3000,
                    });
                    navigation.goBack();
                    return;
                }

                await $Posts_Ref
                    .where("source", "==", data?.id)
                    .get()
                    .then(async (posts) => {
                        if (posts.size === 0) {
                            const imgUrl = await uploadImage(image);

                            const timestamp = firestore.FieldValue.serverTimestamp();
                            const $expiresAt = firestore.Timestamp.fromDate(expiresAt.value);

                            const now = firestore.Timestamp.now();
                            const $ReqData = {
                                active: true,
                                date: timestamp,
                                postImage: imgUrl,
                                foodType,
                                foodTypeLower: foodType.toLocaleLowerCase(),
                                postDesc,
                                id: data?.id,
                                Name: data?.Name,
                                photo: data?.photo,
                                location: data?.location,
                                expiresAt: $expiresAt,
                            };
                            //Save post to global posts
                            await $Posts_Ref.add($ReqData).then(async (newPost) => {
                                const postData = {
                                    ...$ReqData,
                                    key: newPost.id,
                                    date: now,
                                    elapsed: CONTENT.Now,
                                };

                                //Save post to private posts
                                await $User_Ref.collection("posts").doc(newPost.id).set($ReqData);

                                // Save to app
                                dispatch({
                                    type: "userData/Set_User_Post",
                                    payload: postData,
                                });
                                // Send new post to users
                                SendNotification({
                                    topic: "users",
                                    title: "New Post",
                                    msg: `${data?.Name} has leftover ${foodType} let's take a look`,
                                    image: imgUrl,
                                });

                                Toast.show({
                                    render: () => {
                                        return <TOAST status="success" msg="Post created successfully" />;
                                    },
                                    duration: 2000,
                                });
                                navigation.goBack();
                            });
                        } else {
                            setLoading(false);
                            navigation.goBack();
                            return;
                        }
                    });
            } catch (e) {
                console.log(e);
                setLoading(false);
                navigation.goBack();
            }
        }
    };

    return (
        <View style={Styles.container}>
            <ScreenHeader title={HeaderTitle} arrow={true} />

            <KeyboardAwareScrollView keyboardShouldPersistTaps={"handled"}>
                <View style={Styles.wrapper}>
                    <Text style={{ color: theme ? "#0059c5" : "#7a7a7a", marginBottom: 10 }}>
                        {CONTENT.postfoodImg}
                    </Text>
                    <TouchableOpacity style={Styles.pickImageBtn} onPress={pickImage} disabled={loading}>
                        {image ? (
                            <Image style={{ width: "100%", height: "100%" }} source={{ uri: image }} />
                        ) : (
                            <Image
                                style={{ width: 30, height: 30 }}
                                source={require("../../../../assets/add.png")}
                            />
                        )}
                    </TouchableOpacity>

                    <TextInput
                        style={Styles.input}
                        value={foodType}
                        maxLength={30}
                        editable={!loading}
                        placeholder={CONTENT.postTypeFood}
                        placeholderTextColor="#7a7a7a"
                        onChangeText={(txt) => setFoodType(txt)}
                    />
                    <TextInput
                        style={Styles.input}
                        value={postDesc}
                        maxLength={100}
                        editable={!loading}
                        placeholder={CONTENT.postFoodContains}
                        placeholderTextColor="#7a7a7a"
                        onChangeText={(txt) => setPostDesc(txt)}
                    />
                    <PickTime time={setExpiresAt} loading={loading} closing={false} />

                    <View style={Styles.saveBtnCont}>
                        <TouchableOpacity
                            disabled={loading || !done}
                            style={[Styles.saveBtn, done && Styles.ActiveBtn]}
                            onPress={() => Publish(foodType, postDesc, image, expiresAt)}
                        >
                            {loading ? (
                                <ActivityIndicator size={30} color="#fff" />
                            ) : (
                                <Text style={{ color: "#fff", fontSize: 16 }}>{CONTENT.postCreateBtn}</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAwareScrollView>
        </View>
    );
};

export default memo(CreatePost);
