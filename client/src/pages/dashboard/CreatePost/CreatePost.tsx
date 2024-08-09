import { AiOutlineCloseCircle } from "react-icons/ai";
import { useDispatch, useSelector } from "react-redux";
import { createTheme, ThemeProvider } from "@mui/material";
import { Alert, Button, Spinner, TextInput } from "flowbite-react";

import {
  startSubmitPost,
  submitPostFailure,
  submitPostSuccess,
  updateDraftTitle,
  updateDraftHashtags,
} from "../../../redux/draft/draftSlice";
import PostEditor from "./PostEditor";
import { ChangeEvent, MouseEvent, useEffect, useRef, useState } from "react";
import { RootState } from "../../../redux/store";

export default function CreatePost() {
  const { title, editorDoc, error, loading, hashtags } = useSelector(
    (state: RootState) => state.draft
  );
  const { theme } = useSelector((state: RootState) => state.theme);
  const editorRef = useRef<any>();
  const dispatch = useDispatch();
  const [success, setSuccess] = useState(false);
  useEffect(() => {
    if (success) {
      setTimeout(() => {
        setSuccess(false);
      }, 2000);
    }
  }, [success]);
  const handleChangeTitle = (e: ChangeEvent<HTMLInputElement>) => {
    dispatch(updateDraftTitle(e.target.value));
  };
  const addHashtagsWithButton = () => {
    const hashtagsInput = document.getElementById(
      "hashtagsInput"
    ) as HTMLInputElement;
    const tags = hashtagsInput.value.trim().length > 0 ? hashtagsInput.value.trim().split(" ") : [];
    dispatch(updateDraftHashtags(Array.from(new Set([...hashtags, ...tags]))));
    hashtagsInput.value = "";
    hashtagsInput.focus();
  };
  const addHashtagsWithInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.code === "Enter") {
      const el = e.target as HTMLInputElement;
      const tags = el.value.trim().length > 0 ? el.value.trim().split(" ") : [];
      console.log(tags);
      dispatch(
        updateDraftHashtags(Array.from(new Set([...hashtags, ...tags])))
      );
      el.value = "";
      el.focus();
    }
  };
  const handleDeleteHashtag = (e: MouseEvent<HTMLElement>) => {
    const ele = e.target as HTMLElement;
    const tag = ele.closest("span")?.textContent;
    const set = new Set(hashtags);
    set.delete(tag);
    dispatch(updateDraftHashtags(Array.from(set)));
  };
  const mTheme = createTheme({
    palette: {
      mode: theme,
      secondary: {
        main: "#0bd074",
      },
    },
  });
  const handleSubmit = async (e: MouseEvent) => {
    e.preventDefault();
    const payload = { title, editorDoc, hashtags };
    dispatch(startSubmitPost());
    if (!title || editorRef.current.editor.isEmpty) {
      return dispatch(submitPostFailure("Invalid title or content"));
    }
    if (hashtags.length === 0) {
      return dispatch(submitPostFailure("Must contain at least one hashtag"));
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
    } catch (error: any) {
      console.log(error.message);
      dispatch(submitPostFailure(error.message));
    }
  };

  return (
    <ThemeProvider theme={mTheme}>
      <div className="max-w-4xl w-full mx-auto p-3 min-h-screen">
        <form className="w-full mx-auto flex flex-col gap-3">
          <h1 className="text-center text-3xl font-semibold ">Create post</h1>
          <TextInput
            placeholder="Title"
            onChange={handleChangeTitle}
            value={title}
          />
          <div className="flex gap-1 items-center">
            <TextInput
              id="hashtagsInput"
              onKeyDown={addHashtagsWithInput}
              className="flex-1"
              placeholder="hashtag"
            />
            <Button onClick={addHashtagsWithButton} color={"blue"}>
              Add
            </Button>
          </div>
          <div className="px-1   whitespace-normal ">
            {hashtags.map((tag: string) => {
              return (
                <span
                  onClick={handleDeleteHashtag}
                  className=" group px-1.5 align-middle inline-block via-emerald-50 m-1.5 border rounded cursor-pointer relative"
                  key={tag}
                >
                  {tag}
                  <AiOutlineCloseCircle className="hidden group-hover:block absolute top-[-13px] right-[-13px]" />
                </span>
              );
            })}
          </div>
          <PostEditor editorDoc={editorDoc} editorRef={editorRef} />
          <Button
            type="button"
            gradientDuoTone={"cyanToBlue"}
            outline
            disabled={loading}
            onClick={handleSubmit}
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
          {success && <Alert color={"success"}>Successful</Alert>}
        </form>
      </div>
    </ThemeProvider>
  );
}
