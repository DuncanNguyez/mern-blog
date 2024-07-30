import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  currentUser: null,
  error: null,
  loading: false,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    signInStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    signInSuccess: (state, action) => {
      state.currentUser = action.payload;
      state.loading = null;
      state.error = null;
    },
    signInFailure: (state, action) => {
      state.loading = null;
      state.error = action.payload;
    },
    updateStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    updateSuccess: (state, action) => {
      state.currentUser = action.payload;
      state.loading = null;
      state.error = null;
    },
    updateFailure: (state, action) => {
      state.loading = null;
      state.error = action.payload;
    },
    deleteStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    deleteSuccess: (state) => {
      state.currentUser = null;
      state.error = null;
      state.loading = null;
    },
    deleteFailure: (state, action) => {
      state.error = action.payload;
      state.loading = null;
    },
    signOutSuccess:(state)=>{
      state.currentUser = null
      state.error = null
      state.loading = null
    }
  },
});

export const {
  signInFailure,
  signInStart,
  signInSuccess,
  updateStart,
  updateSuccess,
  updateFailure,
  deleteStart,
  deleteFailure,
  deleteSuccess,
  signOutSuccess
} = userSlice.actions;
export default userSlice.reducer;
