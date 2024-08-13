import { BiUpvote, BiDownvote } from "react-icons/bi";
import { Alert, Button, Timeline } from "flowbite-react";
import { IComment } from "./Comments";
import { ChangeEvent, useCallback, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { User } from "../../redux/user/userSlice";
import CommentTree from "./CommentTree";

type Props = {
  comment: IComment;
};
interface IUser {
  username: string;
  email: string;
  imageUrl: string;
}

const CommentItem = (props: Props) => {
  const { _id, postId, userId, voteNumber, downNumber, content, createdAt } =
    props.comment;

  const [error, setError] = useState<string>();
  const [user, setUser] = useState<IUser>();
  const [showTextEditor, setShowTextEditor] = useState<boolean>(false);
  const [comment, setComment] = useState<IComment>();
  const [commentsNow, setCommentsNow] = useState<Array<IComment>>([]);
  const [addCommentError, setAddCommentError] = useState<string>();

  const currentUser: User = useSelector((state: any) => state.user).currentUser;
  useEffect(() => {
    const getUser = async () => {
      try {
        const res = await fetch(`/api/v1/users/${userId}`);
        if (res.ok) {
          const data = await res.json();
          return setUser(data);
        }
        if (res.headers.get("Content-type")?.includes("application/json")) {
          const data = await res.json();
          return setError(data.message);
        }
        setError(res.statusText);
      } catch (error: any) {
        setError(error.message);
      }
    };
    getUser();
  }, [userId]);

  const handleChangeComment = useCallback(
    (e: ChangeEvent<HTMLTextAreaElement>) => {
      const text = e.target.value;
      setComment({
        postId,
        replyToId: _id,
        userId: currentUser?._id,
        content: { text },
      });
    },
    [_id, currentUser?._id, postId]
  );
  const handleReply = useCallback(
    async (e: React.MouseEvent<HTMLButtonElement>) => {
      try {
        if (!comment || !comment?.content.text) {
          return;
        }
        if (!currentUser) {
          return alert("You need to login in to comment");
        }
        const res = await fetch("/api/v1/comments", {
          method: "post",
          headers: { "Content-type": "application/json" },
          body: JSON.stringify(comment),
        });
        if (res.ok) {
          const data = await res.json();
          setCommentsNow([...commentsNow, data]);
          const textareaEle = (e.target as HTMLInputElement)
            .closest(".grow-wrap")
            ?.querySelector("textarea");
          if (textareaEle) {
            textareaEle.value = "";
            textareaEle?.focus();
          }
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
    },
    [comment, commentsNow, currentUser]
  );
  useEffect(() => {
    setTimeout(() => {
      const growers = document.querySelectorAll(".grow-wrap");
      growers.forEach((grower: any) => {
        const textarea = grower.querySelector(
          "textarea"
        ) as HTMLTextAreaElement;
        if (textarea) {
          textarea.oninput = () => {
            grower.dataset.replicatedValue = textarea.value;
          };
        }
      });
    }, 500);
  }, [showTextEditor]);
  return (
    <>
      {!error && (
        <Timeline.Item className="mb-6">
          <Timeline.Point />
          <Timeline.Content>
            <Timeline.Title>
              <div className="flex gap-3 items-center ">
                <img
                  className="size-10 object-cover rounded-full cursor-pointer"
                  src={user?.imageUrl}
                  alt={user?.username}
                />
                <div>{user?.username}</div>
                <Timeline.Time className=" m-0">{createdAt}</Timeline.Time>
              </div>
            </Timeline.Title>
            <Timeline.Body>{content.text}</Timeline.Body>
            <div className="flex gap-10 items-center m-2">
              <div className="flex gap-2">
                <span className="hover:bg-gray-400 hover:text-purple-700  cursor-pointer p-1  rounded-full">
                  <BiUpvote className="size-6 cursor-pointer" />
                </span>
                <span>{voteNumber || 0}</span>
              </div>
              <div className="flex gap-2">
                <span className="hover:bg-gray-400 hover:text-purple-700  cursor-pointer p-1  rounded-full">
                  <BiDownvote className="size-6 cursor-pointer " />
                </span>
                <span>{downNumber || 0}</span>
              </div>
              <div>
                <span
                  onClick={() => setShowTextEditor(!showTextEditor)}
                  className="hover:bg-gray-400 px-4 cursor-pointer py-2 rounded-full hover:text-purple-800 font-semibold"
                >
                  Reply
                </span>
              </div>
            </div>
            {showTextEditor && (
              <div className="grow-wrap">
                <textarea
                  onChange={handleChangeComment}
                  className=" text-gray-700 dark:text-gray-200 dark:bg-[rgb(23,30,48)] w-full border-1 rounded"
                />
                <div className="mt-2 flex justify-end gap-2">
                  <Button
                    onClick={() => setShowTextEditor(!showTextEditor)}
                    outline
                    gradientDuoTone={"redToYellow"}
                  >
                    cancel
                  </Button>
                  <Button
                    onClick={handleReply}
                    outline
                    gradientMonochrome={"cyan"}
                  >
                    comment
                  </Button>
                </div>
                {addCommentError && (
                  <Alert color={"failure"}>{addCommentError}</Alert>
                )}
              </div>
            )}
            <div className="">
              <CommentTree replyToId={_id} commentsNow={commentsNow} />
            </div>
          </Timeline.Content>
        </Timeline.Item>
      )}
    </>
  );
};

export default CommentItem;
