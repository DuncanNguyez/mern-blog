import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  title: "",
  editorDoc: null,
  loading: false,
  error: null,
};

const draftSlice = createSlice({
  name: "draft",
  initialState,
  reducers: {
    updateDraftTitle: (state, action) => {
      state.title = action.payload;
    },
    updateDraftEditor: (state, action) => {
      state.editorDoc = action.payload;
    },
    startSubmitPost: (state) => {
      state.loading = true;
      state.error = null;
    },
    submitPostFailure: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
    submitPostSuccess: (state) => {
      state.loading = false;
      state.error = null;
      state.title = "";
      state.editorDoc = null;
    },
  },
});

export const {
  updateDraftTitle,
  updateDraftEditor,
  startSubmitPost,
  submitPostFailure,
  submitPostSuccess,
} = draftSlice.actions;
export default draftSlice.reducer;
