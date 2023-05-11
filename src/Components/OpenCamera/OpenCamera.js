import React, { useEffect, useRef, useState } from "react";
import { View, Text, TouchableOpacity, Button, Linking, ActivityIndicator } from "react-native";
import { Camera, CameraType } from "expo-camera";
import styles from "./styles";
import { Ionicons } from "@expo/vector-icons";
import { useDispatch, useSelector } from "react-redux";
import firestore from "@react-native-firebase/firestore";
import storage from "@react-native-firebase/storage";

const OpenCamera = (props) => {
    const Styles = styles();
    const { data, hasUnconfirmedOrder } = useSelector((state) => state.user);
    const [type, setType] = useState(CameraType.back);
    const [hasPermission, setHasPermission] = useState(null);
    const [showCamera, setShowCamera] = useState(false);
    const [photo, setPhoto] = useState("");
    const [loading, setLoading] = useState(false);
    const camRef = useRef(null);

    const dispatch = useDispatch();

    useEffect(() => {
        Ask_Permission();
    }, []);

    useEffect(() => {
        if (photo) {
            Upload_Photo(photo);
        }
    }, [photo]);

    const Ask_Permission = async () => {
        const { status, canAskAgain } = await Camera.requestCameraPermissionsAsync();

        !canAskAgain && setHasPermission(false);

        if (status === "granted") {
            setHasPermission(true);
            setShowCamera(true);
        }
    };
    const ReAsk_Permission = async () => {
        const { status } = await Camera.requestCameraPermissionsAsync();
        if (status === "granted") {
            setHasPermission(true);
            setShowCamera(true);
        } else if (status === "denied") {
            const { status } = await Camera.requestCameraPermissionsAsync();
            if (status === "granted") {
                setHasPermission(true);
                setShowCamera(true);
            } else {
                setHasPermission(false);
            }
        }
    };
    const Open_Settings = () => {
        Linking.openSettings();
        props.openCamera(false);
    };
    const ReAsk_Button = () => {
        return (
            <View style={Styles.overlay}>
                <View style={Styles.alertBox}>
                    <Text style={{ color: "#fff", fontSize: 18, textAlign: "center" }}>
                        No permission to accsess the camera
                        {hasPermission == false && ",make camera permission on in settings > permissions"}
                    </Text>

                    <Button
                        title={hasPermission == null ? "Allow Camera" : "Open Settings"}
                        onPress={() => (hasPermission == null ? ReAsk_Permission() : Open_Settings())}
                    />
                </View>
            </View>
        );
    };

    const toggleCameraType = () => {
        setType((prev) => (prev === CameraType.back ? CameraType.front : CameraType.back));
    };
    const handleTakePhoto = async () => {
        const img = await camRef.current.takePictureAsync();
        setPhoto(img.uri);
        setLoading(true);
    };
    const Upload_Photo = async (img) => {
        if (!img) {
            return null;
        }

        try {
            const timestamp = firestore.FieldValue.serverTimestamp();
            const response = await fetch(img);
            const blob = await response.blob();
            const ref = storage()
                .ref("Order Pictures")
                .child(img.substring(img.lastIndexOf("/") + 1));
            const snapshot = await ref.put(blob);

            const url = await storage().ref(snapshot.metadata.fullPath).getDownloadURL();

            await firestore()
                .collection("users")
                .doc(data?.id)
                .collection("orders")
                .doc(hasUnconfirmedOrder.orderId)
                .update({ confirmed: true, orderPhoto: url, confirmationDate: timestamp })
                .then(() => dispatch({ type: "userData/Del_ConfirmationPhoto" }))
                .catch((e) => console.log(e));
        } catch (e) {
            console.log(e);
        }
    };

    return (
        <View style={Styles.CameraContainer}>
            {showCamera ? (
                <Camera style={Styles.camera} ref={camRef} type={type} ratio="16:9">
                    <View style={Styles.footer}>
                        <View style={{ flex: 1 }}></View>

                        <View style={Styles.shutterCont}>
                            {loading ? (
                                <ActivityIndicator size={50} color="#fff" />
                            ) : (
                                <TouchableOpacity
                                    touchSoundDisabled={true}
                                    style={Styles.shutterBtn}
                                    onPress={handleTakePhoto}
                                >
                                    <Ionicons name="ellipse-outline" size={70} color="#fff" />
                                </TouchableOpacity>
                            )}
                        </View>

                        <View style={Styles.toggleCamBtnCont}>
                            <TouchableOpacity style={Styles.toggleCamBtn} onPress={() => toggleCameraType()}>
                                <Ionicons name="camera-reverse-outline" size={30} color="#444444" />
                            </TouchableOpacity>
                        </View>
                    </View>
                </Camera>
            ) : (
                ReAsk_Button()
            )}
        </View>
    );
};

export default OpenCamera;
