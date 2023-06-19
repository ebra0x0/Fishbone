import React from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import styles from "./styles";
import { useNavigation } from "@react-navigation/native";
import { useSelector } from "react-redux";

const Alert = (props) => {
    const Styles = styles();
    const { data } = useSelector((state) => state.user);
    const navigation = useNavigation();

    const openMsg = (key) => {
        navigation.navigate("notifications", { screen: "FlatlistOrders", params: { New: key } });

        props.close([]);
    };

    const Restarant_Alert = () => {
        return (
            <View style={Styles.msgWrapper}>
                <View style={Styles.title}>
                    <Image style={Styles.icon} source={require("../../../assets/new-message.png")} />
                    <Text style={Styles.titleTxt}>New Orders</Text>
                </View>

                <View style={Styles.msg}>
                    <Text style={Styles.msgTxt}>
                        You got{" "}
                        <Text style={{ color: "#0dbc79", fontWeight: "bold" }}>{props.data?.length}</Text> new
                        orders
                    </Text>
                </View>

                <View style={Styles.btnCont}>
                    <TouchableOpacity style={Styles.btn} onPress={() => openMsg(props.data[0]?.orderKey)}>
                        <Text style={{ color: "#fff" }}>OPEN</Text>
                    </TouchableOpacity>
                </View>

                <TouchableOpacity style={Styles.close} onPress={() => props.close([])}>
                    <Ionicons name="close" size={25} color={Styles.close.color} />
                </TouchableOpacity>
            </View>
        );
    };
    const User_Alert = () => {
        const result = props.data[0]?.result === "true";

        return (
            <View style={Styles.msgWrapper}>
                <View style={Styles.title}>
                    {result ? (
                        <Image style={Styles.icon} source={require("../../../assets/success.png")} />
                    ) : (
                        <Image style={Styles.icon} source={require("../../../assets/close.png")} />
                    )}
                    <Text style={Styles.titleTxt}>{result ? "Accepted Order" : "Rejected Order"}</Text>
                </View>

                <View style={Styles.msg}>
                    <Text style={Styles.msgTxt}>
                        Your order has been{" "}
                        <Text
                            style={{
                                fontWeight: "bold",
                                color: result ? "#0dbc79" : "#FF2763",
                            }}
                        >
                            {result ? "accepted" : "rejected"}
                        </Text>
                    </Text>
                </View>

                {result && (
                    <View style={Styles.btnCont}>
                        <TouchableOpacity style={Styles.btn} onPress={() => openMsg(props.data[0]?.orderKey)}>
                            <Text style={{ color: "#fff" }}>OPEN</Text>
                        </TouchableOpacity>
                    </View>
                )}

                <TouchableOpacity style={Styles.close} onPress={() => props.close([])}>
                    <Ionicons name="close" size={25} color={Styles.close.color} />
                </TouchableOpacity>
            </View>
        );
    };

    return (
        <View
            style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                backgroundColor: "#00000080",
            }}
        >
            {data.restaurant ? <Restarant_Alert /> : <User_Alert />}
        </View>
    );
};

export default Alert;
