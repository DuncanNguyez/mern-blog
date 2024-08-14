import { AiOutlineCloseCircle } from "react-icons/ai";
import { useDispatch, useSelector } from "react-redux";
import { Alert, Button, Spinner, TextInput } from "flowbite-react";

import {
  startSubmitPost,
  submitPostFailure,
  submitPostSuccess,
  updateDraftTitle,
  updateDraftHashtags,
  updateDraftEditor,
} from "../../../redux/draft/draftSlice";
import PostEditor from "../../../components/PostEditor";
import {
  ChangeEvent,
  MouseEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { RootState } from "../../../redux/store";

export default function CreatePost() {
  const { title, editorDoc, error, loading, hashtags } = useSelector(
    (state: RootState) => state.draft
  );
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
  const handleChangeTitle = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      dispatch(updateDraftTitle(e.target.value));
    },
    [dispatch]
  );
  const addHashtagsWithButton = useCallback(() => {
    const hashtagsInput = document.getElementById(
      "hashtagsInput"
    ) as HTMLInputElement;
    const tags =
      hashtagsInput.value.trim().length > 0
        ? hashtagsInput.value.trim().toLowerCase().split(" ")
        : [];
    dispatch(updateDraftHashtags(Array.from(new Set([...hashtags, ...tags]))));
    hashtagsInput.value = "";
    hashtagsInput.focus();
  }, [dispatch, hashtags]);
  const addHashtagsWithInput = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.code === "Enter") {
        const el = e.target as HTMLInputElement;
        const tags =
          el.value.trim().length > 0
            ? el.value.trim().toLowerCase().split(" ")
            : [];
        console.log(tags);
        dispatch(
          updateDraftHashtags(Array.from(new Set([...hashtags, ...tags])))
        );
        el.value = "";
        el.focus();
      }
    },
    [dispatch, hashtags]
  );
  const handleDeleteHashtag = useCallback(
    (e: MouseEvent<HTMLElement>) => {
      const ele = e.target as HTMLElement;
      const tag = ele.closest("span")?.textContent;
      const set = new Set(hashtags);
      set.delete(tag);
      dispatch(updateDraftHashtags(Array.from(set)));
    },
    [dispatch, hashtags]
  );

  const handleSubmit = useCallback(
    async (e: MouseEvent) => {
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
        const res = await fetch("/api/v1/posts", {
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
        setSuccess(true);
        dispatch(submitPostSuccess());
      } catch (error: any) {
        console.log(error.message);
        dispatch(submitPostFailure(error.message));
      }
    },
    [dispatch, editorDoc, hashtags, title]
  );

  return (
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
        <PostEditor
          onUpdate={(editor: any) => {
            dispatch(updateDraftEditor(editor.getJSON()));
          }}
          editorDoc={editorDoc}
          editorRef={editorRef}
        />
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
  );
}
