import React, { useEffect, useState } from "react";
import { View, TextInput, TouchableOpacity } from "react-native";
import firestore from "@react-native-firebase/firestore";
import { useSelector } from "react-redux";
import Translations from "../../Languages";
import { Ionicons } from "@expo/vector-icons";

const SearchBar = (props) => {
    const { theme } = useSelector((state) => state.user);
    const [srchValue, setSrchValue] = useState("");
    const [focus, setFocus] = useState(false);
    const [results, setResults] = useState([]);

    const $UsersRef = firestore().collection("users");
    const $PostsRef = firestore().collection("posts");

    useEffect(() => {
        props.searchType === "food" && foodSearch(srchValue);
        props.searchType === "restaurant" && restaurantSearch(srchValue);
    }, [srchValue]);
    useEffect(() => {
        setResults([]);
        props.searchType === "food" && foodSearch(srchValue);
        props.searchType === "restaurant" && restaurantSearch(srchValue);
    }, [props.searchType]);
    useEffect(() => {
        props.loading(false);
        props.update(results);
    }, [results]);

    const foodSearch = (value) => {
        if (value) {
            props.loading(true);
            const lower = value.toLowerCase().trim();
            $PostsRef
                .orderBy("foodTypeLower", "desc")
                .where("foodTypeLower", ">=", lower)
                .where("foodTypeLower", "<=", lower + "\uf8ff")
                .get()
                .then((query) => {
                    const matching = [];

                    query.forEach((post) => {
                        matching.push({ ...post.data(), key: post.id });
                    });

                    setResults(matching);
                })
                .catch((e) => console.log(e));
        } else {
            setResults([]);
        }
    };
    const restaurantSearch = (value) => {
        if (value) {
            props.loading(true);
            const lower = value.toLowerCase().trim();
            $UsersRef
                .where("restaurant", "==", true)
                .where("userName", ">=", lower)
                .where("userName", "<=", lower + "\uf8ff")
                .orderBy("userName", "desc")
                .get()
                .then((query) => {
                    const matching = [];

                    query.forEach((rest) => {
                        matching.push({ ...rest.data(), key: rest.id });
                    });

                    setResults(matching);
                })
                .catch((e) => console.log(e));
        } else {
            setResults([]);
        }
    };

    return (
        <View
            style={{
                flex: 1,
                paddingHorizontal: 20,
            }}
        >
            <TextInput
                style={[
                    {
                        height: 38,
                        paddingHorizontal: 14,
                        borderRadius: 38 / 2,
                        backgroundColor: theme ? "#022048" : "#f0f0f0",
                        color: "#919191",
                        textAlign: "left",
                    },
                    focus && { backgroundColor: theme ? "#02285a" : "#e9e9e9" },
                ]}
                placeholder={Translations().t("searchBar")}
                placeholderTextColor="#909090"
                value={srchValue}
                onChangeText={(value) => setSrchValue(value)}
                autoFocus={true}
                onFocus={() => {
                    setFocus(true);
                }}
                onBlur={() => {
                    setFocus(false);
                }}
            />

            {srchValue && (
                <TouchableOpacity
                    style={{ position: "absolute", top: 9, right: 30 }}
                    onPress={() => setSrchValue("")}
                >
                    <Ionicons name="close" size={20} color={theme ? "#fff" : "#808080"} />
                </TouchableOpacity>
            )}
        </View>
    );
};

export default SearchBar;
