import { useTranslation } from "react-i18next";
import { toLatinDigits } from "../utils/numbers";
import {
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  CreditCard,
  Search,
  Eye,
  WalletCards,
  AlertTriangle,
  Clock3,
  Package,
  UserRound,
  CalendarDays,
  X,
  Banknote,
} from "lucide-react";
import {
  getCredits,
  getUpcomingCredits,
  getOverdueCredits,
  getCompletedCredits,
} from "../api/credits";
import {
  getPaymentsByCredit,
  recordPayment,
} from "../api/payments";
function getToday() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(
    now.getMonth() + 1
  ).padStart(2, "0");
  const day = String(
    now.getDate()
  ).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
function Credits() {
  const { t } = useTranslation();
  const [credits, setCredits] =
    useState([]);
  const [upcoming, setUpcoming] =
    useState([]);
  const [overdue, setOverdue] =
    useState([]);
  const [completed, setCompleted] =
    useState([]);
  const [search, setSearch] =
    useState("");
  const [filter, setFilter] =
    useState("all");
  const [loading, setLoading] =
    useState(true);
  const [error, setError] =
    useState("");
  const [
    selectedCredit,
    setSelectedCredit,
  ] = useState(null);
  const [
    detailModalOpen,
    setDetailModalOpen,
  ] = useState(false);
  const [
    paymentModalOpen,
    setPaymentModalOpen,
  ] = useState(false);
  const [payments, setPayments] =
    useState([]);
  const [
    paymentsLoading,
    setPaymentsLoading,
  ] = useState(false);
  const [paymentForm, setPaymentForm] =
    useState({
      amount: "",
      payment_date: getToday(),
    });
  const [
    paymentError,
    setPaymentError,
  ] = useState("");
  const [saving, setSaving] =
    useState(false);
  useEffect(() => {
    loadPage();
  }, []);
  async function loadPage() {
    try {
      setLoading(true);
      setError("");
      const [
        allData,
        upcomingData,
        overdueData,
        completedData,
      ] = await Promise.all([
        getCredits(),
        getUpcomingCredits(7),
        getOverdueCredits(),
        getCompletedCredits(),
      ]);
      setCredits(allData);
      setUpcoming(upcomingData);
      setOverdue(overdueData);
      setCompleted(completedData);
    } catch {
      setError(
        "Could not load credit information."
      );
    } finally {
      setLoading(false);
    }
  }
  const activeCredits =
    useMemo(() => {
      return credits.filter(
        (credit) =>
          Number(
            credit.remaining_debt
          ) > 0 &&
          credit.status !==
            "overdue"
      );
    }, [credits]);
  const currentList =
    useMemo(() => {
      switch (filter) {
        case "active":
          return activeCredits;
        case "upcoming":
          return upcoming;
        case "overdue":
          return overdue;
        case "completed":
          return completed;
        default:
          return credits;
      }
    }, [
      filter,
      credits,
      activeCredits,
      upcoming,
      overdue,
      completed,
    ]);
  const filteredCredits =
    useMemo(() => {
      const value =
        search.toLowerCase().trim();
      if (!value) {
        return currentList;
      }
      return currentList.filter(
        (credit) => {
          const customer =
            credit.customer?.name ??
            "";
          const phone =
            credit.customer
              ?.phone_number ??
            "";
          const appliance =
            credit.sale
              ?.appliance
              ?.name ??
            "";
          return (
            customer
              .toLowerCase()
              .includes(value) ||
            phone
              .toLowerCase()
              .includes(value) ||
            appliance
              .toLowerCase()
              .includes(value) ||
            String(credit.id)
              .includes(value)
          );
        }
      );
    }, [
      currentList,
      search,
    ]);
  const totalOutstandingUSD =
    credits.reduce((total, credit) => {
      if (credit.currency !== "USD") return total;
      return total + Number(credit.remaining_debt ?? 0);
    }, 0);
  const totalOutstandingIQD =
    credits.reduce((total, credit) => {
      if (credit.currency !== "IQD") return total;
      return total + Number(credit.remaining_debt ?? 0);
    }, 0);
  async function openDetails(
    credit
  ) {
    setSelectedCredit(credit);
    setDetailModalOpen(true);
    setPaymentsLoading(true);
    try {
      const data =
        await getPaymentsByCredit(
          credit.id
        );
      setPayments(data);
    } catch {
      setPayments([]);
    } finally {
      setPaymentsLoading(false);
    }
  }
  function closeDetails() {
    setDetailModalOpen(false);
    setSelectedCredit(null);
    setPayments([]);
  }
  function openPaymentModal(
    credit
  ) {
    setSelectedCredit(credit);
    setPaymentForm({
      amount:
        Math.min(
          Number(
            credit.installment_amount ??
              0
          ),
          Number(
            credit.remaining_debt ??
              0
          )
        ) || "",
      payment_date:
        getToday(),
    });
    setPaymentError("");
    setPaymentModalOpen(true);
  }
  function closePaymentModal() {
    if (saving) return;
    setPaymentModalOpen(false);
    setPaymentError("");
  }
  async function handlePayment(
    event
  ) {
    event.preventDefault();
    const amount =
      Number(
        paymentForm.amount
      );
    if (amount <= 0) {
      setPaymentError(
        "Payment must be greater than zero."
      );
      return;
    }
    if (
      amount >
      Number(
        selectedCredit.remaining_debt
      )
    ) {
      setPaymentError(
        "Payment cannot be greater than the remaining debt."
      );
      return;
    }
    try {
      setSaving(true);
      setPaymentError("");
      await recordPayment(
        selectedCredit.id,
        {
          amount,
          payment_date:
            paymentForm.payment_date,
        }
      );
      await loadPage();
      setPaymentModalOpen(false);
      if (detailModalOpen) {
        const updatedPayments =
          await getPaymentsByCredit(
            selectedCredit.id
          );
        setPayments(
          updatedPayments
        );
      }
    } catch (err) {
      setPaymentError(
        getApiError(
          err,
          "Could not record payment."
        )
      );
    } finally {
      setSaving(false);
    }
  }
  return (
    <div className="credits-page">
      <div className="page-toolbar">
        <div>
          <h2>{t("credits.title")}</h2>
          <p>
            {t("credits.subtitle")}
          </p>
        </div>
      </div>
      <section className="credits-summary">
        <CreditSummaryCard
          icon={
            <CreditCard
              size={20}
            />
          }
          title={t("credits.totalCredits")}
          value={credits.length}
        />
        <CreditSummaryCard
          icon={<WalletCards size={20} />}
          title={t("credits.outstandingDebtUSD", "Outstanding Debt ($)")}
          value={formatCurrency(totalOutstandingUSD, "USD")}
        />
        <CreditSummaryCard
          icon={<WalletCards size={20} />}
          title={t("credits.outstandingDebtIQD", "Outstanding Debt (IQD)")}
          value={Math.round(totalOutstandingIQD).toLocaleString("en-US") + " IQD"}
        />
        <CreditSummaryCard
          icon={
            <Clock3 size={20} />
          }
          title={t("credits.upcoming")}
          value={upcoming.length}
        />
        <CreditSummaryCard
          icon={
            <AlertTriangle
              size={20}
            />
          }
          title={t("credits.overdue")}
          value={overdue.length}
        />
      </section>
      <div className="content-card">
        <div className="credits-controls">
          <div className="credit-tabs">
            <CreditTab
              label={t("credits.tabs.all")}
              value="all"
              selected={filter}
              count={credits.length}
              onClick={setFilter}
            />
            <CreditTab
              label={t("credits.tabs.active")}
              value="active"
              selected={filter}
              count={
                activeCredits.length
              }
              onClick={setFilter}
            />
            <CreditTab
              label={t("credits.tabs.upcoming")}
              value="upcoming"
              selected={filter}
              count={upcoming.length}
              onClick={setFilter}
            />
            <CreditTab
              label={t("credits.tabs.overdue")}
              value="overdue"
              selected={filter}
              count={overdue.length}
              onClick={setFilter}
            />
            <CreditTab
              label={t("credits.tabs.completed")}
              value="completed"
              selected={filter}
              count={completed.length}
              onClick={setFilter}
            />
          </div>
          <div className="table-search credits-search">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search customer, appliance or phone..."
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
            />
          </div>
        </div>
        {loading ? (
          <div className="table-state">
            {t("credits.loading")}
          </div>
        ) : error ? (
          <div className="table-state table-error">
            <p>{error}</p>
            <button
              className="secondary-button"
              onClick={loadPage}
            >
              Try Again
            </button>
          </div>
        ) : filteredCredits.length ===
          0 ? (
          <div className="empty-appliances">
            <div className="empty-icon">
              <CreditCard
                size={28}
              />
            </div>
            <h3>
              No credit accounts
            </h3>
            <p>
              No credits match this
              filter.
            </p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="data-table credit-table">
              <thead>
                <tr>
                  <th>{t("credits.col.customer")}</th>
                  <th>{t("credits.col.appliance")}</th>
                  <th>{t("credits.col.total")}</th>
                  <th>{t("credits.col.remaining")}</th>
                  <th>{t("credits.col.installment")}</th>
                  <th>{t("credits.col.progress")}</th>
                  <th>{t("credits.col.nextDue")}</th>
                  <th>{t("credits.col.status")}</th>
                  <th>{t("credits.col.actions")}</th>
                </tr>
              </thead>
              <tbody>
                {filteredCredits.map(
                  (credit) => {
                    const total =
                      Number(
                        credit.total_amount ??
                          0
                      );
                    const remaining =
                      Number(
                        credit.remaining_debt ??
                          0
                      );
                    const paid =
                      Math.max(
                        0,
                        total -
                          remaining
                      );
                    const percentage =
                      total > 0
                        ? Math.min(
                            100,
                            (paid /
                              total) *
                              100
                          )
                        : 0;
                    return (
                      <tr key={credit.id}>
                        <td>
                          <div className="credit-customer-cell">
                            <div className="customer-avatar">
                              {getInitials(
                                credit
                                  .customer
                                  ?.name
                              )}
                            </div>
                            <div>
                              <strong>
                                {credit
                                  .customer
                                  ?.name ??
                                  "Unknown"}
                              </strong>
                              <span>
                                {credit
                                  .customer
                                  ?.phone_number ??
                                  ""}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="credit-product-cell">
                            <Package
                              size={15}
                            />
                            <span>
                              {credit.sale
                                ?.appliance
                                ?.name ??
                                "Unknown"}
                            </span>
                          </div>
                        </td>
                        <td>
                          {formatCurrency(
                            total, credit.currency
                          )}
                        </td>
                        <td>
                          <strong className="credit-remaining">
                            {formatCurrency(
                              remaining, credit.currency
                            )}
                          </strong>
                        </td>
                        <td>
                          {formatCurrency(
                            credit.installment_amount, credit.currency
                          )}
                        </td>
                        <td>
                          <div className="credit-progress">
                            <div className="credit-progress-track">
                              <div
                                className="credit-progress-fill"
                                style={{
                                  width:
                                    `${percentage}%`,
                                }}
                              />
                            </div>
                            <span>
                              {Math.round(
                                percentage
                              )}
                              %
                            </span>
                          </div>
                        </td>
                        <td>
                          <div className="due-date-cell">
                            <CalendarDays
                              size={13}
                            />
                            {formatDate(
                              credit.next_due_date
                            )}
                          </div>
                        </td>
                        <td>
                          <CreditStatus
                            credit={
                              credit
                            }
                          />
                        </td>
                        <td>
                          <div className="credit-actions">
                            <button
                              className="icon-button"
                              title="View"
                              onClick={() =>
                                openDetails(
                                  credit
                                )
                              }
                            >
                              <Eye
                                size={16}
                              />
                            </button>
                            {remaining >
                              0 && (
                              <button
                                className="record-payment-button"
                                onClick={() =>
                                  openPaymentModal(
                                    credit
                                  )
                                }
                              >
                                <Banknote
                                  size={14}
                                />
                                {t("credits.pay", "Pay")}
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  }
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {/* CREDIT DETAILS */}
      {detailModalOpen &&
        selectedCredit && (
          <div
            className="modal-backdrop"
            onMouseDown={
              closeDetails
            }
          >
            <div
              className="credit-detail-modal"
              onMouseDown={(event) =>
                event.stopPropagation()
              }
            >
              <div className="modal-header">
                <div>
                  <h2>
                    Credit #
                    {
                      selectedCredit.id
                    }
                  </h2>
                  <p>
                    Installment agreement
                    details.
                  </p>
                </div>
                <button
                  className="modal-close"
                  onClick={
                    closeDetails
                  }
                >
                  <X size={20} />
                </button>
              </div>
              <div className="credit-detail-body">
                <div className="credit-detail-person">
                  <div className="large-customer-avatar">
                    {getInitials(
                      selectedCredit
                        .customer
                        ?.name
                    )}
                  </div>
                  <div>
                    <h3>
                      {selectedCredit
                        .customer
                        ?.name ??
                        "Unknown"}
                    </h3>
                    <span>
                      <UserRound
                        size={13}
                      />
                      {selectedCredit
                        .customer
                        ?.phone_number ??
                        "-"}
                    </span>
                  </div>
                  <CreditStatus
                    credit={
                      selectedCredit
                    }
                  />
                </div>
                <div className="credit-detail-product">
                  <Package
                    size={20}
                  />
                  <div>
                    <span>
                      Appliance
                    </span>
                    <strong>
                      {selectedCredit
                        .sale
                        ?.appliance
                        ?.name ??
                        "Unknown"}
                    </strong>
                  </div>
                </div>
                <div className="credit-detail-grid">
                  <DetailValue
                    title={t("credits.col.total", "Total Amount")}
                    value={
                      formatCurrency(
                        selectedCredit.total_amount, selectedCredit.currency)
                    }
                  />
                  <DetailValue
                    title={t("sales.form.downPayment", "Down Payment")}
                    value={
                      formatCurrency(
                        selectedCredit.down_payment, selectedCredit.currency)
                    }
                  />
                  <DetailValue
                    title={t("credits.outstandingDebt", "Remaining Debt")}
                    value={
                      formatCurrency(
                        selectedCredit.remaining_debt, selectedCredit.currency)
                    }
                    danger
                  />
                  <DetailValue
                    title={t("credits.col.installment", "Installment")}
                    value={
                      formatCurrency(
                        selectedCredit.installment_amount, selectedCredit.currency)
                    }
                  />
                  <DetailValue
                    title={t("credits.col.progress", "Payments Made")}
                    value={
                      `${selectedCredit.payments_made ?? 0} / ${selectedCredit.number_of_payments ?? 0}`
                    }
                  />
                  <DetailValue
                    title={t("credits.col.nextDue", "Next Due")}
                    value={
                      formatDate(
                        selectedCredit.next_due_date
                      )
                    }
                  />
                </div>
                <div className="credit-details-actions">
                  {Number(
                    selectedCredit.remaining_debt
                  ) > 0 && (
                    <button
                      className="primary-action-button"
                      onClick={() => {
                        setDetailModalOpen(
                          false
                        );
                        openPaymentModal(
                          selectedCredit
                        );
                      }}
                    >
                      <Banknote
                        size={16}
                      />{t("credits.form.recordPayment")}</button>
                  )}
                </div>
                <div className="profile-section-header credit-payment-heading">
                  <h3>
                    Payment History
                  </h3>
                </div>
                {paymentsLoading ? (
                  <div className="profile-empty">
                    Loading payments...
                  </div>
                ) : payments.length ===
                  0 ? (
                  <div className="profile-empty">
                    No payments recorded.
                  </div>
                ) : (
                  <div className="credit-payment-history">
                    {payments.map(
                      (payment) => (
                        <div
                          className="credit-payment-row"
                          key={payment.id}
                          style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
                        >
                          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            <div className="payment-history-icon">
                              <Banknote size={16} />
                            </div>
                            <div>
                              <strong>{formatCurrency(payment.amount)}</strong>
                              <span>Payment #{payment.id}</span>
                            </div>
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            <div className="payment-history-date">
                              <CalendarDays size={13} />
                              {formatDate(payment.payment_date)}
                            </div>
                            <button
                              className="secondary-button"
                              style={{ padding: "4px 8px", fontSize: "12px", height: "fit-content" }}
                              onClick={(e) => { e.stopPropagation(); window.open(`/receipt/payment/${payment.id}`, "_blank"); }}
                            >
                              {t("receipt.print", "Print")}
                            </button>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      {/* RECORD PAYMENT */}
      {paymentModalOpen &&
        selectedCredit && (
          <div
            className="modal-backdrop"
            onMouseDown={
              closePaymentModal
            }
          >
            <div
              className="app-modal payment-entry-modal"
              onMouseDown={(event) =>
                event.stopPropagation()
              }
            >
              <div className="modal-header">
                <div>
                  <h2>{t("credits.form.recordPayment")}</h2>
                  <p>
                    Credit #
                    {
                      selectedCredit.id
                    }{" "}
                    —{" "}
                    {selectedCredit
                      .customer
                      ?.name}
                  </p>
                </div>
                <button
                  className="modal-close"
                  onClick={
                    closePaymentModal
                  }
                >
                  <X size={20} />
                </button>
              </div>
              <form
                className="appliance-form"
                onSubmit={
                  handlePayment
                }
              >
                <div className="payment-credit-summary">
                  <div>
                    <span>
                      {t("credits.form.remaining")}
                    </span>
                    <strong>
                      {formatCurrency(
                        selectedCredit.remaining_debt, selectedCredit.currency
                      )}
                    </strong>
                  </div>
                  <div>
                    <span>{t("credits.form.expected")}</span>
                    <strong>
                      {formatCurrency(
                        Math.min(
                          Number(
                            selectedCredit.installment_amount
                          ),
                          Number(
                            selectedCredit.remaining_debt
                          )
                        ), selectedCredit.currency
                      )}
                    </strong>
                  </div>
                </div>
                {paymentError && (
                  <div className="form-general-error">
                    {paymentError}
                  </div>
                )}
                <div className="form-field">
                  <label>{t("credits.form.paymentAmount")}</label>
                  <input
                    required
                    type="text"
                    inputMode="decimal"
                    min="0.01"
                    step="0.01"
                    value={
                      paymentForm.amount
                    }
                    onChange={(event) =>
                      setPaymentForm(
                        (current) => ({
                          ...current,
                          amount:
                            toLatinDigits(event.target
                              .value),
                        })
                      )
                    }
                  />
                </div>
                <div className="form-field">
                  <label>{t("credits.form.paymentDate")}</label>
                  <input
                    required
                    type="date"
                    value={
                      paymentForm.payment_date
                    }
                    onChange={(event) =>
                      setPaymentForm(
                        (current) => ({
                          ...current,
                          payment_date:
                            event.target
                              .value,
                        })
                      )
                    }
                  />
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="secondary-button"
                    onClick={
                      closePaymentModal
                    }
                  >{t("credits.form.cancel")}</button>
                  <button
                    type="submit"
                    className="primary-action-button"
                    disabled={saving}
                  >
                    {saving
                      ? t("credits.form.recording", "Recording...")
                      : t("credits.form.recordPayment", "Record Payment")}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
    </div>
  );
}
function CreditSummaryCard({
  icon,
  title,
  value,
}) {
  return (
    <div className="inventory-summary-card">
      <div className="inventory-summary-icon">
        {icon}
      </div>
      <div>
        <span>{title}</span>
        <strong>
          {value}
        </strong>
      </div>
    </div>
  );
}
function CreditTab({
  label,
  value,
  selected,
  count,
  onClick,
}) {
  return (
    <button
      className={
        selected === value
          ? "credit-tab active"
          : "credit-tab"
      }
      onClick={() =>
        onClick(value)
      }
    >
      {label}
      <span>{count}</span>
    </button>
  );
}
function CreditStatus({
  credit,
}) {
  const { t } = useTranslation();
  const remaining =
    Number(
      credit.remaining_debt ??
        0
    );
  let status =
    credit.status ?? "active";
  if (remaining <= 0) {
    status = "completed";
  }
  return (
    <span
      className={`credit-status ${status}`}
    >
      {t(`credits.status.${status}`, status)}
    </span>
  );
}
function DetailValue({
  title,
  value,
  danger = false,
}) {
  return (
    <div className="credit-detail-value">
      <span>{title}</span>
      <strong
        className={
          danger
            ? "debt-value"
            : ""
        }
      >
        {value}
      </strong>
    </div>
  );
}
function formatCurrency(value, currency = "USD") {
  if (currency === "IQD") {
    return Math.round(Number(value ?? 0)).toLocaleString("en-US") + " IQD";
  }
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(Number(value ?? 0));
}
function formatDate(value) {
  if (!value) {
    return "-";
  }
  const clean =
    String(value).slice(
      0,
      10
    );
  const [
    year,
    month,
    day,
  ] = clean
    .split("-")
    .map(Number);
  if (
    !year ||
    !month ||
    !day
  ) {
    return clean;
  }
  return new Date(
    year,
    month - 1,
    day
  ).toLocaleDateString(
    "en-US",
    {
      year: "numeric",
      month: "short",
      day: "numeric",
    }
  );
}
function getInitials(name) {
  if (!name) {
    return "?";
  }
  return name
    .split(" ")
    .slice(0, 2)
    .map(
      (word) =>
        word[0]
    )
    .join("")
    .toUpperCase();
}
function getApiError(
  error,
  fallback
) {
  if (error?.errors) {
    const first =
      Object.values(
        error.errors
      )[0];
    if (
      Array.isArray(first)
    ) {
      return first[0];
    }
  }
  if (error?.message) {
    return error.message;
  }
  return fallback;
}
export default Credits;