import React from "react";
import firestore from "@react-native-firebase/firestore";
import SendNotification from "./SendNotification";
import { Toast } from "native-base";
import TOAST from "./Toast/Toast";
import Check_Post_Expired from "./CheckPostExpired";

const $Posts_Ref = firestore().collection("posts");

const SendOrder = async (props) => {
    try {
        const { id, key } = props.item;

        const $Users_Ref = firestore().collection("users");
        const $User_Ref = firestore().collection("users").doc(props.userId);

        const check = await Check_Post_Expired(key);

        if (!check) {
            props.loading(true);

            await $Posts_Ref
                .doc(key)
                .get()
                .then(async (post) => {
                    if (post.exists) {
                        const timestamp = firestore.FieldValue.serverTimestamp();
                        const orderData = {
                            source: props.userId,
                            dest: id,
                            date: timestamp,
                            postId: key,
                            seened: true,
                        };
                        // create new order
                        await $User_Ref
                            .collection("orders")
                            .add(orderData)
                            .then(async (order) => {
                                // Add order for restaurant post orders
                                await $Users_Ref
                                    .doc(id)
                                    .collection("posts")
                                    .doc(key)
                                    .collection("orders")
                                    .doc(order.id)
                                    .set({ ...orderData, seened: false });

                                // Add order for restaurant orders
                                await $Users_Ref
                                    .doc(id)
                                    .collection("orders")
                                    .doc(order.id)
                                    .set({ ...orderData, seened: false });

                                props.loading(false);
                                const RestToken = await $Users_Ref
                                    .doc(id)
                                    .get()
                                    .then((query) => query.data().Token);
                                SendNotification({
                                    token: RestToken,
                                    title: "New Order",
                                    msg: `You got a new order from ${props.userId} check it out`,
                                    extraData: { orderKey: order.id },
                                });
                                Toast.show({
                                    render: () => {
                                        return <TOAST status="success" msg="Order sent successfully" />;
                                    },
                                    duration: 2000,
                                });
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
