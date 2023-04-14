import { configureStore } from "@reduxjs/toolkit";
import userDataReducer from "./Reducers/user";

export default configureStore({
    reducer: {
        user: userDataReducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: false,
        }),
});
