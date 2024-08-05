import Profile from "./Profile";
import CreatePost from './CreatePost/CreatePost';

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
];
