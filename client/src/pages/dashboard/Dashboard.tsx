import { Outlet } from "react-router-dom";

import DashboardSidebar from "./DashboardSidebar";

export default function Dashboard() {
  return (
    <div className="relative  break-words grid grid-cols-12 ">
      <div className="break-words [&>nav]:w-auto [&>div]: dark:bg-[#1f2937] md:col-span-2 col-span-12  h-screen top-[66px] md:sticky">
        <DashboardSidebar />
      </div>
      <div className=" md:col-span-10 col-span-12 p-5 min-h-screen">
        <Outlet />
      </div>
    </div>
  );
}
