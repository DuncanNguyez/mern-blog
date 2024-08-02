import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  title: null,
  editorDoc: null,
};

const draftSlice = createSlice({
  name: "draft",
  initialState,
  reducers: {
    updateDraftTitle: (state, action) => {
      state.title = action.payload;
    },
    updateDraftEditor: (state,action)=>{
        state.editorDoc = action.payload
    }
  },
});

export const { updateDraftTitle, updateDraftEditor } = draftSlice.actions;
export default draftSlice.reducer;
