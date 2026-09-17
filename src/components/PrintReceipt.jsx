import { useTranslation } from "react-i18next";
import { Printer, X } from "lucide-react";
import "./PrintReceipt.css";

export default function PrintReceipt({ type, data, onClose }) {
  const { t } = useTranslation();
  const STORE_NAME = t("store.name");
  const STORE_PHONE = t("store.phone");
  const STORE_ADDRESS = t("store.address");

  function handlePrint() {
    window.print();
  }

  return (
    <>
      <div className="print-overlay no-print">
        <div className="print-action-bar">
          <button className="print-btn-print" onClick={handlePrint}>
            <Printer size={18} />
            {t("print.print")}
          </button>
          <button className="print-btn-close" onClick={onClose}>
            <X size={18} />
            {t("print.close")}
          </button>
        </div>
      </div>

      <div className="receipt-wrapper" dir="rtl">
        <div className="receipt-header">
          <h1 className="receipt-store-name">{STORE_NAME}</h1>
          {STORE_PHONE && <p className="receipt-store-info">{STORE_PHONE}</p>}
          {STORE_ADDRESS && <p className="receipt-store-info">{STORE_ADDRESS}</p>}
          <div className="receipt-divider" />
          <h2 className="receipt-type-title">
            {type === "cash_sale" && t("print.type.cashSale")}
            {type === "credit_purchase" && t("print.type.creditPurchase")}
            {type === "credit_payment" && t("print.type.creditPayment")}
          </h2>
        </div>

        {type === "cash_sale" && <CashSaleBody data={data} t={t} />}
        {type === "credit_purchase" && <CreditPurchaseBody data={data} t={t} />}
        {type === "credit_payment" && <CreditPaymentBody data={data} t={t} />}

        <div className="receipt-footer">
          <div className="receipt-divider" />
          <p className="receipt-footer-text">{t("print.footer")}</p>
          <p className="receipt-date-printed">
            {t("print.printedOn")}: {new Date().toLocaleDateString("en-GB")}
          </p>
        </div>
      </div>
    </>
  );
}

function CashSaleBody({ data, t }) {
  const { sale_date, appliance_name, appliance_brand, customer_name, quantity, selling_price, currency, warranty_months, storage_name } = data;
  const total = Number(selling_price) * Number(quantity);
  return (
    <div className="receipt-body">
      <ReceiptRow label={t("print.field.date")} value={sale_date} />
      <ReceiptRow label={t("print.field.customer")} value={customer_name || t("print.field.noCustomer")} />
      <div className="receipt-section-title">{t("print.section.product")}</div>
      <ReceiptRow label={t("print.field.appliance")} value={`${appliance_name || ""} ${appliance_brand || ""}`.trim()} />
      <ReceiptRow label={t("print.field.storage")} value={storage_name} />
      <ReceiptRow label={t("print.field.quantity")} value={quantity} />
      <ReceiptRow label={t("print.field.unitPrice")} value={formatAmount(selling_price, currency)} bold />
      <ReceiptRow label={t("print.field.total")} value={formatAmount(total, currency)} bold />
      {Number(warranty_months) > 0 && (
        <>
          <div className="receipt-divider-light" />
          <ReceiptRow label={t("print.field.warranty")} value={`${warranty_months} ${t("print.field.months")}`} highlight />
          <p className="receipt-warranty-note">{t("print.warrantyNote")}</p>
        </>
      )}
    </div>
  );
}

function CreditPurchaseBody({ data, t }) {
  const { sale_date, appliance_name, appliance_brand, customer_name, quantity, selling_price, currency, warranty_months, down_payment, number_of_payments, installment_amount, first_due_date, storage_name } = data;
  const total = Number(selling_price) * Number(quantity);
  const remaining = total - Number(down_payment || 0);
  const monthly = installment_amount || (Number(number_of_payments) > 0 ? remaining / Number(number_of_payments) : 0);
  return (
    <div className="receipt-body">
      <ReceiptRow label={t("print.field.date")} value={sale_date} />
      <ReceiptRow label={t("print.field.customer")} value={customer_name} />
      <div className="receipt-section-title">{t("print.section.product")}</div>
      <ReceiptRow label={t("print.field.appliance")} value={`${appliance_name || ""} ${appliance_brand || ""}`.trim()} />
      <ReceiptRow label={t("print.field.storage")} value={storage_name} />
      <ReceiptRow label={t("print.field.quantity")} value={quantity} />
      <ReceiptRow label={t("print.field.unitPrice")} value={formatAmount(selling_price, currency)} />
      <ReceiptRow label={t("print.field.total")} value={formatAmount(total, currency)} bold />
      <div className="receipt-section-title">{t("print.section.credit")}</div>
      <ReceiptRow label={t("print.field.downPayment")} value={formatAmount(down_payment || 0, currency)} />
      <ReceiptRow label={t("print.field.remainingDebt")} value={formatAmount(remaining, currency)} bold />
      <ReceiptRow label={t("print.field.numberOfPayments")} value={number_of_payments} />
      <ReceiptRow label={t("print.field.monthlyPayment")} value={formatAmount(monthly, currency)} bold highlight />
      {first_due_date && <ReceiptRow label={t("print.field.firstDueDate")} value={first_due_date} />}
      {Number(warranty_months) > 0 && (
        <>
          <div className="receipt-divider-light" />
          <ReceiptRow label={t("print.field.warranty")} value={`${warranty_months} ${t("print.field.months")}`} highlight />
          <p className="receipt-warranty-note">{t("print.warrantyNote")}</p>
        </>
      )}
    </div>
  );
}

function CreditPaymentBody({ data, t }) {
  const { customer_name, appliance_name, appliance_brand, payment_date, amount_paid, remaining_after, currency, credit_id } = data;
  const isPaidOff = Number(remaining_after) <= 0;
  return (
    <div className="receipt-body">
      <ReceiptRow label={t("print.field.paymentDate")} value={payment_date} />
      <ReceiptRow label={t("print.field.customer")} value={customer_name} />
      <ReceiptRow label={t("print.field.appliance")} value={`${appliance_name || ""} ${appliance_brand || ""}`.trim()} />
      <ReceiptRow label={t("print.field.creditId")} value={`#${credit_id}`} />
      <div className="receipt-divider-light" />
      <ReceiptRow label={t("print.field.amountPaid")} value={formatAmount(amount_paid, currency)} bold highlight />
      <ReceiptRow label={t("print.field.remainingDebt")} value={isPaidOff ? t("print.field.fullyPaid") : formatAmount(remaining_after, currency)} bold />
      {isPaidOff && <p className="receipt-paid-off">{t("print.creditPaidOff")}</p>}
    </div>
  );
}

function ReceiptRow({ label, value, bold = false, highlight = false }) {
  return (
    <div className={`receipt-row${bold ? " receipt-row--bold" : ""}${highlight ? " receipt-row--highlight" : ""}`}>
      <span className="receipt-row-label">{label}</span>
      <span className="receipt-row-value">{value ?? "\u2014"}</span>
    </div>
  );
}

function formatAmount(amount, currency = "USD") {
  const num = Number(amount) || 0;
  if (currency === "IQD") return `${num.toLocaleString("en-US")} \u062f.\u0639`;
  return `$${num.toFixed(2)}`;
}
