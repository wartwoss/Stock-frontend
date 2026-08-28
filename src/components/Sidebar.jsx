import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  ShoppingCart,
  Users,
  CreditCard,
  WalletCards,
  Package,
  Warehouse,
  Bell,
  Settings,
  Store,
} from "lucide-react";
const sections = [
  {
    title: null,
    items: [
      {
        name: "Dashboard",
        path: "/",
        icon: LayoutDashboard,
      },
    ],
  },
  {
    title: "SALES",
    items: [
      {
        name: "Sales",
        path: "/sales",
        icon: ShoppingCart,
      },
      {
        name: "Customers",
        path: "/customers",
        icon: Users,
      },
      {
        name: "Credits",
        path: "/credits",
        icon: CreditCard,
      },
      {
        name: "Payments",
        path: "/payments",
        icon: WalletCards,
      },
    ],
  },
  {
    title: "STOCK",
    items: [
      {
        name: "Appliances",
        path: "/appliances",
        icon: Package,
      },
      {
        name: "Inventory",
        path: "/inventory",
        icon: Warehouse,
      },
    ],
  },
  {
    title: "SYSTEM",
    items: [
      {
        name: "Notifications",
        path: "/notifications",
        icon: Bell,
      },
      {
        name: "Settings",
        path: "/settings",
        icon: Settings,
      },
    ],
  },
];
function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-icon">
          <Store size={22} />
        </div>
        <div>
          <h2>StockFlow</h2>
          <span>Management System</span>
        </div>
      </div>
      <nav className="sidebar-nav">
        {sections.map((section, index) => (
          <div className="nav-section" key={index}>
            {section.title && (
              <div className="nav-section-title">
                {section.title}
              </div>
            )}
            {section.items.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === "/"}
                  className={({ isActive }) =>
                    `nav-item ${
                      isActive ? "nav-item-active" : ""
                    }`
                  }
                >
                  <Icon size={19} strokeWidth={2} />
                  <span>{item.name}</span>
                </NavLink>
              );
            })}
          </div>
        ))}
      </nav>
      <div className="sidebar-bottom">
        <div className="user-avatar">A</div>
        <div className="sidebar-user-info">
          <strong>Admin</strong>
          <span>Store Manager</span>
        </div>
      </div>
    </aside>
  );
}
export default Sidebar;
