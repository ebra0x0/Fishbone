import React, { useState, useEffect } from "react";
import { View, Text, TouchableHighlight, ActivityIndicator, TouchableOpacity, Image } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import firestore from "@react-native-firebase/firestore";
import { Ionicons } from "@expo/vector-icons";
import Check_Post_Expired from "../../../Components/CheckPostExpired";
import { Box, HStack, VStack, Skeleton, Toast } from "native-base";
import TOAST from "../../../Components/TOAST/TOAST";
import styles from "./styles";
import Translations from "../../../Languages";
import { useNavigation } from "@react-navigation/native";
import CheckLimitPosts from "../../../Components/CheckLimitPosts";

const ActivePost = () => {
    const { data, userPost, theme, lang } = useSelector((state) => state.user);
    const Styles = styles();
    const [loading, setLoading] = useState(true);
    const [btnLoading, setBtnLoading] = useState(false);
    const [activePost, setActivePost] = useState({
        id: "",
        from: "",
        to: "",
        Data: {},
    });

    const dispatch = useDispatch();
    const navigation = useNavigation();
    const $Posts_Ref = firestore().collection("posts");
    const $User_Ref = firestore().collection("users").doc(data?.id);
    const CONTENT = {
        dashboardActivePost: Translations().t("dashboardActivePost"),
        dashboardActivePostId: Translations().t("dashboardActivePostId"),
        dashboardActivePostCreatedAt: Translations().t("dashboardActivePostCreatedAt"),
        ExpiresAt: Translations().t("ExpiresAt"),
        dashboardActivePostDetails: Translations().t("dashboardActivePostDetails"),
        dashboardActivePostDelete: Translations().t("dashboardActivePostDelete"),
    };
    useEffect(() => {
        fetchActivePost();
    }, []);
    useEffect(() => {
        if (userPost) {
            const Id = userPost.key?.slice(0, 6).toUpperCase();
            const From = new Date(userPost.date?.toDate())?.toDateString() || "";
            const To = new Date(userPost.expiresAt?.toDate())?.toLocaleTimeString() || "";
            setActivePost((prev) => ({ ...prev, id: Id, from: From, to: To, Data: userPost }));
        }
    }, [userPost]);

    const fetchActivePost = () => {
        try {
            setLoading(true);
            $User_Ref
                .collection("posts")
                .where("active", "==", true)
                .get()
                .then((query) => {
                    query?.size
                        ? query.forEach(async (active) => {
                              const { date, expiresAt } = active.data();

                              const isExpired = await Check_Post_Expired(active.id, expiresAt.toDate());
                              if (isExpired) {
                                  await Remove_Post(active.id, false);
                                  setLoading(false);
                                  return;
                              } else {
                                  const Id = active.id.slice(0, 6).toUpperCase();
                                  const From = new Date(date?.toDate()).toDateString();
                                  const To = expiresAt.toDate();
                                  setActivePost((prev) => ({
                                      ...prev,
                                      id: Id,
                                      from: From,
                                      to: To,
                                      Data: active.data(),
                                  }));
                                  dispatch({
                                      type: "userData/Set_User_Post",
                                      payload: { ...active.data(), key: active.id },
                                  });
                                  setLoading(false);
                              }
                          })
                        : setLoading(false);
                    dispatch({
                        type: "userData/Del_User_Post",
                    });
                });
        } catch (e) {
            console.log(e);
        }
    };
    const OpenCreatePost = async () => {
        const reachedLimit = await CheckLimitPosts(data?.id);

        if (reachedLimit === false) {
            navigation.navigate("CreatePost");
        } else {
            Toast.show({
                render: () => {
                    return (
                        <TOAST
                            status="success"
                            msg={
                                lang == "en"
                                    ? "You have helped enough today,come tomorrow."
                                    : "لقد ساعدت الكثير اليوم,عد غداً"
                            }
                        />
                    );
                },
                duration: 3000,
            });
        }
    };
    const Remove_Post = async (key, action) => {
        if (key) {
            action && setBtnLoading((prev) => !prev);
            //Del post from global posts
            await $Posts_Ref
                .doc(key)
                .delete()
                .then(() => {
                    // Inactivate post from private posts
                    $User_Ref.collection("posts").doc(key).update({ active: false });
                });

            //Del post from app
            dispatch({
                type: "userData/Del_User_Post",
            });
            setActivePost((prev) => ({ ...prev, id: "", from: "", to: "", Data: {} }));

            if (action) {
                setBtnLoading((prev) => !prev);
                Toast.show({
                    render: () => {
                        return <TOAST status="error" msg="Post Removed" />;
                    },
                    duration: 2000,
                });
            }
        }
    };

    return (
        <Box style={Styles.wrapper}>
            <Text style={Styles.header}>{CONTENT.dashboardActivePost}</Text>

            {loading ? (
                <Skeleton
                    style={{
                        height: 150,
                        borderRadius: 12,
                        backgroundColor: "transparent",
                    }}
                    startColor={theme ? "darkBlue.800" : "darkBlue.100"}
                    speed={1.3}
                />
            ) : (
                <VStack style={Styles.post}>
                    {userPost ? (
                        <>
                            <View style={Styles.actvBuble} />
                            <HStack style={Styles.row}>
                                <Text style={Styles.labelTxt}>{CONTENT.dashboardActivePostId}</Text>
                                <Text style={Styles.valueTxt}>#{activePost.id}</Text>
                            </HStack>

                            <HStack style={Styles.row}>
                                <Text style={Styles.labelTxt}>{CONTENT.dashboardActivePostCreatedAt}</Text>
                                <Text style={Styles.valueTxt}>{activePost.from}</Text>
                            </HStack>

                            <HStack style={Styles.row}>
                                <Text style={Styles.labelTxt}>{CONTENT.ExpiresAt}</Text>
                                <Text style={Styles.valueTxt}>{activePost.to}</Text>
                            </HStack>

                            <HStack style={Styles.row}>
                                <TouchableHighlight
                                    style={[
                                        Styles.postBtn,
                                        {
                                            backgroundColor: "#1785f533",
                                            borderWidth: 1,
                                            borderColor: "#1785f5",
                                        },
                                    ]}
                                    underlayColor="#1785f5"
                                    onPress={() => navigation.navigate("PostInfo", activePost.Data)}
                                >
                                    <Text style={{ color: theme ? "#fff" : "#343434" }}>
                                        {CONTENT.dashboardActivePostDetails}
                                    </Text>
                                </TouchableHighlight>

                                <TouchableHighlight
                                    style={[Styles.postBtn, { backgroundColor: "#ff2b4e" }]}
                                    underlayColor="#cd1735"
                                    onPress={() => Remove_Post(userPost.key, true)}
                                >
                                    {btnLoading ? (
                                        <ActivityIndicator color="#fff" size={25} />
                                    ) : (
                                        <Text style={{ color: "#fff" }}>
                                            {CONTENT.dashboardActivePostDelete}
                                        </Text>
                                    )}
                                </TouchableHighlight>
                                <TouchableOpacity
                                    style={{ marginHorizontal: 5, alignSelf: "center" }}
                                    onPress={fetchActivePost}
                                >
                                    <Ionicons name="refresh" size={20} color="#1785F5" />
                                </TouchableOpacity>
                            </HStack>
                        </>
                    ) : (
                        <TouchableOpacity
                            style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
                            onPress={OpenCreatePost}
                            underlayColor="transparent"
                        >
                            <Image
                                style={{ width: 30, height: 30 }}
                                source={require("../../../../assets/add.png")}
                            />
                        </TouchableOpacity>
                    )}
                </VStack>
            )}
        </Box>
    );
};

export default ActivePost;
