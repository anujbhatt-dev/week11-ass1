import { createSlice } from "@reduxjs/toolkit";

const userSlice = createSlice({
    name:"user",
    initialState:{
        username:"",
        items:[]
    },
    reducers:{
        setItems:(state,action)=>{
            state.items = action.payload.items;
        }
    }
})


export const {setItems} = userSlice.actions
export default userSlice.reducer