import { Timeline } from "flowbite-react";
import { RiPlayListAddLine } from "react-icons/ri";
import { RxDotsHorizontal } from "react-icons/rx";
import { memo, useCallback, useEffect, useState } from "react";
import { IComment } from "./Comments";
import CommentItem from "./CommentItem";
import { useLocation } from "react-router-dom";

type Props = {
  postId?: string;
  replyToId?: string;
  userId?: string;
  commentsNow: Array<IComment>;
};

const CommentTree = memo((props: Props) => {
  const [comments, setComments] = useState<Array<IComment>>();
  const [error, setError] = useState<string>();
  const { postId, commentsNow, replyToId } = props;
  const [limit, setLimit] = useState<number>(3);
  const [skip, setSkip] = useState<number>(0);
  const [isMore, setIsMore] = useState<boolean>(true);
  const { pathname } = useLocation();
  const getComments = useCallback(async () => {
    try {
      const queryString = new URLSearchParams({
        limit,
        skip,
        ...(replyToId ? {} : { onlyRoot: true }),
      } as any).toString();
      const res = replyToId
        ? await fetch(`/api/v1/comments/${replyToId}?${queryString}`)
        : await fetch(`/api/v1/posts/${postId}/comments?${queryString}`);
      if (res.ok) {
        const data = await res.json();
        if (data.length < limit) {
          setIsMore(false);
        }
        setLimit(limit + 1);
        setSkip(skip + limit);
        return setComments([...(comments || []), ...data]);
      }
      if (res.headers.get("Content-type")?.includes("application/json")) {
        const data = await res.json();
        return setError(data.message);
      }
      setError(res.statusText);
    } catch (error: any) {
      setError(error.message);
    }
  }, [comments, limit, postId, replyToId, skip]);

  // call only one
  useEffect(() => {
    const getCommentsFirstOnly = async () => {
      try {
        const limit = 3;
        const skip = 0;
        const queryString = new URLSearchParams({
          limit,
          skip,
          ...(replyToId ? {} : { onlyRoot: true }),
        } as any).toString();
        const res = replyToId
          ? await fetch(`/api/v1/comments/${replyToId}?${queryString}`)
          : await fetch(`/api/v1/posts/${postId}/comments?${queryString}`);
        if (res.ok) {
          const data = await res.json();
          if (data.length < limit) {
            setIsMore(false);
          }
          setLimit(limit + 1);
          setSkip(skip + limit);
          return setComments(data);
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
    getCommentsFirstOnly();
    console.log(pathname);
  }, [pathname, postId, replyToId]);

  const handleViewMore = useCallback(() => {
    getComments();
  }, [getComments]);

  return (
    <div className={`mt-8 w-full`}>
      <Timeline className="border-l-2  border-purple-300   p-l-10 w-full">
        {commentsNow.length !== 0 &&
          !error &&
          commentsNow.reverse().map((comment) => {
            return <CommentItem key={comment._id} comment={comment} />;
          })}
        {!error &&
          comments?.map((comment) => {
            return <CommentItem key={comment._id} comment={comment} />;
          })}
        {isMore && (
          <div onClick={handleViewMore} className=" flex gap-1 my-10">
            <RxDotsHorizontal />
            <RiPlayListAddLine size={30} className="cursor-pointer " />
          </div>
        )}
      </Timeline>
    </div>
  );
});
export default CommentTree;
