import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getSale } from "../api/sales";
import { getPayment } from "../api/payments";


export default function Receipt() {
  const { type, id } = useParams();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadData() {
      try {
        if (type === "sale") {
          const sale = await getSale(id);
          if (sale) setData(sale);
          else setError("Sale not found");
        } else if (type === "payment") {
          const payment = await getPayment(id);
          if (payment) setData(payment);
          else setError("Payment not found");
        } else {
          setError("Invalid receipt type");
        }
      } catch (err) {
        setError(err.message || "Failed to load receipt");
      }
    }
    loadData();
  }, [type, id]);

  useEffect(() => {
    if (data) {
      setTimeout(() => {
        window.print();
      }, 500); // Give time for rendering
    }
  }, [data]);

  function formatCurrency(value, currency = "USD") {
    if (currency === "IQD") {
      return Math.round(Number(value ?? 0)).toLocaleString("en-US") + " IQD";
    }
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(Number(value ?? 0));
  }

  if (error) {
    return (
      <div style={{ padding: "40px", textAlign: "center" }}>
        <h2>{error}</h2>
        <button onClick={() => window.close()} className="primary-action-button" style={{ marginTop: "20px" }}>
          Close Tab
        </button>
      </div>
    );
  }

  if (!data) return <div style={{ padding: "40px" }}>Loading receipt...</div>;

  const isSale = type === "sale";
  const dateStr = isSale ? data.sale_date : data.payment_date;
  const amount = isSale ? (data.down_payment > 0 && data.payment_type === 'credit' ? data.down_payment : data.total_price) : data.amount;
  const currency = data.currency || "USD";
  
  // For sale: data.appliance. For payment: data.credit.appliance
  const applianceName = isSale 
    ? data.appliance?.name 
    : data.credit?.appliance?.name;
    
  const customerName = isSale
    ? data.customer?.name || t("sales.walkIn", "Walk-in Customer")
    : data.credit?.customer?.name;

  return (
    <div className="receipt-container">
      <div className="receipt-header">
        <h1>پێشانگای ئانی</h1>
        <p className="receipt-phone" style={{ fontSize: "1.1em", fontWeight: "bold", margin: "5px 0" }}>0770 156 3081</p>
        <p className="receipt-title" style={{ marginTop: "10px" }}>
          {isSale ? t("receipt.saleReceipt", "Sale Receipt") : t("receipt.paymentReceipt", "Payment Receipt")}
        </p>
      </div>

      <div className="receipt-meta">
        <div className="meta-row">
          <span>{t("receipt.receiptNo", "Receipt #")}:</span>
          <strong>{id}</strong>
        </div>
        <div className="meta-row">
          <span>{t("receipt.date", "Date")}:</span>
          <strong>{dateStr ? new Date(dateStr).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) : "-"}</strong>
        </div>
        <div className="meta-row">
          <span>{t("receipt.customer", "Customer")}:</span>
          <strong>{customerName || "-"}</strong>
        </div>
      </div>

      <div className="receipt-details">
        <div className="detail-item">
          <span className="detail-label">{t("receipt.item", "Item")}:</span>
          <span className="detail-value">{applianceName || "-"}</span>
        </div>
        
        {isSale && (
          <div className="detail-item">
            <span className="detail-label">{t("sales.col.quantity", "Quantity")}:</span>
            <span className="detail-value">{data.quantity}</span>
          </div>
        )}

        {isSale && data.warranty_months && (
          <div className="detail-item">
            <span className="detail-label">{t("sales.col.warranty", "Warranty")}:</span>
            <span className="detail-value">{data.warranty_months} {t("receipt.months", "months")}</span>
          </div>
        )}
        
        {!isSale && data.notes && (
          <div className="detail-item">
            <span className="detail-label">{t("receipt.notes", "Notes")}:</span>
            <span className="detail-value">{data.notes}</span>
          </div>
        )}
      </div>

      <div className="receipt-total">
        <span>{t("receipt.amountPaid", "Amount Paid")}:</span>
        <strong>{formatCurrency(amount, currency)}</strong>
      </div>

      <div className="receipt-footer">
        <p>{t("receipt.thankYou", "Thank you for your business!")}</p>
      </div>

      <div className="receipt-actions no-print">
        <button onClick={() => window.print()} className="primary-action-button">
          {t("receipt.print", "Print")}
        </button>
        <button onClick={() => window.close()} className="secondary-button" style={{ marginLeft: "10px" }}>
          {t("receipt.close", "Close")}
        </button>
      </div>
    </div>
  );
}
