import { createSlice } from "@reduxjs/toolkit";

export interface PopupState {
  signinIsShow: boolean;
}
const initialState: PopupState = {
  signinIsShow: false,
};
const popupSlice = createSlice({
  name: "popup",
  initialState,
  reducers: {
    showSignin: (state: PopupState) => {
      state.signinIsShow = true;
    },
    closeSignin: (state: PopupState) => {
      state.signinIsShow = false;
    },
  },
});
export const { showSignin, closeSignin } = popupSlice.actions;

export default popupSlice.reducer;
