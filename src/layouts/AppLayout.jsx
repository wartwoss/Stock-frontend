import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
const pageTitles = {
  "/": "Dashboard",
  "/sales": "Sales",
  "/customers": "Customers",
  "/credits": "Credits",
  "/payments": "Payments",
  "/appliances": "Appliances",
  "/inventory": "Inventory",
  "/notifications": "Notifications",
  "/settings": "Settings",
};
function AppLayout() {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] =
    useState(false);
  const title =
    pageTitles[location.pathname] ??
    "Management System";
  return (
    <div className="app-shell">
      <div
        className={`sidebar-container ${
          sidebarOpen ? "sidebar-open" : ""
        }`}
      >
        <Sidebar />
      </div>
      {sidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <div className="app-main">
        <Topbar
          title={title}
          toggleSidebar={() =>
            setSidebarOpen(!sidebarOpen)
          }
        />
        <main className="page-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
export default AppLayout;
