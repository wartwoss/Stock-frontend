import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getSale } from "../api/sales";
import { getPayment } from "../api/payments";
import { getCredits } from "../api/credits";

const STORE_LOCATION =
  "سلێمانی - جادەی شەهیدان - فەرعی کارەباکە";
const SERVICE_PHONE = "0751 052 8075";

export default function Receipt() {
  const { type, id } = useParams();
  const { t } = useTranslation();
  const [data, setData] = useState(null);
  const [creditRecord, setCreditRecord] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadData() {
      try {
        if (type === "sale") {
          const sale = await getSale(id);
          if (sale) {
            // A credit sale keeps its down payment / remaining debt on the
            // related credit agreement, so look it up for the bill layout.
            // This must finish before `data` is set: setting data first would
            // arm the auto-print timer and print the bill before the down
            // payment / remaining amount rows are available.
            let credit = null;
            if (sale.payment_type === "credit") {
              try {
                const credits = await getCredits();
                credit =
                  credits.find(
                    (item) =>
                      String(item.sale_id) ===
                      String(sale.id)
                  ) || null;
              } catch {
                credit = null;
              }
            }
            setCreditRecord(credit);
            setData(sale);
          } else setError("Sale not found");
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
  const isCreditSale = isSale && data.payment_type === "credit";
  const credit = isSale ? null : data.credit;
  const sale = isSale ? data : data.credit?.sale;
  const dateStr = isSale ? data.sale_date : data.payment_date;
  const currency = isSale
    ? data.currency || "USD"
    : credit?.currency || data.currency || "USD";
  const downPayment = isSale
    ? Number(creditRecord?.down_payment ?? 0)
    : Number(credit?.down_payment ?? 0);
  const amount = isSale
    ? isCreditSale && creditRecord
      ? downPayment
      : Number(data.total_price ?? 0)
    : Number(data.amount ?? 0);

  // For sale: data.appliance. For payment: data.credit.sale.appliance
  const appliance = isSale
    ? data.appliance
    : data.credit?.sale?.appliance ||
      data.credit?.appliance;
  // Identify the item the same way the appliance picker does:
  // (category) - (brand) - name
  const itemLabel =
    [
      appliance?.category,
      appliance?.brand,
      appliance?.name,
    ]
      .filter(Boolean)
      .join(" - ") || "-";

  const customer = isSale
    ? data.customer
    : data.credit?.customer;

  const customerName =
    customer?.name ||
    t("sales.walkIn", "Walk-in Customer");
  const customerPhone = customer?.phone_number || "-";

  // Description / Warranty Note
  const description = customer?.description || "";
  const warrantyMonths = Number(sale?.warranty_months ?? 0);

  // Bill breakdown: a credit agreement is split between down payment and
  // remaining debt, and a bill payment reduces that remaining debt further.
  const originalPrice = isSale
    ? Number(data.total_price ?? 0)
    : Number(credit?.total_amount ?? 0);
  const paidNow = isSale ? downPayment : Number(data.amount ?? 0);
  const remainingAfter = isSale
    ? Number(
        creditRecord?.remaining_debt ??
          (originalPrice - downPayment)
      )
    : Number(credit?.remaining_debt ?? 0);
  // A monthly payment bill shows only what was paid now and what is still
  // owed; the balance before this payment is deliberately left off.
  const breakdownRows = isSale
    ? creditRecord
      ? [
          {
            key: "original",
            label: t("receipt.originalPrice", "Original Price"),
            value: originalPrice,
          },
          {
            key: "down",
            label: t("print.field.downPayment", "Down Payment"),
            value: downPayment,
          },
          {
            key: "remaining",
            label: t(
              "receipt.remainingAmount",
              "Remaining Amount"
            ),
            value: remainingAfter,
          },
        ]
      : []
    : [
        {
          key: "paid",
          label: t("receipt.paidNow", "Paid Now"),
          value: paidNow,
          accent: true,
        },
        {
          key: "next",
          label: t("receipt.remainingNext", "Remaining for Next Time"),
          value: remainingAfter,
        },
      ];

  return (
    <div className="receipt-container receipt-a4">
      <div className="receipt-a4-header">
        <div className="receipt-a4-store">
          <h1 className="receipt-a4-store-name" dir="rtl">پێشانگای ئانی</h1>
          <p className="receipt-a4-contact" dir="ltr">
            <span className="receipt-a4-phone">0770 156 3081</span>
            <span className="receipt-a4-contact-sep">|</span>
            <span className="receipt-a4-phone receipt-a4-phone--service">
              {SERVICE_PHONE}
            </span>
          </p>
          <p className="receipt-a4-location" dir="rtl">{STORE_LOCATION}</p>
        </div>
        <div className="receipt-a4-title-block">
          <h2 className="receipt-title">
            {isSale
              ? t("receipt.saleReceipt", "Sale Receipt")
              : t("receipt.paymentReceipt", "Payment Receipt")}
          </h2>
          <p className="receipt-a4-doc-no">
            {t("receipt.receiptNo", "Receipt #")}: {id}
          </p>
        </div>
      </div>

      <div className="receipt-a4-parties">
        <div className="receipt-a4-party">
          <span className="receipt-a4-label">
            {t("receipt.customer", "Customer")}
          </span>
          <strong>{customerName}</strong>
          <span dir="ltr">{customerPhone}</span>
        </div>
        <div className="receipt-a4-party">
          <span className="receipt-a4-label">
            {isSale
              ? t("receipt.date", "Date")
              : t("print.field.paymentDate", "Payment Date")}
          </span>
          <strong>
            {dateStr
              ? new Date(dateStr).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })
              : "-"}
          </strong>
          {!isSale && credit && (
            <span>
              {t("print.field.creditId", "Credit Account")}: #
              {credit.id}
            </span>
          )}
        </div>
      </div>

      <div className="receipt-details">
        <div className="detail-item detail-item--wide">
          <span className="detail-label">{t("receipt.item", "Item")}:</span>
          <span className="detail-value">{itemLabel}</span>
        </div>

        {isSale && (
          <div className="detail-item detail-item--wide">
            <span className="detail-label">
              {t("sales.col.quantity", "Quantity")}:
            </span>
            <span className="detail-value">{data.quantity}</span>
          </div>
        )}

        {!isSale && credit && (
          <div className="detail-item detail-item--wide">
            <span className="detail-label">
              {t("print.field.quantity", "Quantity")}:
            </span>
            <span className="detail-value">
              {credit.sale?.quantity ?? "-"}
            </span>
          </div>
        )}
      </div>

      {breakdownRows.length > 0 && (
        <div className="receipt-a4-breakdown">
          <h3 className="receipt-a4-breakdown-title">
            {isSale
              ? t("receipt.saleBreakdown", "Purchase Breakdown")
              : t("receipt.paymentBreakdown", "Payment Breakdown")}
          </h3>
          {breakdownRows.map((row) => (
            <div
              key={row.key}
              className={
                row.accent
                  ? "receipt-a4-breakdown-row receipt-a4-breakdown-row--accent"
                  : "receipt-a4-breakdown-row"
              }
            >
              <span>{row.label}</span>
              <strong>{formatCurrency(row.value, currency)}</strong>
            </div>
          ))}
        </div>
      )}

      {/* The note and the warranty belong to the sale itself, so they print on
          the cash bill and on the credit first bill only - not repeated on
          every monthly payment bill. Each gets its own box. */}
      {isSale && description && (
        <div className="receipt-a4-notes">
          <h3 className="receipt-a4-notes-title">
            {t("receipt.description", "Description")}
          </h3>
          <p>{description}</p>
        </div>
      )}

      {isSale && warrantyMonths > 0 && (
        <div className="receipt-a4-warranty">
          <span className="receipt-a4-warranty-label">
            {t("print.field.warranty", "Warranty")}
          </span>
          <strong className="receipt-a4-warranty-value">
            {warrantyMonths}{" "}
            {t("receipt.months", "months")}
          </strong>
        </div>
      )}

      {/* On a payment bill the "Paid Now" row already carries the amount, so
          the summary box would only repeat it. Sales keep it. */}
      {isSale && (
        <div className="receipt-total">
          <span>
            {t("receipt.amountPaid", "Amount Paid")}
          </span>
          <strong>{formatCurrency(amount, currency)}</strong>
        </div>
      )}

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
