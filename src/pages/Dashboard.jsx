import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import {
  Package,
  ShoppingCart,
  DollarSign,
  CreditCard,
  
  
  TrendingUp,
  Calendar,
} from "lucide-react";
import { getDashboard } from "../api/dashboard";
function Dashboard() {
  const { t } = useTranslation();
  const [data, setData] = useState(null);
  const [period, setPeriod] = useState("today");
  const [loading, setLoading] =
    useState(true);
  const [error, setError] =
    useState(null);
  useEffect(() => {
    loadDashboard();
  }, [period]);
  async function loadDashboard() {
    try {
      setLoading(true);
      setError(null);
      
      const now = new Date();
      let dateFrom = "";
      let dateTo = "";
      
      if (period === "today") {
        dateFrom = now.toISOString().split("T")[0];
        dateTo = dateFrom;
      } else if (period === "month") {
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, "0");
        dateFrom = `${year}-${month}-01`;
        
        // get last day of month
        const lastDay = new Date(year, now.getMonth() + 1, 0).getDate();
        dateTo = `${year}-${month}-${String(lastDay).padStart(2, "0")}`;
      }
      
      const result = await getDashboard({ date_from: dateFrom, date_to: dateTo });
      setData(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }
  if (loading) {
    return (
      <div className="page-state">
        {t("dashboard.loading")}
      </div>
    );
  }
  if (error) {
    return (
      <div className="page-state error-state">
        <h3>{t("dashboard.errorTitle")}</h3>
        <p>{error}</p>
        <button
          className="primary-button"
          onClick={loadDashboard}
        >
          Try Again
        </button>
      </div>
    );
  }
  const inventory =
    data?.inventory ?? {};
  const sales =
    data?.sales ?? {};
  const credits =
    data?.credits ?? {};
  const cards = [
    {
      title: t("dashboard.stockAvailable"),
      value: inventory.total_in_stock ?? 0,
      subtitle: t("dashboard.unitsInStock"),
      icon: Package,
    },
    {
      title: t("dashboard.unitsSold"),
      value: sales.total_units_sold ?? 0,
      subtitle: period === "today" ? t("dashboard.unitsSoldToday") : t("dashboard.unitsSoldMonth"),
      icon: ShoppingCart,
    },
    {
      title: t("dashboard.totalSales"),
      value: formatCurrency(sales.total_sales_amount),
      subtitle: `${sales.total_sales ?? 0} sales ${period === "today" ? "today" : "this month"}`,
      icon: DollarSign,
    },
    {
      title: t("dashboard.outstandingDebt"),
      value: formatCurrency(credits.total_outstanding_debt),
      subtitle: `${credits.active_credits ?? 0} active credits`,
      icon: CreditCard,
    },
  ];
  return (
    <div className="dashboard-page">
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", backgroundColor: "#fff", padding: "6px 12px", borderRadius: "8px", border: "1px solid #e5e7eb" }}>
          <Calendar size={16} color="#6b7280" />
          <select 
            value={period} 
            onChange={(e) => setPeriod(e.target.value)}
            style={{ border: "none", outline: "none", background: "transparent", fontWeight: "500", color: "#374151", cursor: "pointer" }}
          >
            <option value="today">{t("common.today")}</option>
            <option value="month">{t("common.thisMonth")}</option>
            <option value="all">{t("common.allTime")}</option>
          </select>
        </div>
      </div>
      <section className="dashboard-cards">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <article
              className="dashboard-card"
              key={card.title}
            >
              <div className="dashboard-card-top">
                <div className="dashboard-card-icon">
                  <Icon size={21} />
                </div>
                <TrendingUp
                  size={17}
                  className="card-trend-icon"
                />
              </div>
              <div className="dashboard-card-content">
                <span>
                  {card.title}
                </span>
                <strong>
                  {card.value}
                </strong>
                <small>
                  {card.subtitle}
                </small>
              </div>
            </article>
          );
        })}
      </section>
      <section className="dashboard-grid">
        <div className="dashboard-panel">
          <div className="panel-header">
            <div>
              <h2>{t("dashboard.lowStock")}</h2>
              <p>
                Appliances that may need
                restocking
              </p>
            </div>
            <span className="panel-count">
              {inventory.low_stock_count ??
                0}
            </span>
          </div>
          <div className="panel-body">
            {inventory.low_stock?.length >
            0 ? (
              inventory.low_stock.map(
                (item) => (
                  <div
                    className="stock-row"
                    key={item.id}
                  >
                    <div className="row-icon">
                      <Package size={18} />
                    </div>
                    <div className="stock-info">
                      <strong>
                        {item.appliance
                          ?.name ??
                          "Unknown appliance"}
                      </strong>
                      <span>
                        {item.storage
                          ?.name ??
                          "Unknown storage"}
                      </span>
                    </div>
                    <div className="stock-quantity">
                      {
                        item.quantity_in_stock
                      }{" "}
                      left
                    </div>
                  </div>
                )
              )
            ) : (
              <EmptyState
                text={t("dashboard.noLowStock")}
              />
            )}
          </div>
        </div>
        <div className="dashboard-panel">
          <div className="panel-header">
            <div>
              <h2>{t("dashboard.overdueCustomers")}</h2>
              <p>{t("dashboard.overdueCustomersDesc")}</p>
            </div>
            <span className="panel-count danger-count">
              {credits.overdue_customers_count ??
                0}
            </span>
          </div>
          <div className="panel-body">
            {credits.overdue_customers
              ?.length > 0 ? (
              credits.overdue_customers.map(
                (customer) => (
                  <div
                    className="customer-row"
                    key={
                      customer.customer_id
                    }
                  >
                    <div className="customer-avatar">
                      {getInitials(
                        customer.customer_name
                      )}
                    </div>
                    <div className="stock-info">
                      <strong>
                        {customer.customer_name ??
                          "Unknown customer"}
                      </strong>
                      <span>
                        {customer.phone_number ??
                          "No phone"}
                      </span>
                    </div>
                    <div className="debt-info">
                      <strong>
                        {formatCurrency(
                          customer.outstanding_debt
                        )}
                      </strong>
                      <span>
                        {
                          customer.overdue_credits
                        }{" "}
                        overdue
                      </span>
                    </div>
                  </div>
                )
              )
            ) : (
              <EmptyState
                text={t("dashboard.noOverdueCustomers")}
              />
            )}
          </div>
        </div>
      </section>

    </div>
  );
}
function EmptyState({ text }) {
  return (
    <div className="empty-state">
      <p>{text}</p>
    </div>
  );
}
function formatCurrency(value, currency = "USD") { if (currency === "IQD") return Math.round(Number(value ?? 0)).toLocaleString("en-US") + " IQD";
  const amount =
    Number(value ?? 0);
  return new Intl.NumberFormat(
    "en-US",
    {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 2,
    }
  ).format(amount);
}
function getInitials(name) {
  if (!name) {
    return "?";
  }
  return name
    .split(" ")
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
}
export default Dashboard;
