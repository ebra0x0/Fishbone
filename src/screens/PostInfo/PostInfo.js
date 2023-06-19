import React, { useState, memo } from "react";
import { View, Text, Image, TouchableOpacity, ActivityIndicator } from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useSelector } from "react-redux";
import styles from "./styles";
import Translations from "../../Languages";
import SendOrder from "../../Components/SendOrder";
import firestore from "@react-native-firebase/firestore";

const PostInfo = ({ route, navigation }) => {
    const { data, theme, PendingOrder } = useSelector((state) => state.user);
    const { id, postImage, photo, Name, date, expiresAt, foodType, postDesc, distance, key } = route.params;

    const [loading, setLoading] = useState(false);
    const Styles = styles();

    const $UsersRef = firestore().collection("users");
    const CONTENT = {
        sendOrderBtn: Translations().t("sendOrderBtn"),
        ExpiresAt: Translations().t("ExpiresAt"),
        haveOrder: Translations().t("haveOrder"),
    };

    const Remove_Pending_Order = async () => {
        try {
            //Remove order from restaurant
            await $UsersRef.doc(id).collection("orders").doc(PendingOrder.id).delete();

            // Remove order from local orders
            await $UsersRef.doc(data?.id).collection("orders").doc(PendingOrder.id).delete();
        } catch (e) {
            console.log(e);
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
                    <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                        <View style={Styles.row}>
                            <Ionicons name="time-outline" size={18} color="#7a7a7a" />
                            <Text style={{ fontSize: 16, color: theme ? "#fff" : "#343434", marginLeft: 3 }}>
                                {date.toDate().toDateString()}
                            </Text>
                        </View>
                        {!data?.restaurant && (
                            <View style={{ flexDirection: "row" }}>
                                <MaterialCommunityIcons
                                    name="navigation-variant-outline"
                                    size={15}
                                    color="#2ebeff"
                                />
                                <Text style={{ color: "#4bbc83", fontSize: 14 }}>{distance}</Text>
                            </View>
                        )}
                    </View>
                    <Text style={Styles.expDate}>
                        {CONTENT.ExpiresAt}{" "}
                        <Text style={{ color: "#FF2763", fontWeight: "bold" }}>
                            {expiresAt.toDate().toLocaleTimeString().slice(0, -6)}{" "}
                            {expiresAt.toDate().toLocaleTimeString().slice(-2)}
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
                                item: {
                                    source: data?.id,
                                    dest: id,
                                    key: key,
                                    Name: data?.Name,
                                    Token: data?.Token,
                                    photo: data?.photo,
                                    expiresAt: expiresAt.toDate(),
                                },
                                loading: setLoading,
                            })
                        }
                    >
                        {loading ? (
                            <ActivityIndicator size={30} color="#fff" />
                        ) : (
                            <Text style={{ fontSize: 16, color: "#fff" }}>{CONTENT.sendOrderBtn}</Text>
                        )}
                    </TouchableOpacity>
                ) : !PendingOrder?.postId == key ? (
                    <TouchableOpacity
                        style={[Styles.btn, { backgroundColor: "#ff27631a" }]}
                        onPress={Remove_Pending_Order}
                    >
                        <Ionicons name="close" size={25} color="#FF2763" />
                    </TouchableOpacity>
                ) : (
                    <View style={[Styles.btn, { backgroundColor: "#0065ff1a" }]}>
                        <Text style={Styles.txt}>{CONTENT.haveOrder}</Text>
                    </View>
                ))}
        </View>
    );
};
export default memo(PostInfo);
