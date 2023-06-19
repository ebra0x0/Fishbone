import React from "react";
import firestore from "@react-native-firebase/firestore";
import SendNotification from "./SendNotification";
import { Toast } from "native-base";
import TOAST from "./TOAST/TOAST";
import Check_Post_Expired from "./CheckPostExpired";

const SendOrder = async (props) => {
    try {
        const { source, dest, key, Name, Token, photo, expiresAt } = props.item;

        const $Posts_Ref = firestore().collection("posts");
        const $Users_Ref = firestore().collection("users");
        const $User_Ref = firestore().collection("users").doc(source);

        const expired = await Check_Post_Expired(key, expiresAt);

        if (!expired) {
            props.loading(true);

            await $Posts_Ref
                .doc(key)
                .get()
                .then(async (post) => {
                    if (post.exists) {
                        const timestamp = firestore.FieldValue.serverTimestamp();
                        const orderData = {
                            source: source,
                            dest: dest,
                            date: timestamp,
                            postId: key,
                            Name,
                            Token,
                            photo,
                            seened: true,
                        };
                        // create new order
                        await $User_Ref
                            .collection("orders")
                            .add(orderData)
                            .then(async (order) => {
                                // Add order for restaurant orders
                                await $Users_Ref
                                    .doc(dest)
                                    .collection("orders")
                                    .doc(order.id)
                                    .set({ ...orderData, seened: false });

                                const RestToken = await $Users_Ref
                                    .doc(dest)
                                    .get()
                                    .then((query) => query.data().Token);

                                SendNotification({
                                    token: RestToken,
                                    title: "New Order",
                                    msg: `You got a new order from ${source} check it out`,
                                    extraData: { orderKey: order.id },
                                });
                                Toast.show({
                                    render: () => {
                                        return <TOAST status="success" msg="Order sent successfully" />;
                                    },
                                    duration: 2000,
                                });
                                props.loading(false);
                            });
                    } else {
                        props.loading(false);
                        Toast.show({
                            render: () => {
                                return <TOAST status="error" msg="This post has been removed!" />;
                            },
                            duration: 2000,
                        });
                    }
                });
        } else {
            Toast.show({
                render: () => {
                    return <TOAST status="error" msg="This post is expired" />;
                },
                duration: 2000,
            });
        }
    } catch (e) {
        console.log(e);
        props.loading(false);
    }
};

export default SendOrder;
