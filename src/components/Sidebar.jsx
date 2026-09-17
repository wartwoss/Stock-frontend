import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  ShoppingCart,
  Users,
  CreditCard,
  Package,
  Warehouse,
  Bell,
  Settings,
  Store,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../contexts/AuthContext";

const sections = [
  {
    titleKey: null,
    items: [
      {
        tKey: "navigation.dashboard",
        path: "/",
        icon: LayoutDashboard,
      },
    ],
  },
  {
    titleKey: "navigation.salesTitle",
    items: [
      {
        tKey: "navigation.sales",
        path: "/sales",
        icon: ShoppingCart,
      },
      
      {
        tKey: "navigation.credits",
        path: "/credits",
        icon: CreditCard,
      },
  /*    {
        tKey: "navigation.payments",
        path: "/payments",
        icon: WalletCards,
      }, */
    ],
  },
  {
    titleKey: "navigation.stockTitle",
    items: [
      {
        tKey: "navigation.appliances",
        path: "/appliances",
        icon: Package,
      },
      {
        tKey: "navigation.inventory",
        path: "/inventory",
        icon: Warehouse,
      },
    ],
  },
  {
    titleKey: "navigation.systemTitle",
    items: [
      {
        tKey: "navigation.notifications",
        path: "/notifications",
        icon: Bell,
      },
      {
        tKey: "navigation.settings",
        path: "/settings",
        icon: Settings,
      },
    ],
  },
];

function Sidebar() {
  const { t } = useTranslation();
  const { logout } = useAuth();

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-icon">
          <Store size={22} />
        </div>
        <div>
          <h2>{t("sidebar.appName")}</h2>
          <span>{t("sidebar.appSubtitle")}</span>
        </div>
      </div>
      <nav className="sidebar-nav">
        {sections.map((section, index) => (
          <div className="nav-section" key={index}>
            {section.titleKey && (
              <div className="nav-section-title">
                {t(section.titleKey)}
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
                  <span>{t(item.tKey)}</span>
                </NavLink>
              );
            })}
          </div>
        ))}
      </nav>
      <div className="sidebar-bottom">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div className="user-avatar">A</div>
          <div className="sidebar-user-info">
            <strong>{t("sidebar.admin", "Admin")}</strong>
            <span>{t("sidebar.storeManager", "Store Manager")}</span>
          </div>
        </div>
        <button onClick={logout} style={{ background: "none", border: "none", cursor: "pointer", color: "#ef4444", fontWeight: "600", fontSize: "13px" }}>
          {t("sidebar.logout", "Logout")}
        </button>
      </div>
    </aside>
  );
}
export default Sidebar;
