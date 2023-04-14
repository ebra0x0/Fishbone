import { View, Text, FlatList, Image, TouchableOpacity } from "react-native";
import React, { useState } from "react";
import SearchBar from "../../Components/SearchBar/SearchBar";
import { Ionicons } from "@expo/vector-icons";
import styles from "./styles";
import { useSelector } from "react-redux";

const Search = ({ navigation }) => {
    const Styles = styles();
    const { theme } = useSelector((state) => state.user);
    const [Restaurants, setRestaurants] = useState([]);

    const renderResults = ({ item }) => {
        return (
            <TouchableOpacity style={Styles.row} onPress={() => navigation.navigate("OpenProfile", item)}>
                <Image style={Styles.avatar} source={{ uri: item.photo }} />
                <Text style={Styles.name}>{item.Name}</Text>
            </TouchableOpacity>
        );
    };
    return (
        <View style={Styles.container}>
            <View
                style={{
                    flexDirection: "row",
                    height: 100,
                    paddingHorizontal: 20,
                    paddingTop: 30,
                    alignItems: "center",
                }}
            >
                <TouchableOpacity onPress={() => navigation.navigate("Main")}>
                    <Ionicons name="arrow-back" size={30} color={theme ? "#fff" : "#252525"} />
                </TouchableOpacity>
                <SearchBar update={setRestaurants} />
            </View>
            <FlatList
                data={Restaurants}
                renderItem={renderResults}
                keyExtractor={(item) => item.id}
                showsVerticalScrollIndicator={false}
            />
        </View>
    );
};

export default Search;
