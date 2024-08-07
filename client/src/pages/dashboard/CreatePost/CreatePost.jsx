import { useDispatch, useSelector } from "react-redux";
import { createTheme, ThemeProvider } from "@mui/material";
import { Alert, Button, Spinner, TextInput } from "flowbite-react";

import {
  startSubmitPost,
  submitPostFailure,
  submitPostSuccess,
  updateDraftTitle,
} from "../../../redux/draft/draftSlice";
import PostEditor from "./PostEditor";
import { useRef } from "react";

export default function CreatePost() {
  const { title, editorDoc, error, loading } = useSelector(
    (state) => state.draft
  );
  const { theme } = useSelector((state) => state.theme);
  const editorRef = useRef();
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
  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { title, editorDoc };
    dispatch(startSubmitPost());
    if (!title || editorRef.current.editor.isEmpty) {
      return dispatch(submitPostFailure("Invalid title or content"));
    }
    try {
      const res = await fetch("/api/v1/post/create", {
        method: "post",
        headers: {
          "Content-type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const contentType = res.headers.get("Content-type");
        if (contentType === "application/json; charset=utf-8") {
          const data = await res.json();
          return dispatch(submitPostFailure(data.message));
        }
        return dispatch(submitPostFailure(res.statusText));
      }
      dispatch(submitPostSuccess());
    } catch (error) {
      console.log(error.message);
      dispatch(submitPostFailure(error.message));
    }
  };

  return (
    <ThemeProvider theme={mTheme}>
      <div className="max-w-4xl w-full mx-auto p-3 min-h-screen">
        <form
          onSubmit={handleSubmit}
          className="w-full mx-auto flex flex-col gap-3"
        >
          <h1 className="text-center text-3xl font-semibold ">Create post</h1>
          <TextInput
            className="my-2"
            placeholder="Title"
            onChange={handleChangeTitle}
            value={title}
          />
          <PostEditor editorDoc={editorDoc} editorRef={editorRef} />
          <Button
            type="submit"
            gradientDuoTone={"cyanToBlue"}
            outline
            disabled={loading}
          >
            {loading ? (
              <>
                <Spinner size={"sm"} />
                <span className="pl-3">loading...</span>
              </>
            ) : (
              "Save"
            )}
          </Button>
          {error && <Alert color={"failure"}>{error}</Alert>}
        </form>
      </div>
    </ThemeProvider>
  );
}
