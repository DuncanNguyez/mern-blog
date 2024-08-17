import { Button, Timeline } from "flowbite-react";
import { Post } from "../redux/draft/draftSlice";
import { Link } from "react-router-dom";
import { HiArrowNarrowRight } from "react-icons/hi";
import { memo, useEffect, useState } from "react";
import { User } from "../redux/user/userSlice";

type Props = { post: Post };

const PostItem = memo(({ post }: Props) => {
  const [author, setAuthor] = useState<User>();
  useEffect(() => {
    const getAuthor = async () => {
      try {
        const res = await fetch(`/api/v1/users/${post.authorId}`);
        if (res.ok) {
          const data = await res.json();
          setAuthor(data);
        }
      } catch (error) {
        console.log(error);
      }
    };
    getAuthor();
  }, [post.authorId]);
  return (
    <Timeline.Item key={post._id}>
      <Timeline.Point className="[&>*]:!bg-purple-400 [&>*]:!-left-[7px] " />
      <Timeline.Content className="">
        <Timeline.Title>
          <Link to={`/users/${author?.username}`}>
            <div className="flex gap-3 items-center ">
              <img
                className="size-10 object-cover rounded-full "
                src={author?.imageUrl}
                alt={author?.username}
              />
              <div>{author?.username}</div>
            </div>
          </Link>
        </Timeline.Title>
        <Timeline.Time className="flex justify-end">
          {post.createdAt}
        </Timeline.Time>
        <Timeline.Title>{post.title}</Timeline.Title>
        <Timeline.Body>
          <div className=" flex gap-2 m-2">
            {post.hashtags.map((tag) => (
              <Link key={tag} to={`/posts/tags/${tag}`}>
                <span className="border-2 dark:border px-1 rounded">{tag}</span>
              </Link>
            ))}
          </div>
        </Timeline.Body>
        <Link to={`/posts/${post.path}`}>
          <Button className="m" color="gray">
            Learn More
            <HiArrowNarrowRight className="ml-2 h-3 w-3" />
          </Button>
        </Link>
      </Timeline.Content>
    </Timeline.Item>
  );
});
export default PostItem;
