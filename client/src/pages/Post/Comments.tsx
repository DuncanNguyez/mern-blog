import { Alert, TextInput } from "flowbite-react";
import CommentTree from "./CommentTree";
import { ChangeEvent, useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { User } from "../../redux/user/userSlice";
import { showSignin } from "../../redux/popup/popupSlice";

type Props = {
  postId?: string;
  replyToId?: string;
};
export interface ICommentContent {
  text?: string;
}
export interface IComment {
  _id?: string;
  postId?: string;
  userId: string;
  replyToId?: string;
  vote?: Array<string>;
  voteNumber?: number;
  down?: Array<string>;
  downNumber?: number;
  content: ICommentContent;
  [key: string]: any;
}
export default function Comments(props: Props) {
  const currentUser: User = useSelector((state: any) => state.user).currentUser;
  const { postId } = props;
  const [comment, setComment] = useState<IComment>();
  const [commentsNow, setCommentsNow] = useState<Array<IComment>>([]);
  const [addCommentError, setAddCommentError] = useState<string>();
  const dispatch = useDispatch();
  const handleChangeComment = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const { value } = e.target;
      setComment({
        postId,
        userId: currentUser?._id,
        content: { text: value },
      });
    },
    [currentUser?._id, postId]
  );
  useEffect(() => {
    if (currentUser) {
      setComment((prev) => ({
        postId: "",
        content: { text: "" },
        ...prev,
        userId: currentUser._id,
      }));
    }
  }, [currentUser]);
  const handleAddComment = useCallback(
    async (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.code === "Enter") {
        if (!currentUser) {
          return dispatch(showSignin());
        }
        try {
          if (!comment || !comment.content.text) {
            return;
          }
          const res = await fetch("/api/v1/comments", {
            method: "post",
            headers: { "Content-type": "application/json" },
            body: JSON.stringify(comment),
          });
          if (res.ok) {
            const data = await res.json();
            setCommentsNow([...commentsNow, data]);
            (e.target as HTMLInputElement).value = "";
            (e.target as HTMLInputElement).focus();
            setComment(undefined);
            return setAddCommentError("");
          }
          if (res.headers.get("Content-type")?.includes("application/json")) {
            const data = await res.json();
            return setAddCommentError(data.message);
          }
          return setAddCommentError(res.statusText);
        } catch (error: any) {
          setAddCommentError(error.message);
        }
      }
    },
    [comment, commentsNow, currentUser, dispatch]
  );
  return (
    <div id="comment" className="pt-[76px] w-full">
      <TextInput
        onChange={handleChangeComment}
        onKeyDown={handleAddComment}
        shadow={true}
        placeholder="Add a comment"
      />
      {addCommentError && <Alert color={"failure"}>{addCommentError}</Alert>}
      <CommentTree postId={postId} commentsNow={commentsNow} />
    </div>
  );
}
