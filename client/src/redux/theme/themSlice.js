import { createSlice } from "@reduxjs/toolkit";

const themSlice = createSlice({
  name: "theme",
  initialState: {
    theme: "light",
  },
  reducers: {
    toggleTheme: (state) => {
      state.theme = state.theme === "light" ? "dark" : "light"; 
    },
  },
});

export const { toggleTheme } = themSlice.actions;
export default themSlice.reducer;
