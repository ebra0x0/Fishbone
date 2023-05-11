import React, { useState, memo } from "react";
import { View, Text, Image, TouchableOpacity, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSelector } from "react-redux";
import styles from "./styles";
import Translations from "../../Languages";
import SendOrder from "../../Components/SendOrder";

const PostInfo = ({ route, navigation }) => {
    const { data, lang, theme, PendingOrder } = useSelector((state) => state.user);
    const { id, postImage, photo, Name, date, foodType, postDesc, key } = route.params;
    const [loading, setLoading] = useState(false);
    const Styles = styles();

    const CONTENT = {
        PostSendBtn: Translations().t("PostSendBtn"),
        ExpiresIn: Translations().t("ExpiresIn"),
    };

    const __Get_Expired_Date__ = (date) => {
        if (date) {
            const currDate = new Date();
            const start = new Date(date?.toDate());
            const elapsedTime = start - currDate;

            const s = parseInt(elapsedTime / 1000);
            const m = parseInt(elapsedTime / (1000 * 60));
            const h = parseInt(elapsedTime / (1000 * 60 * 60));
            const d = parseInt(elapsedTime / (1000 * 60 * 60 * 24));

            if (s < 60) {
                if (s < 5) {
                    return lang === "en" ? "Expired" : "انتهى";
                }
                return lang === "en" ? "s" : "ث" + s;
            } else if (m < 60) {
                return lang === "en" ? "m" : "د" + m;
            } else if (h < 24) {
                return lang === "en" ? "h" : "س" + h;
            } else {
                return lang === "en" ? "d" : "ي" + d;
            }
        } else {
            return "";
        }
    };

    return (
        <View style={Styles.container}>
            <TouchableOpacity style={Styles.arrowView} onPress={() => navigation.goBack()}>
                <Ionicons name="arrow-back" size={25} color="#fff" />
            </TouchableOpacity>
            <View style={Styles.imageView}>
                <Image style={{ width: "100%", height: "100%" }} source={{ uri: postImage }} />
                <View style={Styles.restTitle}>
                    <Image style={{ width: 60, height: 60, borderRadius: 60 / 2 }} source={{ uri: photo }} />
                    <Text style={{ fontSize: 22, fontWeight: "bold", color: "#fff", marginLeft: 5 }}>
                        {Name}
                    </Text>
                </View>
            </View>

            <View style={Styles.wrapper}>
                <View style={Styles.postData}>
                    <View style={Styles.row}>
                        <Ionicons name="time-outline" size={18} color="#7a7a7a" />
                        <Text style={{ fontSize: 16, color: theme ? "#fff" : "#252525", marginLeft: 3 }}>
                            {date.toDate().toDateString()}
                        </Text>
                    </View>
                    <Text style={Styles.expDate}>
                        {CONTENT.ExpiresIn}{" "}
                        <Text style={{ color: "#FF2763", fontWeight: "bold" }}>
                            {__Get_Expired_Date__(date)}
                        </Text>
                    </Text>
                </View>

                <View style={Styles.postContent}>
                    <Text style={Styles.postTitle}>{foodType}</Text>
                    <Text style={{ color: "#7a7a7a", marginLeft: 2 }}>{postDesc}</Text>
                </View>
            </View>

            {!data?.restaurant &&
                (!PendingOrder ? (
                    <TouchableOpacity
                        style={Styles.btn}
                        disabled={loading}
                        onPress={() =>
                            SendOrder({
                                item: { id: id, key: key },
                                userId: data?.id,
                                loading: setLoading,
                            })
                        }
                    >
                        {loading ? (
                            <ActivityIndicator size={30} color="#fff" />
                        ) : (
                            <Text style={{ fontSize: 16, color: "#fff" }}>{CONTENT.PostSendBtn}</Text>
                        )}
                    </TouchableOpacity>
                ) : (
                    PendingOrder?.postId == key && (
                        <View style={[Styles.btn, { backgroundColor: "#0dbc7912" }]}>
                            <Ionicons name="checkmark-outline" size={20} color="#0dbc79" />
                        </View>
                    )
                ))}
        </View>
    );
};
export default memo(PostInfo);
