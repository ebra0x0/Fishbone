import React from "react";
import { TouchableOpacity, View, Text } from "react-native";
import styles from "./styles";
import AccountType from "./AccountType/AccountType";
import { Ionicons } from "@expo/vector-icons";
import { useSelector } from "react-redux";
import { createStackNavigator } from "@react-navigation/stack";
import Translations from "../../Languages";

export default () => {
    const Styles = styles();
    const { theme } = useSelector((state) => state.user);

    const Stack = createStackNavigator();

    const CONTENT = {
        metadataTitle: Translations().t("metadataTitle"),
        metadataDesc: Translations().t("metadataDesc"),
        metadataNote: Translations().t("metadataNote"),
        metadataRest: Translations().t("metadataRest"),
        metadataUser: Translations().t("metadataUser"),
    };

    const MAIN = ({ navigation }) => {
        return (
            <View style={Styles.container}>
                <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                    <View style={Styles.header}>
                        <Text style={Styles.title}>{CONTENT.metadataTitle}</Text>
                        <Text style={Styles.desc}>{CONTENT.metadataDesc}</Text>
                        <Text style={Styles.desc}>{CONTENT.metadataNote}</Text>
                    </View>

                    <View style={Styles.wrapper}>
                        <TouchableOpacity
                            style={Styles.option}
                            onPress={() => navigation.replace("accType", { rest: true })}
                        >
                            <Ionicons name="restaurant" size={90} color={theme ? "#fff" : "#6a6a6a"} />
                            <Text style={Styles.optTxt}>{CONTENT.metadataRest}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={Styles.option}
                            onPress={() => navigation.replace("accType", { rest: false })}
                        >
                            <Ionicons name="person" size={90} color={theme ? "#fff" : "#6a6a6a"} />
                            <Text style={Styles.optTxt}>{CONTENT.metadataUser}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        );
    };

    return (
        <Stack.Navigator
            initialRouteName="Main"
            screenOptions={{ headerShown: false, animationEnabled: false }}
        >
            <Stack.Screen name="Main" component={MAIN} />
            <Stack.Screen name="accType" component={AccountType} />
        </Stack.Navigator>
    );
};
