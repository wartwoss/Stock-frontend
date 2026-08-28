import {
  Bell,
  Search,
  Menu,
} from "lucide-react";
function Topbar({ title, toggleSidebar }) {
  return (
    <header className="topbar">
      <div className="topbar-left">
        <button
          className="mobile-menu-button"
          onClick={toggleSidebar}
        >
          <Menu size={22} />
        </button>
        <div>
          <h1>{title}</h1>
          <p>Welcome back to your management system</p>
        </div>
      </div>
      <div className="topbar-right">
        <div className="topbar-search">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search..."
          />
        </div>
        <button className="notification-button">
          <Bell size={20} />
          <span className="notification-badge">
            3
          </span>
        </button>
        <div className="topbar-profile">
          <div className="profile-avatar">
            A
          </div>
          <div className="profile-info">
            <strong>Admin</strong>
            <span>Manager</span>
          </div>
        </div>
      </div>
    </header>
  );
}
export default Topbar;
