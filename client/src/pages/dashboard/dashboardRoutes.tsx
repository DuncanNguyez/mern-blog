import Profile from "./Profile";
import CreatePost from './CreatePost/CreatePost';
import MyPosts from "./MyPosts/MyPost";
import EditPost from "./EditPost/EditPost";

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
  {
    path: "posts/edit/:path",
    element: <EditPost />,  
    onlyAuthor: true,
  },
];
