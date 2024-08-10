import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Post } from "../draft/draftSlice";

type PostsRecord = Record<string, Post>;
interface RevisingState {
  loading: boolean;
  error: string;
  posts: PostsRecord;
}

const initialState: RevisingState = {
  loading: false,
  error: "",
  posts: {},
};
const revisingSlice = createSlice({
  name: "revising",
  initialState,
  reducers: {
    handleRevisingStart: (state: RevisingState) => {
      state.loading = true;
      state.error = "";
    },
    fetchPostFailure: (state: RevisingState, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    fetchPostSuccess: (state: RevisingState, action: PayloadAction<Post>) => {
      state.loading = false;
      state.error = "";
      const path = action.payload.path;
      state.posts[path] = action.payload;
    },
    updatePostFailure: (
      state: RevisingState,
      action: PayloadAction<string>
    ) => {
      state.loading = false;
      state.error = action.payload;
    },
    updatePostSuccess: (state: RevisingState,action:PayloadAction<string>) => {
      state.loading = false;
      state.error = "";
      delete state.posts[action.payload]
    },
    updateRevisingPost: (state, action: PayloadAction<Post>) => {
      const { path, title, hashtags, doc } = action.payload;
      if (title) state.posts[path].title = title;
      if (hashtags) state.posts[path].hashtags = hashtags;
      if (doc) state.posts[path].doc = doc;
    },
  },
});

export const {
  handleRevisingStart,
  fetchPostFailure,
  fetchPostSuccess,
  updatePostFailure,
  updatePostSuccess,
  updateRevisingPost,
} = revisingSlice.actions;
export default revisingSlice.reducer;
