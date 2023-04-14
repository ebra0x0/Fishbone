import React, { useEffect, useState } from "react";
import { View, TextInput } from "react-native";
import firestore from "@react-native-firebase/firestore";
import { useSelector } from "react-redux";
import Translations from "../../Languages";

const SearchBar = (props) => {
    const { theme } = useSelector((state) => state.user);
    const [srchValue, setSrchValue] = useState("");
    const [focus, setFocus] = useState(false);
    const [results, setResults] = useState([]);

    const $UsersRef = firestore().collection("users");

    useEffect(() => {
        Search(srchValue);
    }, [srchValue]);
    useEffect(() => {
        props.update(results);
    }, [results]);

    const Search = (value) => {
        if (value) {
            const lower = value.toLowerCase().trim();
            $UsersRef
                .orderBy("userName", "desc")
                .where("restaurant", "==", true)
                .where("userName", ">=", lower)
                .where("userName", "<=", lower + "\uf8ff")
                .get()
                .then((query) => {
                    const matching = [];

                    query.forEach((rest) => {
                        matching.push(rest.data());
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
                        backgroundColor: theme ? "#022048" : "#dcdcdc",
                        color: "#919191",
                        textAlign: "left",
                    },
                    focus && { backgroundColor: theme ? "#02285a" : "#fff" },
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
        </View>
    );
};

export default SearchBar;
