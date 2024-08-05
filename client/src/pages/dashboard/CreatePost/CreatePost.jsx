import { useDispatch, useSelector } from "react-redux";
import { createTheme, ThemeProvider } from "@mui/material";
import { TextInput } from "flowbite-react";

import { updateDraftTitle } from "../../../redux/draft/draftSlice";
import PostEditor from "./PostEditor";

export default function CreatePost() {
  const { title } = useSelector((state) => state.draft);
  const { theme } = useSelector((state) => state.theme);

  const dispatch = useDispatch();

  const handleChangeTitle = (e) => {
    dispatch(updateDraftTitle(e.target.value));
  };
  const mTheme = createTheme({
    palette: {
      mode: theme,
      secondary: {
        main: "#0bd074",
      },
    },
  });

  return (
    <ThemeProvider theme={mTheme}>
      <div className="max-w-4xl w-full mx-auto p-3 min-h-screen">
        <div className="w-full mx-auto flex-1">
          <h1 className="text-center text-3xl font-semibold my-7">
            Create post
          </h1>
          <TextInput
            className="my-2"
            placeholder="Title"
            onChange={handleChangeTitle}
            value={title}
          />
          <PostEditor />
        </div>
      </div>
    </ThemeProvider>
  );
}
