import React, { useRef, useState, memo } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ActivityIndicator,
    Image,
    Keyboard,
    TouchableHighlight,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import styles from "./styles";
import ScreenHeader from "../../Components/ScreenHeader/ScreenHeader";
import Translations from "../../Languages";
import firestore from "@react-native-firebase/firestore";
import storage from "@react-native-firebase/storage";
import * as ImagePicker from "expo-image-picker";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useEffect } from "react";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import TOAST from "../../Components/Toast/Toast";
import { HStack, Toast } from "native-base";
import { DateTimePickerAndroid } from "@react-native-community/datetimepicker";
import SendNotification from "../../Components/SendNotification";

const CreatePost = ({ navigation }) => {
    const { data, theme, lang } = useSelector((state) => state.user);
    const [foodType, setFoodType] = useState("");
    const [postDesc, setPostDesc] = useState("");
    const [closedTime, setClosedTime] = useState({ value: new Date(), valid: false });
    const [done, setDone] = useState(false);
    const [image, setImage] = useState(null);
    const [loading, setLoading] = useState(false);

    const intervalRef = useRef();

    const Styles = styles();

    const dispatch = useDispatch();

    const $Posts_Ref = firestore().collection("posts");
    const $User_Ref = firestore().collection("users").doc(data?.id);

    const CONTENT = {
        postfoodImg: Translations().t("postfoodImg"),
        postTypeFood: Translations().t("postTypeFood"),
        postFoodContains: Translations().t("postFoodContains"),
        postClosedTime: Translations().t("postClosedTime"),
        postCreateBtn: Translations().t("postCreateBtn"),
        postPickAt: Translations().t("postPickAt"),
        Now: Translations().t("Now"),
    };

    const HeaderTitle = Translations().t("postTitle");

    useEffect(() => {
        return () => {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        };
    }, []);
    useEffect(() => {
        if (image && foodType && postDesc && closedTime.valid) {
            setDone(true);
        } else {
            setDone(false);
        }
    }, [image, foodType, postDesc, closedTime]);

    useEffect(() => {
        closedTime.valid && Date_Syncing(closedTime.value);
        return () => clearInterval(intervalRef.current);
    }, [closedTime]);

    const Date_Syncing = () => {
        intervalRef.current = setInterval(() => {
            handleTimeColsed(closedTime.value);
        }, 1000);
    };

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [6, 4],
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
    const handleTimeColsed = (value) => {
        const now = new Date();
        const selectedDate = value;

        if (selectedDate > now) {
            setClosedTime({ value, valid: true });
        } else {
            setClosedTime({ value, valid: false });
            Toast.show({
                render: () => {
                    return <TOAST status="error" msg="You closed already !" />;
                },
                duration: 2000,
            });
        }
    };
    const onChange = (selectedDate) => {
        const currentDate = selectedDate;

        if (currentDate.type !== "dismissed") {
            const date = new Date(currentDate.nativeEvent.timestamp);

            handleTimeColsed(date);
        }
    };
    const showMode = () => {
        DateTimePickerAndroid.open({
            value: closedTime.value,
            onChange,
            mode: "time",
            is24Hour: false,
        });
    };

    const Publish = async (foodType, postDesc, closedTime, image) => {
        if (done) {
            try {
                setLoading(true);
                Keyboard.dismiss();

                await $Posts_Ref
                    .where("source", "==", data?.id)
                    .get()
                    .then(async (posts) => {
                        if (posts.size === 0) {
                            const imgUrl = await uploadImage(image);

                            const timestamp = firestore.FieldValue.serverTimestamp();
                            const now = firestore.Timestamp.now();
                            const closedIn = firestore.Timestamp.fromDate(closedTime.value);
                            const $ReqData = {
                                active: true,
                                date: timestamp,
                                postImage: imgUrl,
                                foodType,
                                foodTypeLower: foodType.toLocaleLowerCase(),
                                postDesc,
                                closedIn,
                                id: data?.id,
                                Name: data?.Name,
                                address: data?.address,
                                email: data?.email,
                                location: data?.location,
                                phone: data?.phone,
                                photo: data?.photo,
                            };
                            //Save post to global posts
                            await $Posts_Ref.add($ReqData).then(async (newPost) => {
                                const postData = {
                                    ...$ReqData,
                                    key: newPost.id,
                                    date: now,
                                    closedIn: closedTime.value,
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
                            <MaterialCommunityIcons
                                name="plus"
                                size={50}
                                color={theme ? "#fff" : "#252525"}
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

                    <TouchableHighlight
                        style={{
                            backgroundColor: closedTime.valid ? "#0ba469" : "#676767",
                            height: 50,
                            borderRadius: 7,
                            justifyContent: "center",
                            alignItems: "center",
                        }}
                        onPress={showMode}
                        disabled={loading}
                        underlayColor={closedTime.valid ? "#098d5a" : "#505050"}
                    >
                        <HStack alignItems={"center"}>
                            <Ionicons name="time-outline" size={25} color="#fff" />
                            <Text style={{ color: "#fff", fontSize: 16, marginLeft: 4 }}>
                                {CONTENT.postClosedTime}
                            </Text>
                        </HStack>
                    </TouchableHighlight>

                    <View style={Styles.saveBtnCont}>
                        <TouchableOpacity
                            disabled={loading || !done}
                            style={[Styles.saveBtn, done && Styles.ActiveBtn]}
                            onPress={() => Publish(foodType, postDesc, closedTime, image)}
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
