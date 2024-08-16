import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface User {
  _id: string;
  username: string;
  imageUrl: string;
  isAuthor: boolean;
  password: string;
  refreshToken: string;
}
interface UserState {
  currentUser: User | null;
  error: string;
  loading: boolean;
}
const initialState: UserState = {
  currentUser: null,
  error: "",
  loading: false,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    signInStart: (state: UserState) => {
      state.loading = true;
      state.error = "";
    },
    signInSuccess: (state: UserState, action: PayloadAction<User>) => {
      state.currentUser = action.payload;
      state.loading = false;
      state.error = "";
    },
    signInFailure: (state: UserState, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    updateStart: (state: UserState) => {
      state.loading = true;
      state.error = "";
    },
    updateSuccess: (state: UserState, action: PayloadAction<User>) => {
      state.currentUser = action.payload;
      state.loading = false;
      state.error = "";
    },
    updateFailure: (state: UserState, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    deleteStart: (state: UserState) => {
      state.loading = true;
      state.error = "";
    },
    deleteSuccess: (state: UserState) => {
      state.currentUser = null;
      state.error = "";
      state.loading = false;
    },
    deleteFailure: (state: UserState, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.loading = false;
    },
    signOutSuccess: (state: UserState) => {
      state.currentUser = null;
      state.error = "";
      state.loading = false;
    },
    refreshToken: (state: UserState, action: PayloadAction<string>) => {
      if (state.currentUser) state.currentUser.refreshToken = action.payload;
    },
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
  signOutSuccess,
  refreshToken
} = userSlice.actions;
export default userSlice.reducer;
