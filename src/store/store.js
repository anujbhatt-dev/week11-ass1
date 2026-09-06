import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./slices/userSlice";
import addMeetingReducer from "./slices/addMeetingSlice";

export const store = configureStore({
    reducer:{
        user:userReducer,
        addMeeting: addMeetingReducer
    }
})