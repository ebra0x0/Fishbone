import React, { lazy } from "react";
import { createStackNavigator, CardStyleInterpolators } from "@react-navigation/stack";
import Board from "./Board/Board";
import { Dimensions } from "react-native";
const CreatePost = lazy(() => import("./CreatePost/CreatePost"));
const PostInfo = lazy(() => import("../PostInfo/PostInfo"));
const PostsHistory = lazy(() => import("./PostsHistory/PostsHistory"));
const OrdersHistory = lazy(() => import("./OrdersHistory/OrdersHistory"));
const OpenProfile = lazy(() => import("../OpenProfile/OpenProfile"));

const Dashboard = () => {
    const Stack = createStackNavigator();

    const config = {
        animation: "timing",
        config: {
            duration: 200,
        },
    };
    const ScreenX = Dimensions.get("screen").width;

    return (
        <Stack.Navigator
            initialRouteName="Board"
            screenOptions={{
                headerShown: false,
                gestureEnabled: true,
                gestureDirection: "horizontal",
                gestureResponseDistance: ScreenX / 2,
                detachPreviousScreen: false,
                transitionSpec: {
                    open: config,
                    close: config,
                },
                cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
            }}
        >
            <Stack.Screen name="Board" component={Board} />
            <Stack.Screen name="PostsHistory" component={PostsHistory} />
            <Stack.Screen name="OrdersHistory" component={OrdersHistory} />
            <Stack.Screen
                name="CreatePost"
                component={CreatePost}
                options={{ cardStyleInterpolator: CardStyleInterpolators.forRevealFromBottomAndroid }}
            />
            <Stack.Screen name="PostInfo" component={PostInfo} />
            <Stack.Screen name="OpenProfile" component={OpenProfile} />
        </Stack.Navigator>
    );
};
export default Dashboard;
