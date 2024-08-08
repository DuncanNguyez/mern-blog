import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  title: "",
  hashtags: [],
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
    updateDraftHashtags: (state, action) => {
      state.hashtags = action.payload;
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
      state.hashtags = [];
    },
  },
});

export const {
  updateDraftTitle,
  updateDraftHashtags,
  updateDraftEditor,
  startSubmitPost,
  submitPostFailure,
  submitPostSuccess,
} = draftSlice.actions;
export default draftSlice.reducer;
