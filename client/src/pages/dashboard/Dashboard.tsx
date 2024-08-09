import { Outlet } from "react-router-dom";

import DashboardSidebar from "./DashboardSidebar";

export default function Dashboard() {
  return (
    <div className="flex relative flex-col md:flex-row">
      <DashboardSidebar  />
      <Outlet />
    </div>
  );
}
