import { AiOutlineCloseCircle } from "react-icons/ai";
import { useDispatch, useSelector } from "react-redux";
import { Alert, Button, Spinner, TextInput } from "flowbite-react";

import {
  ChangeEvent,
  MouseEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { RootState } from "../../../redux/store";
import PostEditor from "../../../components/PostEditor";
import { useParams } from "react-router-dom";
import { Post } from "../../../redux/draft/draftSlice";
import {
  fetchPostFailure,
  fetchPostSuccess,
  handleRevisingStart,
  updatePostFailure,
  updatePostSuccess,
  updateRevisingPost,
} from "../../../redux/revising/revisingSlice";
import MenuButtonReset from "../../../components/MenuButtonReset";

export default function EditPost() {
  const dispatch = useDispatch();
  const [success, setSuccess] = useState(false);
  const [rerender, setRerender] = useState(false);
  const { currentUser } = useSelector((state: any) => state.user);
  const editorRef = useRef<any>();
  const { loading, error, posts } = useSelector(
    (state: RootState) => state.revising
  );
  const path = useParams().path as string;

  const { title, doc, hashtags, _id }: Post = posts[path] || {};

  const getPost = useCallback(async () => {
    // we need to rerender editor tiptap,
    // by default the editor will not do this without dependencies
    setRerender(true);
    dispatch(handleRevisingStart());
    try {
      const res = await fetch(`/api/v1/posts/${path}`);
      if (res.ok) {
        const data = await res.json();
        return dispatch(fetchPostSuccess(data));
      }
      if (res.headers.get("Content-type")?.includes("application/json")) {
        const data = await res.json();

        return dispatch(fetchPostFailure(data.message));
      }
      dispatch(fetchPostFailure(res.statusText));
    } catch (error: any) {
      dispatch(fetchPostFailure(error.message));
    }
  }, [path, dispatch]);

  useEffect(() => {
    if (!doc) {
      getPost();
    }
  }, [doc, getPost]);

  useEffect(() => {
    if (success) {
      setTimeout(() => {
        setSuccess(false);
      }, 2000);
    }
  }, [success]);

  // disable rerender when use ui
  useEffect(() => {
    if (rerender) {
      setTimeout(() => {
        setRerender(false);
      }, 1000);
    }
  }, [rerender]);
  const handleReset = useCallback(() => {
    getPost();
  }, [getPost]);
  const handleChangeTitle = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      dispatch(updateRevisingPost({ title: e.target.value, path } as Post));
    },
    [dispatch, path]
  );
  const addHashtagsWithButton = useCallback(() => {
    const hashtagsInput = document.getElementById(
      "hashtagsInput"
    ) as HTMLInputElement;
    const tags =
      hashtagsInput.value.trim().length > 0
        ? hashtagsInput.value.trim().toLowerCase().split(" ")
        : [];
    const newHashtags = Array.from(new Set([...hashtags, ...tags]));
    dispatch(updateRevisingPost({ hashtags: newHashtags, path } as Post));

    hashtagsInput.value = "";
    hashtagsInput.focus();
  }, [dispatch, hashtags, path]);
  const addHashtagsWithInput = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.code === "Enter") {
        const el = e.target as HTMLInputElement;
        const tags =
          el.value.trim().length > 0
            ? el.value.trim().toLowerCase().split(" ")
            : [];
        const newHashtags = Array.from(new Set([...hashtags, ...tags]));
        dispatch(updateRevisingPost({ hashtags: newHashtags, path } as Post));

        el.value = "";
        el.focus();
      }
    },
    [dispatch, hashtags, path]
  );
  const handleDeleteHashtag = useCallback(
    (e: MouseEvent<HTMLElement>) => {
      const ele = e.target as HTMLElement;
      const tag = ele.closest("span")?.textContent;
      const set = new Set(hashtags);
      set.delete(tag || "");
      dispatch(updateRevisingPost({ hashtags: Array.from(set), path } as Post));
    },
    [dispatch, hashtags, path]
  );

  const handleSubmit = useCallback(
    async (e: MouseEvent) => {
      e.preventDefault();
      const payload = { title, editorDoc: doc, hashtags };
      dispatch(handleRevisingStart());
      if (!title || editorRef.current.editor.isEmpty) {
        return dispatch(updatePostFailure("Invalid title or content"));
      }
      if (hashtags.length === 0) {
        return dispatch(updatePostFailure("Must contain at least one hashtag"));
      }
      try {
        const res = await fetch(`/api/v1/users/${currentUser._id}/posts/${_id}`, {
          method: "put",
          headers: {
            "Content-type": "application/json",
          },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const contentType = res.headers.get("Content-type");
          if (contentType === "application/json; charset=utf-8") {
            const data = await res.json();
            return dispatch(updatePostFailure(data.message));
          }
          return dispatch(updatePostFailure(res.statusText));
        }
        dispatch(updatePostSuccess(path));
      } catch (error: any) {
        console.log(error.message);
        dispatch(updatePostFailure(error.message));
      }
    },
    [_id, currentUser._id, dispatch, doc, hashtags, path, title]
  );

  return (
    <div className=" w-full mx-auto p-3 min-h-screen">
      <form className="w-full mx-auto flex flex-col gap-3">
        <h1 className="text-center text-3xl font-semibold ">Edit post</h1>
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
          {hashtags?.map((tag: string) => {
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
          menuButtons={<MenuButtonReset handleClick={handleReset} />}
          editorDoc={doc || null}
          onUpdate={(editor: any) => {
            dispatch(
              updateRevisingPost({ doc: editor.getJSON(), path } as Post)
            );
          }}
          dependenciesEnable={rerender}
          editorRef={editorRef}
          editable={!rerender}
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
