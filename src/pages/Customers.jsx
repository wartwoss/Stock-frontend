import {
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  Users,
  UserRound,
  Search,
  Plus,
  Pencil,
  Trash2,
  Eye,
  Phone,
  CreditCard,
  WalletCards,
  X,
  Package,
  CalendarDays,
} from "lucide-react";
import {
  getCustomers,
  createCustomer,
  updateCustomer,
  deleteCustomer,
} from "../api/customers";
import {
  getCredits,
} from "../api/credits";
const emptyForm = {
  name: "",
  phone_number: "",
  description: "",
};
function Customers() {
  const [customers, setCustomers] =
    useState([]);
  const [credits, setCredits] =
    useState([]);
  const [search, setSearch] =
    useState("");
  const [statusFilter, setStatusFilter] =
    useState("");
  const [loading, setLoading] =
    useState(true);
  const [error, setError] =
    useState("");
  const [modalOpen, setModalOpen] =
    useState(false);
  const [profileOpen, setProfileOpen] =
    useState(false);
  const [
    selectedCustomer,
    setSelectedCustomer,
  ] = useState(null);
  const [editingCustomer, setEditingCustomer] =
    useState(null);
  const [form, setForm] =
    useState(emptyForm);
  const [saving, setSaving] =
    useState(false);
  const [formErrors, setFormErrors] =
    useState({});
  useEffect(() => {
    loadPage();
  }, []);
  async function loadPage() {
    try {
      setLoading(true);
      setError("");
      const [
        customerData,
        creditData,
      ] = await Promise.all([
        getCustomers(),
        getCredits(),
      ]);
      setCustomers(customerData);
      setCredits(creditData);
    } catch (err) {
      setError(
        "Could not load customers."
      );
    } finally {
      setLoading(false);
    }
  }
  const customersWithDebt =
    useMemo(() => {
      return customers.map(
        (customer) => {
          const customerCredits =
            credits.filter(
              (credit) =>
                Number(
                  credit.customer_id
                ) ===
                Number(
                  customer.id
                )
            );
          const outstandingDebt =
            customerCredits.reduce(
              (total, credit) =>
                total +
                Number(
                  credit.remaining_debt ??
                    0
                ),
              0
            );
          const activeCredits =
            customerCredits.filter(
              (credit) =>
                Number(
                  credit.remaining_debt
                ) > 0
            );
          const overdueCredits =
            customerCredits.filter(
              (credit) =>
                credit.status ===
                "overdue"
            );
          let status = "paid";
          if (
            overdueCredits.length > 0
          ) {
            status = "overdue";
          } else if (
            activeCredits.length > 0
          ) {
            status = "active";
          }
          return {
            ...customer,
            customerCredits,
            outstandingDebt,
            activeCredits:
              activeCredits.length,
            totalCredits:
              customerCredits.length,
            overdueCredits:
              overdueCredits.length,
            status,
          };
        }
      );
    }, [
      customers,
      credits,
    ]);
  const filteredCustomers =
    useMemo(() => {
      const value =
        search.toLowerCase().trim();
      return customersWithDebt.filter(
        (customer) => {
          const matchesSearch =
            !value ||
            customer.name
              ?.toLowerCase()
              .includes(value) ||
            customer.phone_number
              ?.toLowerCase()
              .includes(value);
          const matchesStatus =
            !statusFilter ||
            customer.status ===
              statusFilter;
          return (
            matchesSearch &&
            matchesStatus
          );
        }
      );
    }, [
      customersWithDebt,
      search,
      statusFilter,
    ]);
  const totalOutstanding =
    customersWithDebt.reduce(
      (total, customer) =>
        total +
        customer.outstandingDebt,
      0
    );
  const overdueCount =
    customersWithDebt.filter(
      (customer) =>
        customer.status ===
        "overdue"
    ).length;
  const activeCount =
    customersWithDebt.filter(
      (customer) =>
        customer.status ===
        "active"
    ).length;
  function openCreateModal() {
    setEditingCustomer(null);
    setForm(emptyForm);
    setFormErrors({});
    setModalOpen(true);
  }
  function openEditModal(customer) {
    setEditingCustomer(customer);
    setForm({
      name:
        customer.name ?? "",
      phone_number:
        customer.phone_number ?? "",
      description:
        customer.description ?? "",
    });
    setFormErrors({});
    setModalOpen(true);
  }
  function closeModal() {
    if (saving) return;
    setModalOpen(false);
    setEditingCustomer(null);
    setForm(emptyForm);
    setFormErrors({});
  }
  function openProfile(customer) {
    setSelectedCustomer(customer);
    setProfileOpen(true);
  }
  function closeProfile() {
    setProfileOpen(false);
    setSelectedCustomer(null);
  }
  function handleChange(event) {
    const {
      name,
      value,
    } = event.target;
    setForm((current) => ({
      ...current,
      [name]: value,
    }));
    setFormErrors((current) => ({
      ...current,
      [name]: undefined,
    }));
  }
  async function handleSubmit(
    event
  ) {
    event.preventDefault();
    try {
      setSaving(true);
      setFormErrors({});
      const payload = {
        name:
          form.name,
        phone_number:
          form.phone_number,
        description:
          form.description || null,
      };
      if (editingCustomer) {
        await updateCustomer(
          editingCustomer.id,
          payload
        );
      } else {
        await createCustomer(
          payload
        );
      }
      await loadPage();
      setModalOpen(false);
      setEditingCustomer(null);
      setForm(emptyForm);
    } catch (err) {
      if (err?.errors) {
        setFormErrors(
          err.errors
        );
      } else {
        setFormErrors({
          general:
            "Something went wrong.",
        });
      }
    } finally {
      setSaving(false);
    }
  }
  async function handleDelete(
    customer
  ) {
    const confirmed =
      window.confirm(`
        Delete "${customer.name}"?`
      );
    if (!confirmed) return;
    try {
      await deleteCustomer(
        customer.id
      );
      await loadPage();
    } catch (err) {
      alert(
        "This customer cannot be deleted because they may have sales or credit records."
      );
    }
  }
  return (
    <div className="customers-page">
      <div className="page-toolbar">
        <div>
          <h2>
            Credit Customers
          </h2>
          <p>
            Manage customers,
            outstanding debts and
            credit accounts.
          </p>
        </div>
        <button
          className="primary-action-button"
          onClick={
            openCreateModal
          }
        >
          <Plus size={18} />
          Add Customer
        </button>
      </div>
      <section className="customer-summary">
        <CustomerSummary
          icon={
            <Users size={20} />
          }
          title="Customers"
          value={
            customers.length
          }
        />
        <CustomerSummary
          icon={
            <CreditCard
              size={20}
            />
          }
          title="Active Debtors"
          value={
            activeCount +
            overdueCount
          }
        />
        <CustomerSummary
          icon={
            <WalletCards
              size={20}
            />
          }
          title="Outstanding Debt"
          value={
            formatMoney(
              totalOutstanding
            )
          }
        />
        <CustomerSummary
          icon={
            <UserRound size={20} />
          }
          title="Overdue"
          value={
            overdueCount
          }
        />
      </section>
      <div className="content-card">
        <div className="customers-toolbar">
          <div className="table-search">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search name or phone..."
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
            />
          </div>
          <select
            className="payment-filter"
            value={
              statusFilter
            }
            onChange={(event) =>
              setStatusFilter(
                event.target.value
              )
            }
          >
            <option value="">
              All Customers
            </option>
            <option value="active">
              Active Debt
            </option>
            <option value="overdue">
              Overdue
            </option>
            <option value="paid">
              Paid
            </option>
          </select>
        </div>
        {loading ? (
          <div className="table-state">
            Loading customers...
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
        ) : filteredCustomers.length ===
          0 ? (
          <div className="empty-appliances">
            <div className="empty-icon">
              <Users size={28} />
            </div>
            <h3>
              No customers found
            </h3>
            <p>
              Credit customers will
              appear here.
            </p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Phone</th>
                  <th>Credits</th>
                  <th>
                    Outstanding Debt
                  </th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.map(
                  (customer) => (
                    <tr
                      key={
                        customer.id
                      }
                    >
                      <td>
                        <div className="customer-table-name">
                          <div className="customer-avatar">
                            {getInitials(
                              customer.name
                            )}
                          </div>
                          <div>
                            <strong>
                              {
                                customer.name
                              }
                            </strong>
                            <span>
                              Customer #
                              {customer.id}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="phone-cell">
                          <Phone
                            size={14}
                          />
                          {
                            customer.phone_number
                          }
                        </div>
                      </td>
                      <td>
                        <strong>
                          {
                            customer.activeCredits
                          }
                        </strong>
                        <span className="table-muted">
                          {" "}
                          active /{" "}
                          {
                            customer.totalCredits
                          }{" "}
                          total
                        </span>
                      </td>
                      <td>
                        <strong
                          className={
                            customer.outstandingDebt >
                            0
                              ? "debt-value"
                              : ""
                          }
                        >
                          {formatMoney(
                            customer.outstandingDebt
                          )}
                        </strong>
                      </td>
                      <td>
                        <CustomerStatus
                          status={
                            customer.status
                          }
                        />
                      </td>
                      <td>
                        <div className="row-actions">
                          <button
                            className="icon-button"
                            title="View"
                            onClick={() =>
                              openProfile(
                                customer
                              )
                            }
                          >
                            <Eye
                              size={16}
                            />
                          </button>
                          <button
                            className="icon-button"
                            title="Edit"
                            onClick={() =>
                              openEditModal(
                                customer
                              )
                            }
                          >
                            <Pencil
                              size={16}
                            />
                          </button>
                          <button
                            className="icon-button delete-button"
                            title="Delete"
                            onClick={() =>
                              handleDelete(
                                customer
                              )
                            }
                          >
                            <Trash2
                              size={16}
                            />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {/* ADD / EDIT MODAL */}
      {modalOpen && (
        <div
          className="modal-backdrop"
          onMouseDown={
            closeModal
          }
        >
          <div
            className="app-modal"
            onMouseDown={(event) =>
              event.stopPropagation()
            }
          >
            <div className="modal-header">
              <div>
                <h2>
                  {editingCustomer
                    ? "Edit Customer"
                    : "Add Customer"}
                </h2>
                <p>
                  Customer information
                  for credit purchases.
                </p>
              </div>
              <button
                className="modal-close"
                onClick={
                  closeModal
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
              {formErrors.general && (
                <div className="form-general-error">
                  {
                    formErrors.general
                  }
                </div>
              )}
              <CustomerField
                label="Customer Name"
                name="name"
                value={form.name}
                onChange={
                  handleChange
                }
                placeholder="Ahmad Ali"
                error={
                  formErrors.name
                }
              />
              <CustomerField
                label="Phone Number"
                name="phone_number"
                value={
                  form.phone_number
                }
                onChange={
                  handleChange
                }
                placeholder="07701234567"
                error={
                  formErrors.phone_number
                }
              />
              <div className="form-field">
                <label>
                  Description
                </label>
                <textarea
                  name="description"
                  value={
                    form.description
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="Optional notes about this customer..."
                  rows="4"
                />
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={
                    closeModal
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
                    ? "Saving..."
                    : editingCustomer
                      ? "Save Changes"
                      : "Add Customer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* CUSTOMER PROFILE */}
      {profileOpen &&
        selectedCustomer && (
          <div
            className="modal-backdrop"
            onMouseDown={
              closeProfile
            }
          >
            <div
              className="customer-profile-modal"
              onMouseDown={(event) =>
                event.stopPropagation()
              }
            >
              <div className="modal-header">
                <div>
                  <h2>
                    Customer Profile
                  </h2>
                  <p>
                    Credit and debt
                    information.
                  </p>
                </div>
                <button
                  className="modal-close"
                  onClick={
                    closeProfile
                  }
                >
                  <X size={20} />
                </button>
              </div>
              <div className="customer-profile-body">
                <div className="profile-customer-header">
                  <div className="large-customer-avatar">
                    {getInitials(
                      selectedCustomer.name
                    )}
                  </div>
                  <div>
                    <h3>
                      {
                        selectedCustomer.name
                      }
                    </h3>
                    <span>
                      <Phone
                        size={13}
                      />
                      {
                        selectedCustomer.phone_number
                      }
                    </span>
                  </div>
                  <CustomerStatus
                    status={
                      selectedCustomer.status
                    }
                  />
                </div>
                <div className="customer-profile-stats">
                  <div>
                    <span>
                      Outstanding
                    </span>
                    <strong className="debt-value">
                      {formatMoney(
                        selectedCustomer
                          .outstandingDebt
                      )}
                    </strong>
                  </div>
                  <div>
                    <span>
                      Active Credits
                    </span>
                    <strong>
                      {
                        selectedCustomer
                          .activeCredits
                      }
                    </strong>
                  </div>
                  <div>
                    <span>
                      Total Credits
                    </span>
                    <strong>
                      {
                        selectedCustomer
                          .totalCredits
                      }
                    </strong>
                  </div>
                </div>
                {selectedCustomer.description && (
                  <div className="customer-note">
                    <strong>
                      Note
                    </strong>
                    <p>
                      {
                        selectedCustomer.description
                      }
                    </p>
                  </div>
                )}
                <div className="profile-section-header">
                  <h3>
                    Credit Purchases
                  </h3>
                </div>
                {selectedCustomer
                  .customerCredits
                  .length === 0 ? (
                  <div className="profile-empty">
                    No credit purchases
                    recorded.
                  </div>
                ) : (
                  <div className="credit-profile-list">
                    {selectedCustomer
                      .customerCredits
                      .map(
                        (credit) => (
                          <div
                            className="credit-profile-card"
                            key={
                              credit.id
                            }
                          >
                            <div className="credit-product">
                              <div className="product-icon">
                                <Package
                                  size={17}
                                />
                              </div>
                              <div>
                                <strong>
                                  {credit.sale
                                    ?.appliance
                                    ?.name ??
                                    "Appliance"}
                                </strong>
                                <span>
                                  Credit #
                                  {credit.id}
                                </span>
                              </div>
                            </div>
                            <div className="credit-profile-details">
                              <div>
                                <span>
                                  Total
                                </span>
                                <strong>
                                  {formatMoney(
                                    credit.total_amount
                                  )}
                                </strong>
                              </div>
                              <div>
                                <span>
                                  Remaining
                                </span>
                                <strong>
                                  {formatMoney(
                                    credit.remaining_debt
                                  )}
                                </strong>
                              </div>
                              <div>
                                <span>
                                  Installment
                                </span>
                                <strong>
                                  {formatMoney(
                                    credit.installment_amount
                                  )}
                                </strong>
                              </div>
                              <div>
                                <span>
                                  Next Due
                                </span>
                                <strong>
                                  <CalendarDays
                                    size={12}
                                  />
                                  {formatDate(
                                    credit.next_due_date
                                  )}
                                </strong>
                              </div>
                            </div>
                            <CustomerStatus
                              status={
                                Number(
                                  credit.remaining_debt
                                ) <= 0
                                  ? "paid"
                                  : credit.status
                              }
                            />
                          </div>
                        )
                      )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
    </div>
  );
}
function CustomerSummary({
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
function CustomerStatus({
  status,
}) {
  const normalized =
    status === "completed"
      ? "paid"
      : status;
  return (
    <span
      className={`customer-status ${normalized}`}
    >
      {normalized === "overdue"
        ? "Overdue"
        : normalized === "active"
          ? "Active"
          : "Paid"}
    </span>
  );
}
function CustomerField({
  label,
  error,
  ...inputProps
}) {
  return (
    <div className="form-field">
      <label>
        {label}
      </label>
      <input
        {...inputProps}
        required
      />
      {error && (
        <span className="field-error">
          {Array.isArray(error)
            ? error[0]
            : error}
        </span>
      )}
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
  if (!value) return "-";
  return new Date(
    value
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
  if (!name) return "?";
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
export default Customers;
