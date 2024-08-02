import CreatePost from "./CreatePost";
import Profile from "./Profile";

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
