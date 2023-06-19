import React, { useEffect, useState, memo } from "react";
import { View, Text, FlatList } from "react-native";
import styles from "./styles";
import ScreenHeader from "../../../Components/ScreenHeader/ScreenHeader";
import Avatar from "../../../Components/Avatar/Avatar";
import firestore from "@react-native-firebase/firestore";
import { Skeleton } from "native-base";
import { useSelector } from "react-redux";

const OrdersHistory = ({ route }) => {
    const { theme, data } = useSelector((state) => state.user);
    const [orders, setOrders] = useState([]);

    const status = route.params.status;
    const Styles = styles();

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = () => {
        const $User_Ref = firestore().collection("users").doc(data?.id);
        if (status) {
            const doneQuery = $User_Ref.collection("orders").where("delievered", "==", true);
            doneQuery.get().then((orders) => {
                const doneData = [];
                orders.forEach(async (order, indx) => {
                    const { submitDate, source } = order.data();

                    const user = await firestore().collection("users").doc(source).get();
                    const { photo, Name } = user.data();
                    doneData.push({
                        photo,
                        Name,
                        submitDate,
                        source,
                        key: indx,
                    });

                    if (doneData.length === orders.size) {
                        updateOrders(doneData);
                    }
                });
            });
        } else {
            const canceledQuery = $User_Ref.collection("orders").where("accepted", "==", false);
            canceledQuery.get().then((orders) => {
                const canceledData = [];
                orders.forEach(async (order, indx) => {
                    const { approvalDate, source } = order.data();

                    const user = await firestore().collection("users").doc(source).get();
                    const { photo, Name } = user.data();
                    canceledData.push({
                        photo,
                        Name,
                        approvalDate,
                        source,
                        key: indx,
                    });

                    if (canceledData.length === orders.size) {
                        updateOrders(canceledData);
                    }
                });
            });
        }
    };
    const updateOrders = (orders) => {
        const sortedOrders = orders;
        if (status) {
            sortedOrders.sort((a, b) => new Date(b.submitDate.toDate()) - new Date(a.submitDate.toDate()));
        } else {
            sortedOrders.sort(
                (a, b) => new Date(b.approvalDate.toDate()) - new Date(a.approvalDate.toDate())
            );
        }
        setOrders(sortedOrders);
    };
    const renderItems = ({ item }) => {
        return (
            <View style={Styles.order}>
                <View
                    style={{
                        flex: 1,
                        flexDirection: "column",
                        alignItems: "center",
                    }}
                >
                    <Avatar
                        profile={{ data: { id: item.source, photo: item.photo, Name: item.Name } }}
                        style={Styles.avatar}
                    />
                    <Skeleton.Text
                        marginTop={3}
                        lines={1}
                        startColor={theme ? "darkBlue.800" : "darkBlue.100"}
                        isLoaded={item.Name}
                    >
                        <Text style={Styles.orderName}>{item.Name}</Text>
                    </Skeleton.Text>
                </View>

                <View style={{ flex: 2, flexDirection: "column", alignItems: "flex-end" }}>
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

    const renderEmptyComponent = () => {
        const emptyItems = [1, 2, 3, 4, 5, 6, 7];

        return emptyItems.map((_, indx) => (
            <View key={indx} style={Styles.order}>
                <View
                    style={{
                        flex: 1,
                        flexDirection: "column",
                        alignItems: "center",
                    }}
                >
                    <Skeleton
                        w={70}
                        h={70}
                        rounded={"full"}
                        startColor={theme ? "darkBlue.800" : "darkBlue.100"}
                    />
                    <Skeleton.Text
                        marginTop={3}
                        lines={1}
                        startColor={theme ? "darkBlue.800" : "darkBlue.100"}
                    />
                </View>

                <View style={{ flex: 2, flexDirection: "column", alignItems: "flex-end" }}>
                    <Skeleton
                        style={Styles.orderStatus}
                        startColor={theme ? "darkBlue.800" : "darkBlue.100"}
                    />
                </View>
            </View>
        ));
    };

    return (
        <View style={Styles.container}>
            <ScreenHeader arrow={true} title={HeaderTitle} />
            <FlatList
                style={{ paddingHorizontal: 10, paddingTop: 10 }}
                data={orders}
                renderItem={renderItems}
                keyExtractor={(item) => item.key}
                ListEmptyComponent={renderEmptyComponent}
            />
        </View>
    );
};

export default memo(OrdersHistory);
