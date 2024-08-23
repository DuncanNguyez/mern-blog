import { useCallback, useEffect, useState } from "react";
import Posts from "../components/Posts";
import { Post } from "../redux/draft/draftSlice";
import { Button, Spinner } from "flowbite-react";

export default function Home() {
  const [posts, setPost] = useState<Array<Post>>();
  const [hashtags, setHashtags] = useState<Array<string>>([]);
  const [hashtagsSearch, setHashtagsSearch] = useState<Set<string>>(new Set());
  const [skip, setSkip] = useState<number>(0);
  const [isMore, setIsMore] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(true);
  const limit = 5;
  useEffect(() => {
    const getTags = async () => {
      const res = await fetch("/api/v1/posts/hashtags");
      if (res.ok) {
        const data = await res.json();
        setHashtags(data);
      }
    };
    getTags();
  }, []);
  const getPosts = useCallback(
    async (currentSkip?: number) => {
      setLoading(true);
      try {
        const query = new URLSearchParams({
          hashtags:
            hashtagsSearch.size !== 0
              ? Array.from(hashtagsSearch).join(",")
              : "",
          fields: "title,createdAt,hashtags,authorId,path",
          limit: limit + "",
          skip: (currentSkip === 0 ? currentSkip : skip) + "",
        }).toString();
        const res = await fetch(`/api/v1/posts?${query}`);
        if (res.ok) {
          const data = await res.json();
          setSkip((currentSkip === 0 ? currentSkip : skip) + 5);
          if (data.length < limit) setIsMore(false);
          setLoading(false);
          return setPost([...(currentSkip === 0 ? [] : posts || []), ...data]);
        }
      } catch (error) {
        console.log(error);
      }
      setLoading(false);
      setPost([...(posts || [])]);
    },
    [hashtagsSearch, posts, skip]
  );
  useEffect(() => {
    if (!posts) getPosts(0);
  }, [getPosts, posts]);
  const handleChangeHashtagsSearch = useCallback(
    async (e: React.MouseEvent<HTMLElement>) => {
      const value = (e.target as HTMLElement).textContent as string;
      if (hashtagsSearch.has(value)) {
        hashtagsSearch.delete(value);
      } else {
        hashtagsSearch.add(value);
      }
      setHashtagsSearch(hashtagsSearch);
      await getPosts(0);
    },
    [hashtagsSearch, getPosts]
  );
  return (
    <div>
      <div className="text-balance pb-1 bg-gradient-to-r from-indigo-500 from-10% via-[#0ea5e9de] via-30% to-[#0bffae8a] to-90%">
        <h1 className="text-center underline">All Tags</h1>
        <div className=" max-h-52  overflow-auto  gap-2 m-2  px-20 pb-5 pt-0">
          {hashtags.map((tag) => {
            const onSearch = hashtagsSearch.has(tag);
            return (
              <span
                onClick={handleChangeHashtagsSearch}
                key={tag}
                className={`${
                  onSearch ? "bg-orange-400" : ""
                } inline-block m-1 border-2 dark:border px-1 rounded cursor-pointer`}
              >
                {tag}
              </span>
            );
          })}
        </div>
      </div>
      <div className="min-h-screen max-w-screen-lg container mx-auto px-20 mt-3">
        <Posts posts={posts || []} />
        {loading && (
          <div className="text-center">
            <Spinner className="mx-auto my-4"></Spinner>
          </div>
        )}
        {isMore && (
          <div className="flex justify-center m-5">
            <Button
              onClick={() => {
                getPosts();
              }}
              color={"gray"}
            >
              Show more
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
