import { createSlice } from "@reduxjs/toolkit";

const addMeetingSlice = createSlice({
  name: "addMeeting",
  initialState: {
    isVisible: false,
    refreshTrigger: 0,
  },
  reducers: {
    toggle: (state) => {
      state.isVisible = !state.isVisible;
    },
    refreshMeetings: (state) => {
      state.refreshTrigger += 1;
    },
  },
});

export const { toggle, refreshMeetings } = addMeetingSlice.actions;
export default addMeetingSlice.reducer;