import { useEffect, useState } from "react";
import {
  Package,
  ShoppingCart,
  DollarSign,
  CreditCard,
  WalletCards,
  AlertTriangle,
  TrendingUp,
  Clock,
} from "lucide-react";
import { getDashboard } from "../api/dashboard";
function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] =
    useState(true);
  const [error, setError] =
    useState(null);
  useEffect(() => {
    loadDashboard();
  }, []);
  async function loadDashboard() {
    try {
      setLoading(true);
      setError(null);
      const result =
        await getDashboard();
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
        Loading dashboard...
      </div>
    );
  }
  if (error) {
    return (
      <div className="page-state error-state">
        <h3>Could not load dashboard</h3>
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
      title: "Stock Available",
      value:
        inventory.total_in_stock ?? 0,
      subtitle: "Units currently in stock",
      icon: Package,
    },
    {
      title: "Units Sold",
      value:
        inventory.total_sold ?? 0,
      subtitle: "Total units sold",
      icon: ShoppingCart,
    },
    {
      title: "Total Sales",
      value: formatMoney(
        sales.total_sales_amount
      ),
      subtitle: `${
        sales.total_sales ?? 0
      } sales recorded`,
      icon: DollarSign,
    },
    {
      title: "Outstanding Debt",
      value: formatMoney(
        credits.total_outstanding_debt
      ),
      subtitle: `${
        credits.active_credits ?? 0
      } active credits`,
      icon: CreditCard,
    },
    {
      title: "Payments This Month",
      value: formatMoney(
        credits.monthly_payments_received
      ),
      subtitle:
        credits.payment_month ??
        "Current month",
      icon: WalletCards,
    },
    {
      title: "Overdue Customers",
      value:
        credits.overdue_customers_count ??
        0,
      subtitle: "Require attention",
      icon: AlertTriangle,
    },
  ];
  return (
    <div className="dashboard-page">
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
              <h2>Low Stock</h2>
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
                text="No low-stock appliances."
              />
            )}
          </div>
        </div>
        <div className="dashboard-panel">
          <div className="panel-header">
            <div>
              <h2>
                Overdue Customers
              </h2>
              <p>
                Customers with late
                installments
              </p>
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
                        {formatMoney(
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
                text="No overdue customers."
              />
            )}
          </div>
        </div>
      </section>
      <section className="dashboard-bottom-grid">
        <div className="dashboard-panel compact-panel">
          <div className="mini-stat">
            <div className="mini-stat-icon">
              <DollarSign size={20} />
            </div>
            <div>
              <span>Cash Sales</span>
              <strong>
                {sales.cash_sales ?? 0}
              </strong>
            </div>
          </div>
          <div className="mini-stat">
            <div className="mini-stat-icon">
              <CreditCard size={20} />
            </div>
            <div>
              <span>Credit Sales</span>
              <strong>
                {sales.credit_sales ?? 0}
              </strong>
            </div>
          </div>
          <div className="mini-stat">
            <div className="mini-stat-icon">
              <Clock size={20} />
            </div>
            <div>
              <span>
                Completed Credits
              </span>
              <strong>
                {credits.completed_credits ??
                  0}
              </strong>
            </div>
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
function formatMoney(value) {
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
