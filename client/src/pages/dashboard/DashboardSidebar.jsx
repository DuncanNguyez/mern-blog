import { Sidebar } from "flowbite-react";
import { HiUser, HiLogout } from "react-icons/hi";
import { Link, useLocation } from "react-router-dom";

export default function DashboardSidebar() {
  const location = useLocation();
  const path = location.pathname.replace(/.+\//, "");

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
            ></Sidebar.Item>
          </Link>
        </Sidebar.ItemGroup>
        <Sidebar.ItemGroup>
          <Sidebar.Item className="cursor-pointer" icon={HiLogout}>
            <span className="text-red-500">Sign Out</span>
          </Sidebar.Item>
        </Sidebar.ItemGroup>
      </Sidebar.Items>
    </Sidebar>
  );
}
