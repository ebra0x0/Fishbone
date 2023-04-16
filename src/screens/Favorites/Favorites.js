import React, { useEffect, useState } from "react";
import { View, Text, FlatList, Image, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useDispatch, useSelector } from "react-redux";
import ScreenHeader from "../../Components/ScreenHeader/ScreenHeader";
import styles from "./styles";
import Translations from "../../Languages";
import { Toast } from "native-base";
import ALert from "../../Components/Alert/Alert";

const Favorites = ({ navigation }) => {
    const Styles = styles();
    const { theme, favorites } = useSelector((state) => state.user);

    const [FAVORITES, setFavorites] = useState(favorites);

    const dispatch = useDispatch();

    useEffect(() => {
        setFavorites(favorites);
    }, [favorites]);

    const Dis_Fav = (rest) => {
        const newFavs = [];
        favorites.forEach((fav, indx) => {
            if (fav.id !== rest.id) {
                newFavs.push(fav);
            } else {
                dispatch({ type: "userData/Del_Favorites", payload: [fav] });
            }
            if (indx + 1 == favorites.length) {
                dispatch({ type: "userData/Set_Favorites", payload: newFavs });
            }
        });
    };

    const Dis_Fav_All = async () => {
        dispatch({ type: "userData/Del_Favorites", payload: favorites });
        dispatch({ type: "userData/Set_Favorites", payload: [] });
        Toast.show({
            render: () => {
                return <ALert status="success" msg="All favorites removed." />;
            },
            duration: 3000,
        });
    };

    const renderFav = ({ item }) => {
        return (
            <View style={Styles.wrapper}>
                <View style={Styles.row}>
                    <View style={{ flex: 1, flexDirection: "row" }}>
                        <TouchableOpacity
                            style={Styles.avatar}
                            onPress={() => navigation.navigate("OpenProfile", item)}
                        >
                            <Image style={{ width: "100%", height: "100%" }} source={{ uri: item.photo }} />
                        </TouchableOpacity>
                        <Text style={{ fontSize: 16, color: theme ? "#fff" : "#252525", marginLeft: 6 }}>
                            {item.Name}
                        </Text>
                    </View>
                    <TouchableOpacity style={{ alignSelf: "center" }} onPress={() => Dis_Fav(item)}>
                        <Ionicons name="heart" size={30} color="#0080de" />
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    const HeaderTitle = (
        <Text
            style={{
                textAlign: "left",
                flex: 1,
                marginLeft: 6,
                fontSize: 30,
                color: theme ? "#fff" : "#252525",
                fontWeight: "bold",
            }}
        >
            {Translations().t("favsTitle")}
        </Text>
    );
    const Buttons = [
        {
            show: FAVORITES.length ? true : false,
            key: 1,
            name: "heart-dislike-outline",
            size: 30,
            color: theme ? "#fff" : "#252525",
            fun: () => Dis_Fav_All(),
        },
    ];

    const HeaderButtons = Buttons.map((btn) => {
        if (btn.show) {
            return (
                <TouchableOpacity style={{ marginLeft: 15 }} key={btn.key} onPress={() => btn.fun()}>
                    <Ionicons name={btn.name} size={btn.size} color={btn.color} />
                </TouchableOpacity>
            );
        }
    });

    return (
        <View style={Styles.container}>
            {FAVORITES !== null && (
                <ScreenHeader arrow={() => navigation.goBack()} title={HeaderTitle} btns={HeaderButtons} />
            )}

            {FAVORITES?.length ? (
                <FlatList
                    data={FAVORITES}
                    renderItem={renderFav}
                    keyExtractor={(item) => item.key}
                    showsVerticalScrollIndicator={false}
                />
            ) : (
                <View style={{ flex: 1, justifyContent: "center", alignItems: "center", marginBottom: 30 }}>
                    <Image
                        style={{ width: 100, height: 100, marginBottom: 10 }}
                        source={require("../../../assets/brokenHeart.png")}
                    />
                </View>
            )}
        </View>
    );
};
export default Favorites;
