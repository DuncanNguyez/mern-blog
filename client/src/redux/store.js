import { combineReducers, configureStore } from "@reduxjs/toolkit";
import persistReducer from "redux-persist/es/persistReducer";
import storage from "redux-persist/lib/storage";
import persistStore from "redux-persist/es/persistStore";
import createTransform from "redux-persist/es/createTransform";

import userReducer from "./user/userSlice.js";
import themeReducer from "./theme/themSlice.js";
import draftSlice from "./draft/draftSlice.js";

const rootReducer = combineReducers({
  user: userReducer,
  theme: themeReducer,
  draft: draftSlice,
});

const transform = createTransform(
  (inboundState) => inboundState,
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
  rootReducer
);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }),
});

export const persistor = persistStore(store);
