import React, { lazy } from "react";
import { CardStyleInterpolators, createStackNavigator } from "@react-navigation/stack";
const OpenProfile = lazy(() => import("../OpenProfile/OpenProfile"));
const Favorites = lazy(() => import("./Favorites/Favorites"));
const Search = lazy(() => import("./Search/Search"));
const PostInfo = lazy(() => import("../PostInfo/PostInfo"));
import PostsScrollView from "./PostsScrollView/PostsScrollView";

const Explore = () => {
    const Stack = createStackNavigator();

    const config = {
        animation: "timing",
        config: {
            duration: 200,
        },
    };

    return (
        <Stack.Navigator
            initialRouteName="PostsScrollView"
            screenOptions={{
                headerShown: false,
                transitionSpec: {
                    open: config,
                    close: config,
                },
                cardStyleInterpolator: CardStyleInterpolators.forFadeFromCenter,
            }}
        >
            <Stack.Screen name="PostsScrollView" component={PostsScrollView} />
            <Stack.Screen
                name="OpenProfile"
                component={OpenProfile}
                options={{
                    detachPreviousScreen: false,
                    cardStyleInterpolator: CardStyleInterpolators.forRevealFromBottomAndroid,
                }}
            />
            <Stack.Screen name="Favorites" component={Favorites} />
            <Stack.Screen name="Search" component={Search} />
            <Stack.Screen name="PostInfo" component={PostInfo} />
        </Stack.Navigator>
    );
};

export default Explore;
