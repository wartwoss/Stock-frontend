import { Menu } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useExchangeRate } from "../contexts/ExchangeRateContext";
import { useAuth } from "../contexts/AuthContext";

function Topbar({ title, toggleSidebar }) {
  const { t, i18n } = useTranslation();
  const { exchangeRate, loading } = useExchangeRate();
  const { logout } = useAuth();

  const toggleLanguage = () => {
    const newLang = i18n.language === "en" ? "ku" : "en";
    i18n.changeLanguage(newLang);
    localStorage.setItem("app_lang", newLang);
    document.documentElement.dir = newLang === "ku" ? "rtl" : "ltr";
    document.documentElement.lang = newLang;
  };

  return (
    <header className="topbar">
      <div className="topbar-left">
        <button className="mobile-menu-button" onClick={toggleSidebar}>
          <Menu size={22} />
        </button>
        <div>
          <h1>{title}</h1>
          <p>{t("topbar.welcome")}</p>
        </div>
      </div>
      <div className="topbar-right">
        <button onClick={toggleLanguage} style={{ background: "none", border: "1px solid #e5e7eb", cursor: "pointer", padding: "6px 12px", borderRadius: "6px", fontWeight: "500", fontSize: "14px" }}>
          {i18n.language === "en" ? "Kurdish (KU)" : "English (EN)"}
        </button>
        <div style={{ padding: "6px 12px", backgroundColor: "#f3f4f6", borderRadius: "6px", fontWeight: "600", fontSize: "14px", color: "#374151" }}>
          {loading ? "..." : `100$ = ${Math.round(exchangeRate || 0).toLocaleString("en-US")} IQD`}
        </div>
      </div>
    </header>
  );
}
export default Topbar;
