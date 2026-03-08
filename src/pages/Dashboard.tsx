import { Outlet } from "react-router-dom";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";

const Dashboard = () => {
  return (
    <div className="flex min-h-screen">
      <DashboardSidebar />
      <main className="flex-1 p-4 lg:p-8 overflow-auto pt-[4.5rem] lg:pt-8">
        <Outlet />
      </main>
    </div>
  );
};

export default Dashboard;
