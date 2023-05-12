import React, { useEffect, useState, memo } from "react";
import { View, Text, FlatList } from "react-native";
import styles from "./styles";
import ScreenHeader from "../../../Components/ScreenHeader/ScreenHeader";
import Avatar from "../../../Components/Avatar/Avatar";

const OrdersHistory = ({ route }) => {
    const [orders, setOrders] = useState(route.params.orders);

    const status = route.params.status;
    const Styles = styles();

    useEffect(() => {
        if (orders?.length) {
            const sortedOrders = orders;
            if (status) {
                sortedOrders.sort(
                    (a, b) => new Date(b.submitDate.toDate()) - new Date(a.submitDate.toDate())
                );
            } else {
                sortedOrders.sort(
                    (a, b) => new Date(b.approvalDate.toDate()) - new Date(a.approvalDate.toDate())
                );
            }
            setOrders(sortedOrders);
        }
    }, []);

    const renderItems = ({ item }) => {
        return (
            <View style={Styles.order}>
                <View style={{ flexDirection: "column", alignItems: "center" }}>
                    <Avatar profile={{ data: item }} style={Styles.avatar} />
                    <Text style={Styles.orderName}>{item.Name}</Text>
                </View>

                <View style={{ flex: 1, flexDirection: "column", alignItems: "flex-end" }}>
                    <View style={{ alignItems: "center" }}>
                        <View
                            style={[
                                Styles.orderStatus,
                                { backgroundColor: status ? "#00b06a80" : "#ff004780" },
                            ]}
                        >
                            <Text style={Styles.statusTxt}>{status ? "Deliverd" : "Canceld"}</Text>
                        </View>
                        <Text style={Styles.postDate}>
                            {status
                                ? item.submitDate.toDate().toDateString()
                                : item.approvalDate.toDate().toDateString()}
                        </Text>
                    </View>
                </View>
            </View>
        );
    };
    const HeaderTitle = route.params.title;

    return (
        <View style={Styles.container}>
            <ScreenHeader arrow={true} title={HeaderTitle} />
            <FlatList
                style={{ paddingHorizontal: 10, paddingTop: 10 }}
                data={orders}
                renderItem={renderItems}
                keyExtractor={(item) => item.key}
            />
        </View>
    );
};

export default memo(OrdersHistory);
