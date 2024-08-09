import { createSlice } from "@reduxjs/toolkit";
type ThemeState = {
  theme: "dark" | "light";
};
const initialState: ThemeState = {
  theme: "dark",
};
const themSlice = createSlice({
  name: "theme",
  initialState,
  reducers: {
    toggleTheme: (state) => {
      state.theme = state.theme === "light" ? "dark" : "light";
    },
  },
});

export const { toggleTheme } = themSlice.actions;
export default themSlice.reducer;
