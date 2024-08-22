import { createTheme, ThemeProvider } from "@mui/material";
import { RichTextReadOnly } from "mui-tiptap";
import { useSelector } from "react-redux";
import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

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
import { FaRegBookmark, FaBookmark, FaComment } from "react-icons/fa6";
import { Spinner } from "flowbite-react";

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
  const [loading, setLoading] = useState<boolean>(true);
  const [author, setAuthor] = useState<User>();
  useEffect(() => {
    const getPost = async () => {
      setLoading(true);
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
      setLoading(false);
    };
    getPost();
  }, [currentUser?._id, path]);
  useEffect(() => {
    const getAuthor = async () => {
      const res = await fetch(`/api/v1/users/${post?.authorId}`);
      if (res.ok) {
        const data = await res.json();
        setAuthor(data);
      }
    };
    if (post?.authorId) getAuthor();
  }, [post?.authorId]);
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
      {loading && (
        <div className="text-center ">
          <Spinner className="mx-auto my-4"></Spinner>
        </div>
      )}
      <div className="min-h-screen break-words grid grid-cols-12 ">
        {!post ? (
          <h1 className="m-auto">POST NOT FOUND</h1>
        ) : (
          <>
            <div className="hidden md:flex pl-20 pt-12  col-span-2 flex-col items-center gap-3 h-screen top-[66px] sticky ">
              <div>
                <Link to={`/users/${author?.username}`}>
                  <img
                    src={author?.imageUrl}
                    alt={author?.username}
                    className="size-16 rounded-full object-cover"
                  />
                </Link>
              </div>
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
              <span
                className={` hover:bg-[#66625e45] hover:text-purple-600  cursor-pointer   rounded-full`}
              >
                <a href="#comment" className="block p-3">
                  <FaComment className="size-6" />
                </a>
              </span>
            </div>
            <div className="p-10 col-span-12 md:col-span-8">
              <h1 id="title" className="font-bold  text-4xl m-2">
                {title}
              </h1>
              <div className="text-right mb-10 flex  justify-end ">
                <div className="flex flex-col gap-2">
                  <span>{createdAt}</span>
                  <div className="max-w-lg">
                    {hashtags?.map((tag) => {
                      return (
                        <Link key={tag} to={`/posts/tags/${tag}`}>
                          <span className=" text-sm border-2 dark:border group px-1.5 align-middle inline-block via-emerald-50 m-1  rounded cursor-pointer relative">
                            {tag}
                          </span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </div>
              <RichTextReadOnly content={doc} extensions={extensions} />
              <Comments postId={post._id} />
            </div>
            <div className="[&>nav]:w-auto [&>div]: dark:bg-[#1f2937] col-span-2 md:block hidden h-screen top-[66px] sticky pb-[66px]">
              <TOC />
            </div>
          </>
        )}
      </div>
    </ThemeProvider>
  );
}
