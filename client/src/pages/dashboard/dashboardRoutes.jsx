import Profile from "./Profile";
import CreatePost from './CreatePost/CreatePost';
import MyPosts from "./MyPosts/MyPost";

export default [
  {
    path: "profile",
    element: <Profile />,
  },
  {
    path: "create-post",
    element: <CreatePost />,  
    onlyAuthor: true,
  },
  {
    path: "posts",
    element: <MyPosts />,  
    onlyAuthor: true,
  },
];
