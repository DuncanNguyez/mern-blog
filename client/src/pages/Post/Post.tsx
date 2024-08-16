import { createTheme, ThemeProvider } from "@mui/material";
import { RichTextReadOnly } from "mui-tiptap";
import { useSelector } from "react-redux";
import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { extensions } from "../../tiptap/editorExtension";
import TOC from "./TOC";
import { Post as P } from "../../redux/draft/draftSlice";
import Comments from "./Comments";
import { User } from "../../redux/user/userSlice";
import {
  BiUpvote,
  BiSolidUpvote,
  BiDownvote,
  BiSolidDownvote,
} from "react-icons/bi";
import { FaRegBookmark, FaBookmark } from "react-icons/fa6";

export default function Post() {
  const { theme } = useSelector((state: any) => state.theme);
  const [post, setPost] = useState<P>();
  const { path } = useParams();
  const {
    _id,
    title,
    hashtags,
    doc,
    voteNumber,
    downNumber,
    createdAt,
    bookmarks,
  } = post || {};
  const currentUser: User | null = useSelector(
    (state: any) => state.user
  ).currentUser;
  const [upVoted, setUpVoted] = useState<boolean>(false);
  const [downVoted, setDownVoted] = useState<boolean>(false);
  const [bookmarked, setBookmarked] = useState<boolean>(
    bookmarks?.some((id) => id === currentUser?._id) || false
  );
  const [voteNum, setVoteNum] = useState<number>(voteNumber || 0);
  const [downNum, setDownNum] = useState<number>(downNumber || 0);

  useEffect(() => {
    const getPost = async () => {
      try {
        const res = await fetch(`/api/v1/posts/${path}`);
        if (res.ok) {
          const data: P = await res.json();
          setPost(data);
          setDownVoted(
            data.down?.some((id) => id === currentUser?._id) || false
          );
          setDownNum(data?.downNumber || 0);
          setUpVoted(data.vote?.some((id) => id === currentUser?._id) || false);
          setVoteNum(data?.voteNumber || 0);
          setBookmarked(
            data.bookmarks?.some((id) => id === currentUser?._id) || false
          );
        }
      } catch (error: any) {
        console.log(error.message);
      }
    };
    getPost();
  }, [currentUser?._id, path]);

  const handleUpVote = useCallback(async () => {
    const res = await fetch(`/api/v1/posts/${_id}/vote`, { method: "post" });
    if (res.ok) {
      const data: P = await res.json();
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
    const res = await fetch(`/api/v1/posts/${_id}/vote`, {
      method: "delete",
    });
    if (res.ok) {
      const data: P = await res.json();
      setDownVoted(data.down?.some((id) => id === currentUser?._id) || false);
      setDownNum(data?.downNumber || 0);
      setUpVoted(data.vote?.some((id) => id === currentUser?._id) || false);
      setVoteNum(data?.voteNumber || 0);
    }
    if (res.status === 401) {
      alert("You need to login in to vote");
    }
  }, [_id, currentUser?._id]);

  const handleBookmark = useCallback(async () => {
    const res = await fetch(
      `/api/v1/users/${currentUser?._id}/bookmark/${_id}`,
      {
        method: "post",
      }
    );
    if (res.ok) {
      const data: P = await res.json();
      setBookmarked(
        data.bookmarks?.some((id) => id === currentUser?._id) || false
      );
    }
    if (res.status === 401) {
      alert("You need to login in to vote");
    }
  }, [_id, currentUser?._id]);

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
      <div className="max-w-screen-2xl mx-auto flex flex-row justify-between min-h-screen gap-4 ">
        {!post ? (
          <h1 className="m-auto">POST NOT FOUND</h1>
        ) : (
          <>
            <div className="hidden md:flex pl-20 pt-12 ml-3  flex-col items-center gap-3 h-screen top-[66px] sticky ">
              <img
                src={currentUser?.imageUrl}
                alt={currentUser?.username}
                className="size-16 rounded-full object-cover cursor-pointer"
              />
              <div className="flex flex-col gap-1">
                <span
                  onClick={handleUpVote}
                  className={`${
                    upVoted ? "text-orange-600" : ""
                  } hover:bg-[#66625e45] hover:text-orange-600  cursor-pointer p-1  rounded-full`}
                >
                  {upVoted ? (
                    <BiSolidUpvote className="size-10" />
                  ) : (
                    <BiUpvote className="size-10 " />
                  )}
                </span>
                <span className="text-2xl text-center">
                  {voteNum - downNum}
                </span>
                <span
                  onClick={handleDownVote}
                  className={`${
                    downVoted ? " text-purple-800" : ""
                  } hover:bg-[#66625e45] hover:text-purple-600  cursor-pointer p-1  rounded-full`}
                >
                  {downVoted ? (
                    <BiSolidDownvote className="size-10 " />
                  ) : (
                    <BiDownvote className="size-10  " />
                  )}
                </span>
              </div>
              <span
                onClick={handleBookmark}
                className={`${
                  bookmarked ? " text-purple-800" : ""
                } hover:bg-[#66625e45] hover:text-purple-600  cursor-pointer p-3  rounded-full`}
              >
                {bookmarked ? (
                  <FaBookmark className="size-6" />
                ) : (
                  <FaRegBookmark className="size-6 " />
                )}
              </span>
            </div>
            <div className="p-10 flex-1">
              <h1 id="title" className="font-bold  text-4xl m-2">
                {title}
              </h1>
              <div className="text-right mb-10 flex  justify-end ">
                <div className="flex flex-col gap-2">
                  <span>{createdAt}</span>
                  <div className="max-w-lg">
                    {hashtags?.map((tag) => {
                      return (
                        <span
                          className=" text-sm bg-gray-500 group px-1.5 align-middle inline-block via-emerald-50 m-1 border rounded cursor-pointer relative"
                          key={tag}
                        >
                          {tag}
                        </span>
                      );
                    })}
                  </div>
                </div>
              </div>
              <RichTextReadOnly content={doc} extensions={extensions} />
              <Comments postId={post._id} />
            </div>
            <TOC />
          </>
        )}
      </div>
    </ThemeProvider>
  );
}
