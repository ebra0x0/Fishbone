import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { createStackNavigator } from "@react-navigation/stack";
import styles from "./styles";
import OpenCamera from "../../Components/OpenCamera/OpenCamera";

export default () => {
    const Styles = styles();
    const Stack = createStackNavigator();

    const Main = ({ navigation }) => {
        return (
            <View style={Styles.container}>
                <View style={Styles.header}>
                    <Text style={Styles.title}>Confirmation Photo</Text>
                    <Text style={Styles.desc}>
                        We want you to take a confirmation photo of your last order, to make sure the food
                        reaches the target destination.
                    </Text>
                    <Text style={Styles.note}>
                        Note: make sure the photo is clear and the animal with the food appear well
                    </Text>
                </View>
                <View style={Styles.wrapper}>
                    <TouchableOpacity
                        style={Styles.Cam}
                        onPress={() => {
                            navigation.navigate("Cam");
                        }}
                    >
                        <Ionicons name="camera-outline" size={50} color="#7a7a7a" />
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    return (
        <Stack.Navigator screenOptions={{ headerShown: false, presentation: "modal" }}>
            <Stack.Screen name="Main" component={Main} />
            <Stack.Screen name="Cam" component={OpenCamera} />
        </Stack.Navigator>
    );
};
