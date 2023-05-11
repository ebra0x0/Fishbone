import React, { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import styles from "./styles";
import OpenCamera from "../../Components/OpenCamera/OpenCamera";
import Translations from "../../Languages";

export default () => {
    const Styles = styles();
    const [openCamera, setOpenCamera] = useState(false);

    const CONTENT = {
        confPhotoTitle: Translations().t("confPhotoTitle"),
        confPhotoDesc: Translations().t("confPhotoDesc"),
        confPhotoNote: Translations().t("confPhotoNote"),
    };

    const Main = () => {
        return (
            <View style={Styles.container}>
                <View style={Styles.header}>
                    <Text style={Styles.title}>{CONTENT.confPhotoTitle}</Text>
                    <Text style={Styles.desc}>{CONTENT.confPhotoDesc}</Text>
                    <Text style={Styles.note}>{CONTENT.confPhotoNote}</Text>
                </View>
                <View style={Styles.wrapper}>
                    <TouchableOpacity
                        style={Styles.Cam}
                        onPress={() => {
                            setOpenCamera(true);
                        }}
                    >
                        <Ionicons name="camera-outline" size={50} color="#7a7a7a" />
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    return openCamera ? <OpenCamera openCamera={setOpenCamera} /> : <Main />;
};
