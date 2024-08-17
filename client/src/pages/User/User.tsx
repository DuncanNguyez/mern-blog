import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { User as U } from "../../redux/user/userSlice";
import { Post } from "../../redux/draft/draftSlice";
import Posts from "../../components/Posts";
import { Button } from "flowbite-react";

const User = () => {
  const { username } = useParams();
  const [user, setUser] = useState<U>();
  const [posts, setPosts] = useState<Array<Post>>();
  const [skip, setSkip] = useState<number>(0);
  const [isMore, setIsMore] = useState<boolean>(true);
  const limit = 5;
  useEffect(() => {
    const getUser = async () => {
      const res = await fetch(`/api/v1/users/${username}`);
      if (res.ok) {
        const data = await res.json();
        setUser(data);
      }
    };
    getUser();
  }, [username]);
  const getPosts = useCallback(async () => {
    if (!user) return;
    const query = new URLSearchParams({
      fields: "title,createdAt,hashtags,authorId,path",
      limit: limit + "",
      skip: skip + "",
    }).toString();
    const res = await fetch(`/api/v1/users/${user?._id}/posts?${query}`);
    if (res.ok) {
      const data = await res.json();
      setSkip(skip + 5);
      if (data.length < limit) setIsMore(false);
      return setPosts([...(posts || []), ...data]);
    }
    return setPosts([...(posts || [])]);
  }, [posts, skip, user]);
  useEffect(() => {
    if (!posts) getPosts();
  }, [getPosts, posts]);
  return (
    <div className=" min-h-screen container mx-auto px-20 mt-10">
      {user && (
        <div className="rounded flex gap-4 items-center bg-gradient-to-r from-indigo-500 from-10% via-[#0ea5e9de] via-30% to-[#0bffae8a] to-90%">
          <img
            className="h-36 w-24 object-cover rounded"
            src={user.imageUrl}
            alt={user.username}
          />
          <div className="flex-1 font-bold text-[30px]">@{username}</div>
        </div>
      )}
      <hr className="m-2" />

      <Posts posts={posts || []} />
      {isMore && (
        <div className="flex justify-center m-5">
          <Button onClick={() => getPosts()} color={"gray"}>
            Show more
          </Button>
        </div>
      )}
    </div>
  );
};

export default User;
