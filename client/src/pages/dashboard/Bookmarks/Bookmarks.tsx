import { useCallback, useEffect, useState } from "react";
import { useSelector } from "react-redux";

import { Post } from "../../../redux/draft/draftSlice";
import { User } from "../../../redux/user/userSlice";
import Posts from "../../../components/Posts";
import { Button } from "flowbite-react";

const Bookmarks = () => {
  const user: User = useSelector((state: any) => state.user).currentUser;
  const [posts, setPosts] = useState<Array<Post>>();
  const [skip, setSkip] = useState<number>(0);
  const [isMore, setIsMore] = useState<boolean>(true);
  const limit = 5;
  const getPosts = useCallback(async () => {
    try {
      const query = new URLSearchParams({
        fields: "title,createdAt,hashtags,authorId,path",
        limit: limit + "",
        skip: skip + "",
      }).toString();
      const res = await fetch(
        `/api/v1/users/${user._id}/posts/bookmark?${query}`
      );
      if (res.ok) {
        const data = await res.json();
        setSkip(skip + 5);
        if (data.length < limit) setIsMore(false);
        return setPosts(data);
      }
      setPosts([...(posts || [])]);
    } catch (error) {
      console.log(error);
    }
  }, [posts, skip, user._id]);
  useEffect(() => {
    if (!posts) getPosts();
  }, [getPosts, posts]);
  return (
    <div className="mx-auto mt-20 px-20">
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
export default Bookmarks;
