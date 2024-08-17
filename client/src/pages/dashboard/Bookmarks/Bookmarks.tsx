import { useEffect, useState } from "react";
import { Post } from "../../../redux/draft/draftSlice";
import { useSelector } from "react-redux";
import { User } from "../../../redux/user/userSlice";
import { Button, Timeline } from "flowbite-react";
import { HiArrowNarrowRight } from "react-icons/hi";
import { Link } from "react-router-dom";
const Bookmarks = () => {
  const user: User = useSelector((state: any) => state.user).currentUser;
  const [posts, setPosts] = useState<Array<Post>>([]);
  useEffect(() => {
    const getPosts = async () => {
      try {
        const res = await fetch(`/api/v1/users/${user._id}/posts/bookmark`);
        if (res.ok) {
          const data = await res.json();
          return setPosts(data);
        }
      } catch (error) {
        console.log(error);
      }
    };
    getPosts();
  }, [user._id]);
  return (
    <div className="mx-auto mt-20">
      {posts.length > 0 && (
        <Timeline>
          {posts.map((post) => {
            return (
              <Timeline.Item key={post._id}>
                <Timeline.Point />
                <Timeline.Content>
                  <Timeline.Time>{post.createdAt}</Timeline.Time>
                  <Link to={`/posts/${post.path}`}>
                    <Timeline.Title>{post.title}</Timeline.Title>
                    <Button className="mt-5" color="gray">
                      Learn More
                      <HiArrowNarrowRight className="ml-2 h-3 w-3" />
                    </Button>
                  </Link>
                </Timeline.Content>
              </Timeline.Item>
            );
          })}
        </Timeline>
      )}
    </div>
  );
};
export default Bookmarks;
