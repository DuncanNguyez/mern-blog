import { Alert } from "flowbite-react";
import { useCallback, useEffect, useState } from "react";
import { useSelector } from "react-redux";

export default function MyPosts() {
  const { currentUser } = useSelector((state) => state.user);
  const id = currentUser._id;
  const [posts, setPosts] = useState();
  const [skip, setSkip] = useState(0);
  const [error, setError] = useState();
  const limit = 10;

  const getPosts = useCallback(async () => {
    try {
      const res = await fetch(
        `/api/v1/posts/user/${id}?fields=title,path,createdAt&limit${limit}$skip=${skip}`
      );
      if (res.ok) {
        const data = await res.json();
        console.log(data);
        setPosts((prevPosts) => [...(prevPosts || []), ...data]);
        setSkip((prevSkip) => prevSkip + limit);
        return;
      }
      if (res.headers.get("Content-type").includes("application/json")) {
        const data = await res.json();
        return setError(data.message);
      }
      setError(res.statusText);
    } catch (error) {
      setError(error.message);
    }
  }, [id, limit, skip]);

  useEffect(() => {
    if (!posts && !error) {
      getPosts();
    }
  }, [posts, getPosts, error]);
  return (
    <div className="flex flex-col w-full  ">
      {error && <Alert color="failure">{error}</Alert>}
    </div>
  );
}
