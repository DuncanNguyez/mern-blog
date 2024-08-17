import { Post } from "../redux/draft/draftSlice";
import { Timeline } from "flowbite-react";
import PostItem from "./PostItem";

type Props = { posts: Array<Post> };

const Posts = ({ posts }: Props) => {
  return (
    <>
      {posts.length > 0 && (
        <Timeline className="border-l-2 border-purple-300" >
          {posts.map((post) => {
            return <PostItem  key={post._id} post={post} />;
          })}
        </Timeline>
      )}
    </>
  );
};
export default Posts;
