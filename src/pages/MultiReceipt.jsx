import { useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getSale } from "../api/sales";
import { getCredit, getCredits } from "../api/credits";

const STORE_LOCATION =
  "سلێمانی - جادەی شەهیدان - فەرعی کارەباکە";
const SERVICE_PHONE = "0751 052 8075";

export default function MultiReceipt() {
  const { type } = useParams();
  const [searchParams] = useSearchParams();
  const { t } = useTranslation();
  const [records, setRecords] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [agreements, setAgreements] = useState(null);

  const ids = useMemo(() => {
    const raw = searchParams.get("ids") || "";
    return raw
      .split(",")
      .map((value) => value.trim())
      .filter((value) => value !== "" && /^\d+$/.test(value));
  }, [searchParams]);

  const isSale = type === "sale";

  useEffect(() => {
    let cancelled = false;

    async function loadRecords() {
      setLoading(true);
      setError("");

      if (ids.length === 0) {
        if (!cancelled) {
          setError(t("printsel.noRecords", "No records were selected."));
          setLoading(false);
        }
        return;
      }

      const results = await Promise.all(
        ids.map(async (id) => {
          try {
            if (isSale) return await getSale(id);
            return await getCredit(id);
          } catch {
            return null;
          }
        })
      );
      const found = results.filter(Boolean);

      if (cancelled) return;

      if (found.length === 0) {
        setError(
          t("printsel.notFound", "None of the selected records could be loaded.")
        );
        setLoading(false);
        return;
      }

      // Safety rule: a combined receipt may only ever cover one customer.
      const owners = new Set(
        found.map((record) => String(record.customer_id ?? ""))
      );
      if (owners.size > 1) {
        setError(
          t(
            "printsel.mixedCustomers",
            "Selected records belong to different customers. Select records of a single customer only."
          )
        );
        setLoading(false);
        return;
      }

      setRecords(found);
      setLoading(false);
    }

    loadRecords();

    return () => {
      cancelled = true;
    };
  }, [ids, isSale, t]);

  // A credit sale keeps its down payment / remaining debt on the related
  // credit agreement, so pull them in before the receipt is printed.
  const needsAgreements =
    isSale && records.some((record) => record.payment_type === "credit");

  useEffect(() => {
    if (!needsAgreements) return;
    if (loading || error || records.length === 0) return;

    let cancelled = false;
    (async () => {
      try {
        const credits = await getCredits();
        if (cancelled) return;
        const map = {};
        records.forEach((record) => {
          const match = credits.find(
            (credit) =>
              String(credit.sale_id) === String(record.id)
          );
          if (match) map[String(record.id)] = match;
        });
        setAgreements(map);
      } catch {
        if (!cancelled) setAgreements({});
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [loading, error, records, needsAgreements]);

  const agreementsReady = !needsAgreements || agreements !== null;

  useEffect(() => {
    if (loading || error || !agreementsReady || records.length === 0)
      return;
    const timer = setTimeout(() => {
      window.print();
    }, 500);
    return () => clearTimeout(timer);
  }, [loading, error, records, agreementsReady]);

  if (error) {
    return (
      <div style={{ padding: "40px", textAlign: "center" }}>
        <h2>{error}</h2>
        <button
          onClick={() => window.close()}
          className="primary-action-button"
          style={{ marginTop: "20px" }}
        >
          {t("print.close", "Close")}
        </button>
      </div>
    );
  }

  if (loading || records.length === 0) {
    return <div style={{ padding: "40px" }}>Loading receipt...</div>;
  }

  const first = records[0];
  const customer = first.customer || null;
  const customerName =
    customer?.name || t("print.field.noCustomer", "Walk-in Customer");
  const customerPhone = customer?.phone_number || "-";
  const description = customer?.description || "";

  const printDate = new Date();
  const lines = records.map((record) => buildLine(record, isSale, t));
  const buckets = buildBuckets(records, isSale, agreements ?? {});

  return (
    <div className="receipt-container receipt-a4 multi-receipt-container">
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
              ? t("printsel.combinedSale", "Combined Sale Receipt")
              : t("printsel.combinedCredit", "Combined Credit Receipt")}
          </h2>
          <p className="receipt-a4-doc-no" dir="ltr">
            {t("receipt.receiptNo", "Receipt #")}: #
            {records.map((record) => record.id).join(", #")}
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
            {t("printsel.printDate", "Print Date")}
          </span>
          <strong>{formatDate(printDate)}</strong>
          <span>
            {t("printsel.recordsCount", "Records")}: {records.length}
          </span>
        </div>
      </div>

      <table className="multi-receipt-table">
        <thead>
          <tr>
            <th>#</th>
            <th>{t("print.field.appliance", "Appliance")}</th>
            <th className="num">
              {t("print.field.quantity", "Quantity")}
            </th>
            <th className="num">
              {t("print.field.unitPrice", "Unit Price")}
            </th>
            <th className="num">
              {t("print.field.total", "Total Amount")}
            </th>
          </tr>
        </thead>
        <tbody>
          {lines.map((line) => (
            <tr key={line.id}>
              <td>{line.number}</td>
              <td>
                <div className="multi-receipt-item-name">
                  {line.name}
                </div>
                {line.subtitle && (
                  <div className="multi-receipt-item-sub">
                    {line.subtitle}
                  </div>
                )}
              </td>
              <td className="num">{line.quantity}</td>
              <td className="num">{line.unitPrice}</td>
              <td className="num">{line.total}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {buckets.map((bucket) =>
        bucket.creditCount > 0 ? (
          <div
            className="receipt-a4-breakdown"
            key={`breakdown-${bucket.currency}`}
          >
            <h3 className="receipt-a4-breakdown-title">
              {isSale
                ? t("receipt.saleBreakdown", "Purchase Breakdown")
                : t("printsel.creditBreakdown", "Credit Breakdown")}
              {` (${bucket.currency})`}
            </h3>
            <div className="receipt-a4-breakdown-row">
              <span>
                {t("print.field.downPayment", "Down Payment")}
              </span>
              <strong>
                {formatAmount(bucket.down, bucket.currency)}
              </strong>
            </div>
            <div className="receipt-a4-breakdown-row">
              <span>
                {t("print.field.remainingDebt", "Remaining Debt")}
              </span>
              <strong>
                {formatAmount(bucket.remaining, bucket.currency)}
              </strong>
            </div>
          </div>
        ) : (
          <div
            className="multi-receipt-totals"
            key={`total-${bucket.currency}`}
          >
            <div className="multi-receipt-total-row multi-receipt-total-row--grand">
              <span>
                {t("print.field.total", "Total Amount")} (
                {bucket.currency})
              </span>
              <strong>
                {formatAmount(bucket.total, bucket.currency)}
              </strong>
            </div>
          </div>
        )
      )}

      {(description || isSale) && (
        <div className="receipt-a4-notes">
          <h3 className="receipt-a4-notes-title">
            {t("receipt.description", "Description")}
          </h3>
          {description && <p>{description}</p>}
          {isSale && (
            <p>
              {t(
                "print.warrantyNote",
                "This warranty is provided by the store. Keep this receipt."
              )}
            </p>
          )}
        </div>
      )}

      <div className="receipt-footer">
        <p>{t("print.footer", "Thank you for your purchase")}</p>
      </div>

      <div className="receipt-actions no-print">
        <button
          onClick={() => window.print()}
          className="primary-action-button"
        >
          {t("print.print", "Print")}
        </button>
        <button
          onClick={() => window.close()}
          className="secondary-button"
          style={{ marginLeft: "10px" }}
        >
          {t("print.close", "Close")}
        </button>
      </div>
    </div>
  );
}

function buildLine(record, isSale, t) {
  const sale = isSale ? record : record.sale;
  const appliance = isSale ? record.appliance : record.sale?.appliance;
  const quantity = Number(sale?.quantity ?? 0);
  const unitPrice = Number(sale?.selling_price ?? 0);
  const currency = record.currency || sale?.currency || "USD";
  const total = isSale
    ? Number(record.total_price ?? 0)
    : Number(record.total_amount ?? 0);

  // The print date is shown once in the header, so no per-item date here.
  const subtitle = isSale
    ? `${t("sales.col.payment", "Payment")}: ${
        record.payment_type === "credit"
          ? t("print.type.creditPurchase", "Credit Agreement")
          : t("print.type.cashSale", "Cash Sale Receipt")
      }`
    : `${t("print.field.creditId", "Credit Account")}: #${record.id}`;

  return {
    id: record.id,
    number: record.id,
    // Same identification format as the single bills and the picker:
    // (category) - (brand) - name
    name:
      [
        appliance?.category,
        appliance?.brand,
        appliance?.name,
      ]
        .filter(Boolean)
        .join(" - ") ||
      t("print.field.appliance", "Appliance"),
    subtitle,
    quantity,
    unitPrice: formatAmount(unitPrice, currency),
    total: formatAmount(total, currency),
  };
}

function buildBuckets(records, isSale, agreementMap) {
  const map = new Map();
  records.forEach((record) => {
    const currency = record.currency || "USD";
    const agreement = isSale
      ? agreementMap[String(record.id)]
      : record;
    const bucket = map.get(currency) || {
      currency,
      total: 0,
      down: 0,
      remaining: 0,
      creditCount: 0,
    };
    bucket.total += Number(
      record.total_price ?? record.total_amount ?? 0
    );
    if (agreement) {
      bucket.down += Number(agreement.down_payment ?? 0);
      bucket.remaining += Number(agreement.remaining_debt ?? 0);
      bucket.creditCount += 1;
    }
    map.set(currency, bucket);
  });
  return Array.from(map.values());
}

function formatAmount(value, currency = "USD") {
  const amount = Number(value ?? 0);
  if (currency === "IQD") {
    return Math.round(amount).toLocaleString("en-US") + " IQD";
  }
  return (
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  );
}

function formatDate(value) {
  if (!value) return "-";
  if (value instanceof Date) {
    return value.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }
  const clean = String(value).slice(0, 10);
  const [year, month, day] = clean.split("-").map(Number);
  if (!year || !month || !day) return clean;
  return new Date(year, month - 1, day).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
