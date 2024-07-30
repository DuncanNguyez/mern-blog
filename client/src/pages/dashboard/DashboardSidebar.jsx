import { Sidebar } from "flowbite-react";
import { HiUser, HiLogout } from "react-icons/hi";
import { Link, useLocation } from "react-router-dom";
import { getAuth } from "firebase/auth";
import { useDispatch } from "react-redux";

import { app } from "../../firebase";
import { signOutSuccess } from "../../redux/user/userSlice";

export default function DashboardSidebar() {
  const location = useLocation();
  const path = location.pathname.replace(/.+\//, "");
  const dispatch = useDispatch();
  const handleSignOut = async () => {
    try {
      getAuth(app).signOut();
      await fetch("/api/v1/auth/sign-out", { method: "post" });
      dispatch(signOutSuccess());
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <Sidebar className="min-h-screen w-full md:w-56">
      <Sidebar.Items className="h-screen">
        <Sidebar.ItemGroup>
          <Link to={"/dashboard/profile"}>
            <Sidebar.Item
              icon={HiUser}
              label="User"
              labelColor="dark"
              active={path === "profile"}
              as="div"
            ></Sidebar.Item>
          </Link>
        </Sidebar.ItemGroup>
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
