import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { useSelector } from "react-redux";
import Tabs from "./Tabs";
import MetaData from "../screens/MetaData/MetaData";

const Stack = createStackNavigator();

const AccNavigators = () => {
    const { data } = useSelector((state) => state.user);

    return (
        <Stack.Navigator screenOptions={{ headerShown: false, animationEnabled: false }}>
            {data?.verified || data?.verified === undefined ? (
                <Stack.Screen name="account" component={Tabs} />
            ) : (
                <Stack.Screen name="MetaData" component={MetaData} />
            )}
        </Stack.Navigator>
    );
};

export default AccNavigators;
