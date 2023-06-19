import { lazy } from "react";
import { CardStyleInterpolators, createStackNavigator } from "@react-navigation/stack";
const OpenProfile = lazy(() => import("../OpenProfile/OpenProfile"));
import FlatlistOrders from "./FlatlistOrders/FlatlistOrders";

export default () => {
    const Stack = createStackNavigator();

    const config = {
        animation: "timing",
        config: {
            duration: 200,
        },
    };

    return (
        <Stack.Navigator
            initialRouteName="FlatlistOrders"
            screenOptions={{
                headerShown: false,
                detachPreviousScreen: false,
                transitionSpec: {
                    open: config,
                    close: config,
                },
                cardStyleInterpolator: CardStyleInterpolators.forFadeFromBottomAndroid,
            }}
        >
            <Stack.Screen name="FlatlistOrders" component={FlatlistOrders} />
            <Stack.Screen name="OpenProfile" component={OpenProfile} />
        </Stack.Navigator>
    );
};
