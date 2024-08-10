import { createSlice } from "@reduxjs/toolkit";
import { Content } from "@tiptap/core";

export interface Post{
  _id?:string,
  path:string,
  title: string;
  hashtags: Array<string>;
  doc?:Content
}
export interface DraftState {
  title: string;
  hashtags: Array<string>;
  loading: boolean;
  error: string;
  editorDoc: Content;
}

const initialState: DraftState = {
  title: "",
  hashtags: [],
  editorDoc: null,
  loading: false,
  error: "",
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
      state.error = "";
    },
    submitPostFailure: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
    submitPostSuccess: (state) => {
      state.loading = false;
      state.error = "";
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
