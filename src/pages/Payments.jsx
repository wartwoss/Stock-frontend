import {
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  WalletCards,
  Banknote,
  Search,
  Plus,
  Eye,
  CalendarDays,
  CreditCard,
  UserRound,
  Package,
  X,
  TrendingUp,
} from "lucide-react";
import {
  getPayments,
  recordPayment,
} from "../api/payments";
import {
  getCredits,
} from "../api/credits";
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
function getCurrentMonth() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(
    now.getMonth() + 1
  ).padStart(2, "0");
  return `${year}-${month}`;
}
function Payments() {
  const [payments, setPayments] =
    useState([]);
  const [credits, setCredits] =
    useState([]);
  const [search, setSearch] =
    useState("");
  const [dateFrom, setDateFrom] =
    useState("");
  const [dateTo, setDateTo] =
    useState("");
  const [loading, setLoading] =
    useState(true);
  const [error, setError] =
    useState("");
  const [modalOpen, setModalOpen] =
    useState(false);
  const [detailOpen, setDetailOpen] =
    useState(false);
  const [
    selectedPayment,
    setSelectedPayment,
  ] = useState(null);
  const [form, setForm] =
    useState({
      credit_id: "",
      amount: "",
      payment_date: getToday(),
    });
  const [saving, setSaving] =
    useState(false);
  const [formError, setFormError] =
    useState("");
  useEffect(() => {
    loadPage();
  }, []);
  async function loadPage() {
    try {
      setLoading(true);
      setError("");
      const [
        paymentData,
        creditData,
      ] = await Promise.all([
        getPayments(),
        getCredits(),
      ]);
      setPayments(paymentData);
      setCredits(creditData);
    } catch (err) {
      setError(
        "Could not load payment information."
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
            credit.remaining_debt ?? 0
          ) > 0
      );
    }, [credits]);
  const selectedCredit =
    useMemo(() => {
      if (!form.credit_id) {
        return null;
      }
      return credits.find(
        (credit) =>
          String(credit.id) ===
          String(form.credit_id)
      );
    }, [
      credits,
      form.credit_id,
    ]);
  /*
   * Join Payment + Credit data.
   *
   * This means we do not depend on
   * /api/payments returning every
   * customer/product relationship.
   */
  const enrichedPayments =
    useMemo(() => {
      return payments.map(
        (payment) => {
          const credit =
            credits.find(
              (item) =>
                Number(item.id) ===
                Number(
                  payment.credit_id
                )
            );
          return {
            ...payment,
            credit,
          };
        }
      );
    }, [
      payments,
      credits,
    ]);
  const filteredPayments =
    useMemo(() => {
      const value =
        search.toLowerCase().trim();
      return enrichedPayments.filter(
        (payment) => {
          const customerName =
            payment.credit
              ?.customer
              ?.name ?? "";
          const phone =
            payment.credit
              ?.customer
              ?.phone_number ?? "";
          const appliance =
            payment.credit
              ?.sale
              ?.appliance
              ?.name ?? "";
          const paymentDate =
            String(
              payment.payment_date ??
                ""
            ).slice(0, 10);
          const matchesSearch =
            !value ||
            customerName
              .toLowerCase()
              .includes(value) ||
            phone
              .toLowerCase()
              .includes(value) ||
            appliance
              .toLowerCase()
              .includes(value) ||
            String(payment.id)
              .includes(value) ||
            String(payment.credit_id)
              .includes(value);
          const matchesFrom =
            !dateFrom ||
            paymentDate >= dateFrom;
          const matchesTo =
            !dateTo ||
            paymentDate <= dateTo;
          return (
            matchesSearch &&
            matchesFrom &&
            matchesTo
          );
        }
      );
    }, [
      enrichedPayments,
      search,
      dateFrom,
      dateTo,
    ]);
  const totalReceived =
    filteredPayments.reduce(
      (total, payment) =>
        total +
        Number(
          payment.amount ?? 0
        ),
      0
    );
  const currentMonth =
    getCurrentMonth();
  const thisMonthTotal =
    payments
      .filter(
        (payment) =>
          String(
            payment.payment_date ?? ""
          ).slice(0, 7) ===
          currentMonth
      )
      .reduce(
        (total, payment) =>
          total +
          Number(
            payment.amount ?? 0
          ),
        0
      );
  const thisMonthCount =
    payments.filter(
      (payment) =>
        String(
          payment.payment_date ?? ""
        ).slice(0, 7) ===
        currentMonth
    ).length;
  function openPaymentModal() {
    setForm({
      credit_id: "",
      amount: "",
      payment_date: getToday(),
    });
    setFormError("");
    setModalOpen(true);
  }
  function closePaymentModal() {
    if (saving) return;
    setModalOpen(false);
    setFormError("");
  }
  function handleCreditChange(
    creditId
  ) {
    const credit =
      credits.find(
        (item) =>
          String(item.id) ===
          String(creditId)
      );
    const expected =
      credit
        ? Math.min(
            Number(
              credit.installment_amount ??
                0
            ),
            Number(
              credit.remaining_debt ??
                0
            )
          )
        : "";
    setForm((current) => ({
      ...current,
      credit_id: creditId,
      amount:
        expected || "",
    }));
    setFormError("");
  }
  async function handleSubmit(
    event
  ) {
    event.preventDefault();
    if (!selectedCredit) {
      setFormError(
        "Please select a credit account."
      );
      return;
    }
    const amount =
      Number(form.amount);
    if (amount <= 0) {
      setFormError(
        "Payment amount must be greater than zero."
      );
      return;
    }
    if (
      amount >
      Number(
        selectedCredit.remaining_debt
      )
    ) {
      setFormError(
        "Payment cannot be greater than the remaining debt."
      );
      return;
    }
    try {
      setSaving(true);
      setFormError("");
      await recordPayment(
        selectedCredit.id,
        {
          amount,
          payment_date:
            form.payment_date,
        }
      );
      await loadPage();
      setModalOpen(false);
    } catch (err) {
      setFormError(
        getApiError(
          err,
          "Could not record payment."
        )
      );
    } finally {
      setSaving(false);
    }
  }
  function openDetails(payment) {
    setSelectedPayment(payment);
    setDetailOpen(true);
  }
  function closeDetails() {
    setDetailOpen(false);
    setSelectedPayment(null);
  }
  function clearFilters() {
    setSearch("");
    setDateFrom("");
    setDateTo("");
  }
  return (
    <div className="payments-page">
      <div className="page-toolbar">
        <div>
          <h2>Payments</h2>
          <p>
            Track installment payments
            received from customers.
          </p>
        </div>
        <button
          className="primary-action-button"
          onClick={
            openPaymentModal
          }
        >
          <Plus size={18} />
          Record Payment
        </button>
      </div>
      <section className="payments-summary">
        <PaymentSummary
          icon={
            <WalletCards
              size={20}
            />
          }
          title="Payments"
          value={
            filteredPayments.length
          }
        />
        <PaymentSummary
          icon={
            <Banknote size={20} />
          }
          title="Total Received"
          value={
            formatMoney(
              totalReceived
            )
          }
        />
        <PaymentSummary
          icon={
            <TrendingUp
              size={20}
            />
          }
          title="This Month"
          value={
            formatMoney(
              thisMonthTotal
            )
          }
        />
        <PaymentSummary
          icon={
            <CalendarDays
              size={20}
            />
          }
          title="Monthly Payments"
          value={
            thisMonthCount
          }
        />
      </section>
      <div className="content-card">
        <div className="payments-toolbar">
          <div className="table-search payment-search">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search customer, appliance, credit..."
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
            />
          </div>
          <div className="payment-date-filters">
            <div className="date-filter-field">
              <span>From</span>
              <input
                type="date"
                value={dateFrom}
                onChange={(event) =>
                  setDateFrom(
                    event.target.value
                  )
                }
              />
            </div>
            <div className="date-filter-field">
              <span>To</span>
              <input
                type="date"
                value={dateTo}
                onChange={(event) =>
                  setDateTo(
                    event.target.value
                  )
                }
              />
            </div>
            {(search ||
              dateFrom ||
              dateTo) && (
              <button
                className="clear-filter-button"
                onClick={
                  clearFilters
                }
              >
                Clear
              </button>
            )}
          </div>
        </div>
        {loading ? (
          <div className="table-state">
            Loading payments...
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
        ) : filteredPayments.length ===
          0 ? (
          <div className="empty-appliances">
            <div className="empty-icon">
              <WalletCards
                size={28}
              />
            </div>
            <h3>
              No payments found
            </h3>
            <p>
              Recorded installment
              payments will appear here.
            </p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="data-table payments-table">
              <thead>
                <tr>
                  <th>Payment</th>
                  <th>Customer</th>
                  <th>Appliance</th>
                  <th>Credit</th>
                  <th>Amount</th>
                  <th>Date</th>
                  <th>
                    Remaining Debt
                  </th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredPayments.map(
                  (payment) => {
                    const credit =
                      payment.credit;
                    return (
                      <tr
                        key={
                          payment.id
                        }
                      >
                        <td>
                          <div className="payment-id-cell">
                            <div className="payment-table-icon">
                              <Banknote
                                size={17}
                              />
                            </div>
                            <div>
                              <strong>
                                Payment #
                                {payment.id}
                              </strong>
                              <span>
                                Installment
                                payment
                              </span>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="payment-customer-cell">
                            <div className="customer-avatar">
                              {getInitials(
                                credit
                                  ?.customer
                                  ?.name
                              )}
                            </div>
                            <div>
                              <strong>
                                {credit
                                  ?.customer
                                  ?.name ??
                                  "Unknown"}
                              </strong>
                              <span>
                                {credit
                                  ?.customer
                                  ?.phone_number ??
                                  ""}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="credit-product-cell">
                            <Package
                              size={14}
                            />
                            {credit
                              ?.sale
                              ?.appliance
                              ?.name ??
                              "Unknown"}
                          </div>
                        </td>
                        <td>
                          <span className="payment-credit-badge">
                            <CreditCard
                              size={12}
                            />
                            #
                            {payment.credit_id}
                          </span>
                        </td>
                        <td>
                          <strong className="payment-amount-value">
                            {formatMoney(
                              payment.amount
                            )}
                          </strong>
                        </td>
                        <td>
                          <div className="due-date-cell">
                            <CalendarDays
                              size={13}
                            />
                            {formatDate(
                              payment.payment_date
                            )}
                          </div>
                        </td>
                        <td>
                          {formatMoney(
                            credit
                              ?.remaining_debt ??
                              0
                          )}
                        </td>
                        <td>
                          <button
                            className="icon-button"
                            title="View payment"
                            onClick={() =>
                              openDetails(
                                payment
                              )
                            }
                          >
                            <Eye
                              size={16}
                            />
                          </button>
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
      {/* RECORD PAYMENT MODAL */}
      {modalOpen && (
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
                <h2>
                  Record Payment
                </h2>
                <p>
                  Add a payment to an
                  active credit account.
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
                handleSubmit
              }
            >
              {formError && (
                <div className="form-general-error">
                  {formError}
                </div>
              )}
              <div className="form-field">
                <label>
                  Credit Customer
                </label>
                <select
                  required
                  value={
                    form.credit_id
                  }
                  onChange={(event) =>
                    handleCreditChange(
                      event.target.value
                    )
                  }
                >
                  <option value="">
                    Select credit account
                  </option>
                  {activeCredits.map(
                    (credit) => (
                      <option
                        key={
                          credit.id
                        }
                        value={
                          credit.id
                        }
                      >
                        #{credit.id}
                        {" — "}
                        {credit.customer
                          ?.name ??
                          "Unknown"}
                        {" — "}
                        {formatMoney(
                          credit.remaining_debt
                        )}
                      </option>
                    )
                  )}
                </select>
              </div>
              {selectedCredit && (
                <div className="selected-credit-preview">
                  <div className="selected-credit-heading">
                    <div className="customer-avatar">
                      {getInitials(
                        selectedCredit
                          .customer
                          ?.name
                      )}
                    </div>
                    <div>
                      <strong>
                        {selectedCredit
                          .customer
                          ?.name ??
                          "Unknown"}
                      </strong>
                      <span>
                        {selectedCredit
                          .sale
                          ?.appliance
                          ?.name ??
                          "Unknown appliance"}
                      </span>
                    </div>
                  </div>
                  <div className="selected-credit-values">
                    <div>
                      <span>
                        Remaining
                      </span>
                      <strong>
                        {formatMoney(
                          selectedCredit.remaining_debt
                        )}
                      </strong>
                    </div>
                    <div>
                      <span>
                        Installment
                      </span>
                      <strong>
                        {formatMoney(
                          selectedCredit.installment_amount
                        )}
                      </strong>
                    </div>
                    <div>
                      <span>
                        Next Due
                      </span>
                      <strong>
                        {formatDate(
                          selectedCredit.next_due_date
                        )}
                      </strong>
                    </div>
                  </div>
                </div>
              )}
              <div className="form-field">
                <label>
                  Payment Amount
                </label>
                <input
                  required
                  type="number"
                  min="0.01"
                  step="0.01"
                  placeholder="100"
                  value={
                    form.amount
                  }
                  onChange={(event) =>
                    setForm(
                      (current) => ({
                        ...current,
                        amount:
                          event.target
                            .value,
                      })
                    )
                  }
                />
              </div>
              <div className="form-field">
                <label>
                  Payment Date
                </label>
                <input
                  required
                  type="date"
                  value={
                    form.payment_date
                  }
                  onChange={(event) =>
                    setForm(
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
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="primary-action-button"
                  disabled={saving}
                >
                  {saving
                    ? "Recording..."
                    : "Record Payment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* PAYMENT DETAILS */}
      {detailOpen &&
        selectedPayment && (
          <div
            className="modal-backdrop"
            onMouseDown={
              closeDetails
            }
          >
            <div
              className="app-modal payment-detail-modal"
              onMouseDown={(event) =>
                event.stopPropagation()
              }
            >
              <div className="modal-header">
                <div>
                  <h2>
                    Payment #
                    {
                      selectedPayment.id
                    }
                  </h2>
                  <p>
                    Payment transaction
                    information.
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
              <div className="payment-detail-body">
                <div className="payment-detail-amount">
                  <div className="large-payment-icon">
                    <Banknote
                      size={24}
                    />
                  </div>
                  <div>
                    <span>
                      Payment Received
                    </span>
                    <strong>
                      {formatMoney(
                        selectedPayment.amount
                      )}
                    </strong>
                  </div>
                </div>
                <div className="payment-detail-grid">
                  <PaymentDetailValue
                    icon={
                      <UserRound
                        size={15}
                      />
                    }
                    title="Customer"
                    value={
                      selectedPayment
                        .credit
                        ?.customer
                        ?.name ??
                      "Unknown"
                    }
                  />
                  <PaymentDetailValue
                    icon={
                      <Package
                        size={15}
                      />
                    }
                    title="Appliance"
                    value={
                      selectedPayment
                        .credit
                        ?.sale
                        ?.appliance
                        ?.name ??
                      "Unknown"
                    }
                  />
                  <PaymentDetailValue
                    icon={
                      <CreditCard
                        size={15}
                      />
                    }
                    title="Credit"
                    value={
                      `#${selectedPayment.credit_id}`
                    }
                  />
                  <PaymentDetailValue
                    icon={
                      <CalendarDays
                        size={15}
                      />
                    }
                    title="Payment Date"
                    value={
                      formatDate(
                        selectedPayment.payment_date
                      )
                    }
                  />
                </div>
                <div className="payment-debt-box">
                  <span>
                    Current Remaining
                    Debt
                  </span>
                  <strong>
                    {formatMoney(
                      selectedPayment
                        .credit
                        ?.remaining_debt ??
                        0
                    )}
                  </strong>
                </div>
              </div>
            </div>
          </div>
        )}
    </div>
  );
}
function PaymentSummary({
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
        <span>
          {title}
        </span>
        <strong>
          {value}
        </strong>
      </div>
    </div>
  );
}
function PaymentDetailValue({
  icon,
  title,
  value,
}) {
  return (
    <div className="payment-detail-value">
      <div>
        {icon}
      </div>
      <span>
        {title}
      </span>
      <strong>
        {value}
      </strong>
    </div>
  );
}
function formatMoney(value) {
  return new Intl.NumberFormat(
    "en-US",
    {
      style: "currency",
      currency: "USD",
    }
  ).format(
    Number(value ?? 0)
  );
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
export default Payments;