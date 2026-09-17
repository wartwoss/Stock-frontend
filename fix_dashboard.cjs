const fs = require('fs');
let code = fs.readFileSync('src/pages/Dashboard.jsx', 'utf8');

// Normalize CRLF to LF
code = code.replace(/\r\n/g, '\n');

// 1. Add Calendar icon and period state
code = code.replace(
  '  TrendingUp,\n} from "lucide-react";',
  '  TrendingUp,\n  Calendar,\n} from "lucide-react";'
);

code = code.replace(
  '  const [data, setData] = useState(null);',
  '  const [data, setData] = useState(null);\n  const [period, setPeriod] = useState("today");'
);

// 2. Update useEffect to depend on period, and calculate date_from/date_to
code = code.replace(
  `  useEffect(() => {
    loadDashboard();
  }, []);
  async function loadDashboard() {
    try {
      setLoading(true);
      setError(null);
      const result =
        await getDashboard();
      setData(result);
    } catch (err) {`,
  `  useEffect(() => {
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
        dateFrom = \`\${year}-\${month}-01\`;
        
        // get last day of month
        const lastDay = new Date(year, now.getMonth() + 1, 0).getDate();
        dateTo = \`\${year}-\${month}-\${String(lastDay).padStart(2, "0")}\`;
      }
      
      const result = await getDashboard({ date_from: dateFrom, date_to: dateTo });
      setData(result);
    } catch (err) {`
);

// 3. Update cards
code = code.replace(
  `  const cards = [
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
      value: formatCurrency(
        sales.total_sales_amount
      ),
      subtitle: \`\${
        sales.total_sales ?? 0
      } sales recorded\`,
      icon: DollarSign,
    },
    {
      title: "Outstanding Debt",
      value: formatCurrency(
        credits.total_outstanding_debt
      ),
      subtitle: \`\${
        credits.active_credits ?? 0
      } active credits\`,
      icon: CreditCard,
    },
    {
      title: "Payments This Month",
      value: formatCurrency(
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
  ];`,
  `  const cards = [
    {
      title: "Stock Available",
      value: inventory.total_in_stock ?? 0,
      subtitle: "Units currently in stock",
      icon: Package,
    },
    {
      title: "Units Sold",
      value: sales.total_units_sold ?? 0,
      subtitle: period === "today" ? "Units sold today" : "Units sold this month",
      icon: ShoppingCart,
    },
    {
      title: "Total Sales",
      value: formatCurrency(sales.total_sales_amount),
      subtitle: \`\${sales.total_sales ?? 0} sales \${period === "today" ? "today" : "this month"}\`,
      icon: DollarSign,
    },
    {
      title: "Outstanding Debt",
      value: formatCurrency(credits.total_outstanding_debt),
      subtitle: \`\${credits.active_credits ?? 0} active credits\`,
      icon: CreditCard,
    },
  ];`
);

// 4. Add Period Selector above cards
code = code.replace(
  `  return (
    <div className="dashboard-page">
      <section className="dashboard-cards">`,
  `  return (
    <div className="dashboard-page">
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", backgroundColor: "#fff", padding: "6px 12px", borderRadius: "8px", border: "1px solid #e5e7eb" }}>
          <Calendar size={16} color="#6b7280" />
          <select 
            value={period} 
            onChange={(e) => setPeriod(e.target.value)}
            style={{ border: "none", outline: "none", background: "transparent", fontWeight: "500", color: "#374151", cursor: "pointer" }}
          >
            <option value="today">Today</option>
            <option value="month">This Month</option>
            <option value="all">All Time</option>
          </select>
        </div>
      </div>
      <section className="dashboard-cards">`
);

fs.writeFileSync('src/pages/Dashboard.jsx', code);
