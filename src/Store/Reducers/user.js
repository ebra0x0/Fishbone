import { createSlice } from "@reduxjs/toolkit";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { I18nManager } from "react-native";
import firestore from "@react-native-firebase/firestore";

const __UPDATE_USER_STORAGE__ = (action, payload) => {
    switch (action) {
        case "SET_USER":
            payload && AsyncStorage.setItem("User", JSON.stringify(payload));
            break;
        case "DEL_USER":
            AsyncStorage.removeItem("User");
            AsyncStorage.removeItem("UserPost");
            AsyncStorage.removeItem("UserOrder");
            break;
        case "SET_POST":
            payload && AsyncStorage.setItem("UserPost", JSON.stringify(payload));
            break;
        case "DEL_POST":
            AsyncStorage.removeItem("UserPost");
            break;
        case "SET_ORDER":
            payload && AsyncStorage.setItem("UserOrder", JSON.stringify(payload));
            break;
        case "DEL_ORDER":
            AsyncStorage.removeItem("UserOrder");
            break;
        case "SET_FAV":
            AsyncStorage.setItem("Favs", JSON.stringify(payload));
            break;
        case "SET_THEME":
            AsyncStorage.setItem("THEME", JSON.stringify(payload));
            break;
        case "SET_LANG":
            AsyncStorage.setItem("LANG", payload);
            break;
    }
};
const Upload_Favorites = (newFavs, user) => {
    const $favRef = firestore().collection("users").doc(user.id).collection("favorites");
    if (newFavs.length) {
        newFavs.forEach((fav) => {
            $favRef.doc(fav.key).set(fav);
        });
    }
};
const Delete_Favorites = (deletedFavs, user) => {
    const $favRef = firestore().collection("users").doc(user.id).collection("favorites");

    if (deletedFavs.length) {
        deletedFavs.forEach((fav) => {
            $favRef.doc(fav.key).delete();
        });
    }
};
export const User = createSlice({
    name: "userData",
    initialState: {
        theme: true,
        lang: I18nManager.isRTL ? "ar" : "en",
        data: null,
        userPost: null,
        userOrder: null,
        favorites: [],
        Token: "",
        deviceLocation: null,
        hasUnconfirmedOrder: { has: null, orderId: "" },
    },
    reducers: {
        Set_User: (state, action) => {
            __UPDATE_USER_STORAGE__("SET_USER", { ...state.data, ...action.payload });

            return {
                ...state,
                data: { ...state.data, ...action.payload },
            };
        },
        Del_User: (state) => {
            __UPDATE_USER_STORAGE__("DEL_USER");
            return {
                ...state,
                data: null,
                userPost: null,
                userOrder: null,
            };
        },
        Set_User_Post: (state, action) => {
            __UPDATE_USER_STORAGE__("SET_POST", action.payload);
            return {
                ...state,
                userPost: action.payload,
            };
        },
        Del_User_Post: (state) => {
            __UPDATE_USER_STORAGE__("DEL_POST");
            return {
                ...state,
                userPost: false,
            };
        },
        Set_User_Order: (state, action) => {
            __UPDATE_USER_STORAGE__("SET_ORDER");
            return {
                ...state,
                userOrder: action.payload,
            };
        },
        Del_User_Order: (state) => {
            __UPDATE_USER_STORAGE__("DEL_ORDER");
            return {
                ...state,
                userOrder: null,
            };
        },
        Set_Favorites: (state, action) => {
            __UPDATE_USER_STORAGE__("SET_FAV", action.payload);

            return {
                ...state,
                favorites: action.payload,
            };
        },
        Update_Favorites: (state, action) => {
            Upload_Favorites(action.payload, state.data);
            return {
                ...state,
                favorites: [...state.favorites, ...action.payload],
            };
        },
        Del_Favorites: (state, action) => {
            Delete_Favorites(action.payload, state.data);
        },
        Set_Theme: (state, action) => {
            __UPDATE_USER_STORAGE__("SET_THEME", action.payload);
            return {
                ...state,
                theme: action.payload,
            };
        },
        Set_Lang: (state, action) => {
            __UPDATE_USER_STORAGE__("SET_LANG", action.payload);
            return {
                ...state,
                lang: action.payload,
            };
        },
        Set_Token: (state, action) => {
            return {
                ...state,
                Token: action.payload,
            };
        },
        Set_Device_Location: (state, action) => {
            return {
                ...state,
                deviceLocation: action.payload,
            };
        },
        Del_Device_Location: (state) => {
            return {
                ...state,
                deviceLocation: null,
            };
        },
        Set_ConfirmationPhoto: (state, action) => {
            return {
                ...state,
                hasUnconfirmedOrder: action.payload,
            };
        },
        Del_ConfirmationPhoto: (state) => {
            return {
                ...state,
                hasUnconfirmedOrder: { has: false, orderId: "" },
            };
        },
    },
});

export const { Set_User, Del_User, Set_User_Post, Del_User_Post, Set_Theme } = User.actions;
export default User.reducer;
