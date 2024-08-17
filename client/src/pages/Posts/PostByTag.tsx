import { useCallback, useEffect, useState } from "react";
import Posts from "../../components/Posts";
import { Post } from "../../redux/draft/draftSlice";
import { useParams } from "react-router-dom";
import { Button } from "flowbite-react";

export default function PostsByTag() {
  const [posts, setPost] = useState<Array<Post>>();
  const { hashtag } = useParams();
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
      const res = await fetch(`/api/v1/posts/tags/${hashtag}?${query}`);
      if (res.ok) {
        const data = await res.json();
        setSkip(skip + 5);
        if (data.length < limit) setIsMore(false);
        return setPost(data);
      }
    } catch (error) {
      console.log(error);
    }
    setPost([...(posts || [])]);
  }, [hashtag, posts, skip]);
  useEffect(() => {
    if (!posts) getPosts();
  }, [getPosts, posts]);

  return (
    <div className="min-h-screen max-w-screen-lg container mx-auto px-20 mt-10">
      <h1 className="m-auto text-2xl text-center mb-2">{hashtag}</h1>
      <hr className="mb-20" />
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
}
