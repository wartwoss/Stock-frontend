import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";

function AppLayout() {
  const location = useLocation();
  const { t } = useTranslation();
  const [sidebarOpen, setSidebarOpen] =
    useState(false);

  const pageTitleKeys = {
    "/": "pageTitles./",
    "/sales": "pageTitles./sales",
    "/customers": "pageTitles./customers",
    "/credits": "pageTitles./credits",
    "/appliances": "pageTitles./appliances",
    "/inventory": "pageTitles./inventory",
    "/notifications": "pageTitles./notifications",
    "/settings": "pageTitles./settings",
  };

  const titleKey = pageTitleKeys[location.pathname];
  const title = titleKey ? t(titleKey) : "Management System";
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
