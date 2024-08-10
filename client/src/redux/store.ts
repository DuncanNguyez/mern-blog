import { combineReducers, configureStore } from "@reduxjs/toolkit";
import persistReducer from "redux-persist/es/persistReducer";
import storage from "redux-persist/lib/storage";
import persistStore from "redux-persist/es/persistStore";
import createTransform from "redux-persist/es/createTransform";

import userReducer from "./user/userSlice.js";
import themeReducer from "./theme/themSlice.js";
import draftSlice from "./draft/draftSlice.js";
import revisingSlice from "./revising/revisingSlice.js";
const rootReducer = combineReducers({
  user: userReducer,
  theme: themeReducer,
  draft: draftSlice,
  revising: revisingSlice,
});

const transform = createTransform(
  (inboundState: any) => inboundState,
  (outboundState, key) => {
    if (key === "user" || key === "draft") {
      outboundState.error = null;
      outboundState.loading = null;
    }
    return outboundState;
  }
);
const persistedReducer = persistReducer(
  {
    key: "root",
    storage,
    version: 1,
    transforms: [transform],
  },
  rootReducer as any
);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }),
});

export const persistor = persistStore(store);
// Get the type of our store variable
export type AppStore = typeof store;
// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<AppStore["getState"]>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = AppStore["dispatch"];
