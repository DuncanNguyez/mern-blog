import {
  BiUpvote,
  BiSolidUpvote,
  BiDownvote,
  BiSolidDownvote,
} from "react-icons/bi";
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
  const {
    _id,
    postId,
    userId,
    voteNumber,
    downNumber,
    content,
    createdAt,
    vote,
    down,
  } = props.comment;
  const currentUser: User | null = useSelector(
    (state: any) => state.user
  ).currentUser;
  const [upVoted, setUpVoted] = useState<boolean>(
    vote?.some((id) => id === currentUser?._id) || false
  );
  const [downVoted, setDownVoted] = useState<boolean>(
    down?.some((id) => id === currentUser?._id) || false
  );
  const [voteNum, setVoteNum] = useState<number>(voteNumber || 0);
  const [downNum, setDownNum] = useState<number>(downNumber || 0);
  const [error, setError] = useState<string>();
  const [user, setUser] = useState<IUser>();
  const [showTextEditor, setShowTextEditor] = useState<boolean>(false);
  const [comment, setComment] = useState<IComment>();
  const [commentsNow, setCommentsNow] = useState<Array<IComment>>([]);
  const [addCommentError, setAddCommentError] = useState<string>();

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
        userId: currentUser?._id || "",
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

  const handleUpVote = useCallback(async () => {
    const res = await fetch(`/api/v1/comments/${_id}/vote`, { method: "post" });
    if (res.ok) {
      const data: IComment = await res.json();
      setDownVoted(data.down?.some((id) => id === currentUser?._id) || false);
      setDownNum(data?.downNumber || 0);
      setUpVoted(data.vote?.some((id) => id === currentUser?._id) || false);
      setVoteNum(data?.voteNumber || 0);
    }
    if (res.status === 401) {
      alert("You need to login in to vote");
    }
  }, [_id, currentUser?._id]);

  const handleDownVote = useCallback(async () => {
    const res = await fetch(`/api/v1/comments/${_id}/vote`, {
      method: "delete",
    });
    if (res.ok) {
      const data: IComment = await res.json();
      setDownVoted(data.down?.some((id) => id === currentUser?._id) || false);
      setDownNum(data?.downNumber || 0);
      setUpVoted(data.vote?.some((id) => id === currentUser?._id) || false);
      setVoteNum(data?.voteNumber || 0);
    }
    if (res.status === 401) {
      alert("You need to login in to vote");
    }
  }, [_id, currentUser?._id]);

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
                <span
                  onClick={handleUpVote}
                  className={`${
                    upVoted ? "text-orange-600" : ""
                  } hover:bg-[#66625e45] hover:text-orange-600  cursor-pointer p-1  rounded-full`}
                >
                  {upVoted ? (
                    <BiSolidUpvote className="size-6" />
                  ) : (
                    <BiUpvote className="size-6" />
                  )}
                </span>
                <span>{voteNum}</span>
              </div>
              <div className="flex gap-2">
                <span
                  onClick={handleDownVote}
                  className={`${
                    downVoted ? " text-purple-800" : ""
                  } hover:bg-[#66625e45] hover:text-purple-600  cursor-pointer p-1  rounded-full`}
                >
                  {downVoted ? (
                    <BiSolidDownvote className="size-6" />
                  ) : (
                    <BiDownvote className="size-6" />
                  )}
                </span>
                <span>{downNum}</span>
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
