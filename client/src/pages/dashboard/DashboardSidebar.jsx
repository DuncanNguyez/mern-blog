import { Sidebar } from "flowbite-react";
import { IoDocumentsSharp } from "react-icons/io5";
import { HiDocumentAdd, HiUser, HiLogout } from "react-icons/hi";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { getAuth } from "firebase/auth";
import { useDispatch, useSelector } from "react-redux";

import { app } from "../../firebase";
import { signOutSuccess } from "../../redux/user/userSlice";

export default function DashboardSidebar() {
  const location = useLocation();
  const path = location.pathname.replace(/.+\//, "");
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentUser } = useSelector((state) => state.user);
  const handleSignOut = async () => {
    try {
      getAuth(app).signOut();
      await fetch("/api/v1/auth/sign-out", { method: "post" });
      dispatch(signOutSuccess());
      navigate("/sign-in");
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <Sidebar className="min-h-screen md:top-0 md:sticky w-full md:w-56">
      <Sidebar.Items className="h-screen">
        <Sidebar.ItemGroup>
          <Link to={"/dashboard/profile"}>
            <Sidebar.Item
              icon={HiUser}
              label={currentUser.isAuthor ? "Author" : "User"}
              labelColor="dark"
              active={path === "profile"}
              as="div"
            ></Sidebar.Item>
          </Link>
        </Sidebar.ItemGroup>
        {currentUser && currentUser.isAuthor && (
          <Sidebar.ItemGroup>
            <Link to={"/dashboard/create-post"}>
              <Sidebar.Item
                icon={HiDocumentAdd}
                active={path === "create-post"}
                as="div"
                className="my-1"
              >
                <span className="font-semibold">Create post</span>
              </Sidebar.Item>
            </Link>
            <Link to={"/dashboard/posts"}>
              <Sidebar.Item
                icon={IoDocumentsSharp}
                active={path === "posts"}
                className="my-1"
                as="div"
              >
                <span className="font-semibold">My posts</span>
              </Sidebar.Item>
            </Link>
          </Sidebar.ItemGroup>
        )}
        <Sidebar.ItemGroup>
          <Sidebar.Item className="cursor-pointer" icon={HiLogout}>
            <span onClick={handleSignOut} className="text-red-500">
              Sign Out
            </span>
          </Sidebar.Item>
        </Sidebar.ItemGroup>
      </Sidebar.Items>
    </Sidebar>
  );
}
