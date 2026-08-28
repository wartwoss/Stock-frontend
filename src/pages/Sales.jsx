import {
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  ShoppingCart,
  Plus,
  Search,
  Package,
  Warehouse,
  Banknote,
  CreditCard,
  UserRound,
  X,
} from "lucide-react";
import {
  getSales,
  createSale,
} from "../api/sales";
import {
  getAppliances,
} from "../api/appliances";
import {
  getStorages,
} from "../api/storages";
import {
  getInventory,
} from "../api/inventory";
import {
  getCustomers,
  createCustomer,
} from "../api/customers";
import {
  createCredit,
} from "../api/credits";
function getToday() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(
    date.getMonth() + 1
  ).padStart(2, "0");
  const day = String(
    date.getDate()
  ).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
function createEmptyForm() {
  return {
    appliance_id: "",
    storage_id: "",
    quantity: 1,
    selling_price: "",
    payment_type: "cash",
    sale_date: getToday(),
    customer_mode: "existing",
    customer_id: "",
    customer_name: "",
    phone_number: "",
    description: "",
    down_payment: "0",
    number_of_payments: "",
    first_due_date: "",
  };
}
function Sales() {
  const [sales, setSales] =
    useState([]);
  const [appliances, setAppliances] =
    useState([]);
  const [storages, setStorages] =
    useState([]);
  const [inventory, setInventory] =
    useState([]);
  const [customers, setCustomers] =
    useState([]);
  const [search, setSearch] =
    useState("");
  const [typeFilter, setTypeFilter] =
    useState("");
  const [loading, setLoading] =
    useState(true);
  const [error, setError] =
    useState("");
  const [modalOpen, setModalOpen] =
    useState(false);
  const [form, setForm] =
    useState(createEmptyForm());
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
        salesData,
        appliancesData,
        storagesData,
        inventoryData,
        customersData,
      ] = await Promise.all([
        getSales(),
        getAppliances(),
        getStorages(),
        getInventory(),
        getCustomers(),
      ]);
      setSales(salesData);
      setAppliances(appliancesData);
      setStorages(storagesData);
      setInventory(inventoryData);
      setCustomers(customersData);
    } catch (err) {
      setError(
        "Could not load sales information."
      );
    } finally {
      setLoading(false);
    }
  }
  const selectedInventory =
    useMemo(() => {
      if (
        !form.appliance_id ||
        !form.storage_id
      ) {
        return null;
      }
      return inventory.find(
        (item) =>
          String(item.appliance_id) ===
            String(form.appliance_id) &&
          String(item.storage_id) ===
            String(form.storage_id)
      );
    }, [
      inventory,
      form.appliance_id,
      form.storage_id,
    ]);
  const availableStock = Number(
    selectedInventory?.quantity_in_stock ??
      0
  );
  const totalPrice =
    Number(form.selling_price || 0) *
    Number(form.quantity || 0);
  const remainingDebt =
    Math.max(
      0,
      totalPrice -
        Number(
          form.down_payment || 0
        )
    );
  const estimatedInstallment =
    Number(form.number_of_payments) > 0
      ? remainingDebt /
        Number(
          form.number_of_payments
        )
      : 0;
  const filteredSales =
    useMemo(() => {
      const value =
        search.toLowerCase().trim();
      return sales.filter((sale) => {
        const matchesSearch =
          !value ||
          sale.appliance?.name
            ?.toLowerCase()
            .includes(value) ||
          sale.customer?.name
            ?.toLowerCase()
            .includes(value) ||
          sale.storage?.name
            ?.toLowerCase()
            .includes(value);
        const matchesType =
          !typeFilter ||
          sale.payment_type ===
            typeFilter;
        return (
          matchesSearch &&
          matchesType
        );
      });
    }, [
      sales,
      search,
      typeFilter,
    ]);
  function openModal() {
    setForm(createEmptyForm());
    setFormError("");
    setModalOpen(true);
  }
  function closeModal() {
    if (saving) return;
    setModalOpen(false);
    setFormError("");
  }
  function updateField(
    name,
    value
  ) {
    setForm((current) => ({
      ...current,
      [name]: value,
    }));
    setFormError("");
  }
  async function handleSubmit(
    event
  ) {
    event.preventDefault();
    const quantity =
      Number(form.quantity);
    if (quantity <= 0) {
      setFormError(
        "Quantity must be at least 1."
      );
      return;
    }
    if (!selectedInventory) {
      setFormError(
        "This appliance has no inventory in the selected storage."
      );
      return;
    }
    if (
      quantity >
      availableStock
    ) {
      setFormError(
        `Only ${availableStock} unit(s) are available.`
      );
      return;
    }
    if (
      form.payment_type ===
      "credit"
    ) {
      if (
        form.customer_mode ===
          "existing" &&
        !form.customer_id
      ) {
        setFormError(
          "Select a customer."
        );
        return;
      }
      if (
        form.customer_mode ===
          "new" &&
        (!form.customer_name ||
          !form.phone_number)
      ) {
        setFormError(
          "Customer name and phone number are required."
        );
        return;
      }
      if (
        !form.number_of_payments ||
        !form.first_due_date
      ) {
        setFormError(
          "Installment details are required."
        );
        return;
      }
      if (
        Number(form.down_payment) >=
        totalPrice
      ) {
        setFormError(
          "Down payment must be less than the total sale amount."
        );
        return;
      }
    }
    let createdSale = null;
    try {
      setSaving(true);
      setFormError("");
      let customerId = null;
      /*
       * CREDIT:
       * create new customer if needed
       */
      if (
        form.payment_type ===
        "credit"
      ) {
        if (
          form.customer_mode ===
          "new"
        ) {
          const customer =
            await createCustomer({
              name:
                form.customer_name,
              phone_number:
                form.phone_number,
              description:
                form.description ||
                null,
            });
          customerId =
            customer.id;
        } else {
          customerId =
            Number(
              form.customer_id
            );
        }
      }
      /*
       * CREATE SALE
       */
      const salePayload = {
        appliance_id:
          Number(
            form.appliance_id
          ),
        storage_id:
          Number(
            form.storage_id
          ),
        quantity:
          Number(
            form.quantity
          ),
        selling_price:
          Number(
            form.selling_price
          ),
        payment_type:
          form.payment_type,
        sale_date:
          form.sale_date,
      };
      if (
        form.payment_type ===
        "credit"
      ) {
        salePayload.customer_id =
          customerId;
      }
      createdSale =
        await createSale(
          salePayload
        );
      /*
       * CREATE CREDIT AGREEMENT
       */
      if (
        form.payment_type ===
        "credit"
      ) {
        await createCredit({
          sale_id:
            createdSale.id,
          down_payment:
            Number(
              form.down_payment
            ),
          number_of_payments:
            Number(
              form.number_of_payments
            ),
          first_due_date:
            form.first_due_date,
        });
      }
      await loadPage();
      setModalOpen(false);
    } catch (err) {
      if (
        createdSale &&
        form.payment_type ===
          "credit"
      ) {
        setFormError(`
          Sale #${createdSale.id} was created, but the credit agreement could not be completed.`
        );
      } else {
        setFormError(
          getApiError(
            err,
            "Could not create sale."
          )
        );
      }
    } finally {
      setSaving(false);
    }
  }
  const totalUnitsSold =
    sales.reduce(
      (total, sale) =>
        total +
        Number(
          sale.quantity ?? 0
        ),
      0
    );
  const cashSales =
    sales.filter(
      (sale) =>
        sale.payment_type ===
        "cash"
    ).length;
  const creditSales =
    sales.filter(
      (sale) =>
        sale.payment_type ===
        "credit"
    ).length;
  return (
    <div className="sales-page">
      <div className="page-toolbar">
        <div>
          <h2>Sales</h2>
          <p>
            Record cash and installment
            sales.
          </p>
        </div>
        <button
          className="primary-action-button"
          onClick={openModal}
        >
          <Plus size={18} />
          New Sale
        </button>
      </div>
      <section className="sales-summary">
        <SaleSummary
          icon={
            <ShoppingCart size={20} />
          }
          title="Total Sales"
          value={sales.length}
        />
        <SaleSummary
          icon={<Package size={20} />}
          title="Units Sold"
          value={totalUnitsSold}
        />
        <SaleSummary
          icon={<Banknote size={20} />}
          title="Cash Sales"
          value={cashSales}
        />
        <SaleSummary
          icon={
            <CreditCard size={20} />
          }
          title="Credit Sales"
          value={creditSales}
        />
      </section>
      <div className="content-card">
        <div className="sales-toolbar">
          <div className="table-search">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search appliance, customer or storage..."
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
            value={typeFilter}
            onChange={(event) =>
              setTypeFilter(
                event.target.value
              )
            }
          >
            <option value="">
              All Payment Types
            </option>
            <option value="cash">
              Cash
            </option>
            <option value="credit">
              Credit
            </option>
          </select>
        </div>
        {loading ? (
          <div className="table-state">
            Loading sales...
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
        ) : filteredSales.length ===
          0 ? (
          <div className="empty-appliances">
            <div className="empty-icon">
              <ShoppingCart
                size={28}
              />
            </div>
            <h3>No sales yet</h3>
            <p>
              Record your first sale.
            </p>
            <button
              className="primary-action-button"
              onClick={openModal}
            >
              <Plus size={18} />
              New Sale
            </button>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Sale</th>
                  <th>Storage</th>
                  <th>Quantity</th>
                  <th>Unit Price</th>
                  <th>Total</th>
                  <th>Payment</th>
                  <th>Customer</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {filteredSales.map(
                  (sale) => (
                    <tr key={sale.id}>
                      <td>
                        <div className="appliance-name-cell">
                          <div className="product-icon">
                            <Package
                              size={18}
                            />
                          </div>
                          <div>
                            <strong>
                              {sale
                                .appliance
                                ?.name ??
                                "Unknown"}
                            </strong>
                            <span>
                              Sale #{sale.id}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="storage-cell">
                          <Warehouse
                            size={14}
                          />
                          {sale.storage
                            ?.name ??
                            "-"}
                        </div>
                      </td>
                      <td>
                        {sale.quantity}
                      </td>
                      <td>
                        {formatMoney(
                          sale.selling_price
                        )}
                      </td>
                      <td>
                        <strong>
                          {formatMoney(
                            sale.total_price
                          )}
                        </strong>
                      </td>
                      <td>
                        <PaymentBadge
                          type={
                            sale.payment_type
                          }
                        />
                      </td>
                      <td>
                        {sale.customer
                          ?.name ??
                          "Cash customer"}
                      </td>
                      <td>
                        {formatDate(
                          sale.sale_date
                        )}
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {modalOpen && (
        <div
          className="modal-backdrop"
          onMouseDown={closeModal}
        >
          <div
            className="app-modal sale-modal"
            onMouseDown={(event) =>
              event.stopPropagation()
            }
          >
            <div className="modal-header">
              <div>
                <h2>New Sale</h2>
                <p>
                  Record a new product
                  sale.
                </p>
              </div>
              <button
                className="modal-close"
                onClick={closeModal}
              >
                <X size={20} />
              </button>
            </div>
            <form
              className="appliance-form"
              onSubmit={handleSubmit}
            >
              {formError && (
                <div className="form-general-error">
                  {formError}
                </div>
              )}
              <div className="form-grid">
                <div className="form-field">
                  <label>
                    Appliance
                  </label>
                  <select
                    required
                    value={
                      form.appliance_id
                    }
                    onChange={(event) =>
                      updateField(
                        "appliance_id",
                        event.target.value
                      )
                    }
                  >
                    <option value="">
                      Select appliance
                    </option>
                    {appliances.map(
                      (appliance) => (
                        <option
                          key={
                            appliance.id
                          }
                          value={
                            appliance.id
                          }
                        >
                          {
                            appliance.name
                          }
                          {" — "}
                          {
                            appliance.brand
                          }
                        </option>
                      )
                    )}
                  </select>
                </div>
                <div className="form-field">
                  <label>
                    Storage
                  </label>
                  <select
                    required
                    value={
                      form.storage_id
                    }
                    onChange={(event) =>
                      updateField(
                        "storage_id",
                        event.target.value
                      )
                    }
                  >
                    <option value="">
                      Select storage
                    </option>
                    {storages.map(
                      (storage) => (
                        <option
                          key={
                            storage.id
                          }
                          value={
                            storage.id
                          }
                        >
                          {
                            storage.name
                          }
                        </option>
                      )
                    )}
                  </select>
                </div>
              </div>
              {form.appliance_id &&
                form.storage_id && (
                  <div
                    className={`stock-preview ${
                      availableStock <=
                      0
                        ? "stock-preview-empty"
                        : ""
                    }`}
                  >
                    <Package
                      size={18}
                    />
                    <div>
                      <span>
                        Available Stock
                      </span>
                      <strong>
                        {availableStock}{" "}
                        unit(s)
                      </strong>
                    </div>
                  </div>
                )}
              <div className="form-grid">
                <div className="form-field">
                  <label>
                    Quantity
                  </label>
                  <input
                    required
                    type="number"
                    min="1"
                    value={
                      form.quantity
                    }
                    onChange={(event) =>
                      updateField(
                        "quantity",
                        event.target.value
                      )
                    }
                  />
                </div>
                <div className="form-field">
                  <label>
                    Selling Price
                  </label>
                  <input
                    required
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="650"
                    value={
                      form.selling_price
                    }
                    onChange={(event) =>
                      updateField(
                        "selling_price",
                        event.target.value
                      )
                    }
                  />
                </div>
              </div>
              <div className="form-field">
                <label>
                  Sale Date
                </label>
                <input
                  required
                  type="date"
                  value={
                    form.sale_date
                  }
                  onChange={(event) =>
                    updateField(
                      "sale_date",
                      event.target.value
                    )
                  }
                />
              </div>
              <div className="sale-total-box">
                <span>
                  Total Sale Amount
                </span>
                <strong>
                  {formatMoney(
                    totalPrice
                  )}
                </strong>
              </div>
              <div className="form-field">
                <label>
                  Payment Type
                </label>
                <div className="payment-type-options">
                  <button
                    type="button"
                    className={
                      form.payment_type ===
                      "cash"
                        ? "payment-option active"
                        : "payment-option"
                    }
                    onClick={() =>
                      updateField(
                        "payment_type",
                        "cash"
                      )
                    }
                  >
                    <Banknote
                      size={19}
                    />
                    <div>
                      <strong>
                        Cash
                      </strong>
                      <span>
                        Paid immediately
                      </span>
                    </div>
                  </button>
                  <button
                    type="button"
                    className={
                      form.payment_type ===
                      "credit"
                        ? "payment-option active"
                        : "payment-option"
                    }
                    onClick={() =>
                      updateField(
                        "payment_type",
                        "credit"
                      )
                    }
                  >
                    <CreditCard
                      size={19}
                    />
                    <div>
                      <strong>
                        Credit
                      </strong>
                      <span>
                        Installments
                      </span>
                    </div>
                  </button>
                </div>
              </div>
              {form.payment_type ===
                "credit" && (
                <div className="credit-sale-section">
                  <div className="credit-section-title">
                    <UserRound
                      size={18}
                    />
                    Customer
                  </div>
                  <div className="customer-mode">
                    <button
                      type="button"
                      className={
                        form.customer_mode ===
                        "existing"
                          ? "active"
                          : ""
                      }
                      onClick={() =>
                        updateField(
                          "customer_mode",
                          "existing"
                        )
                      }
                    >
                      Existing Customer
                    </button>
                    <button
                      type="button"
                      className={
                        form.customer_mode ===
                        "new"
                          ? "active"
                          : ""
                      }
                      onClick={() =>
                        updateField(
                          "customer_mode",
                          "new"
                        )
                      }
                    >
                      New Customer
                    </button>
                  </div>
                  {form.customer_mode ===
                    "existing" ? (
                    <div className="form-field">
                      <label>
                        Customer
                      </label>
                      <select
                        value={
                          form.customer_id
                        }
                        onChange={(event) =>
                          updateField(
                            "customer_id",
                            event.target
                              .value
                          )
                        }
                      >
                        <option value="">
                          Select customer
                        </option>
                        {customers.map(
                          (customer) => (
                            <option
                              key={
                                customer.id
                              }
                              value={
                                customer.id
                              }
                            >
                              {
                                customer.name
                              }
                              {" — "}
                              {
                                customer.phone_number
                              }
                            </option>
                          )
                        )}
                      </select>
                    </div>
                  ) : (
                    <>
                      <div className="form-grid">
                        <div className="form-field">
                          <label>
                            Customer Name
                          </label>
                          <input
                            value={
                              form.customer_name
                            }
                            placeholder="Ahmad Ali"
                            onChange={(event) =>
                              updateField(
                                "customer_name",
                                event.target
                                  .value
                              )
                            }
                          />
                        </div>
                        <div className="form-field">
                          <label>
                            Phone Number
                          </label>
                          <input
                            value={
                              form.phone_number
                            }
                            placeholder="0770..."
                            onChange={(event) =>
                              updateField(
                                "phone_number",
                                event.target
                                  .value
                              )
                            }
                          />
                        </div>
                      </div>
                      <div className="form-field">
                        <label>
                          Description
                        </label>
                        <input
                          value={
                            form.description
                          }
                          placeholder="Optional note"
                          onChange={(event) =>
                            updateField(
                              "description",
                              event.target
                                .value
                            )
                          }
                        />
                      </div>
                    </>
                  )}
                  <div className="credit-section-title">
                    <CreditCard
                      size={18}
                    />
                    Installment Details
                  </div>
                  <div className="form-grid">
                    <div className="form-field">
                      <label>
                        Down Payment
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={
                          form.down_payment
                        }
                        onChange={(event) =>
                          updateField(
                            "down_payment",
                            event.target
                              .value
                          )
                        }
                      />
                    </div>
                    <div className="form-field">
                      <label>
                        Number of Payments
                      </label>
                      <input
                        type="number"
                        min="1"
                        placeholder="8"
                        value={
                          form.number_of_payments
                        }
                        onChange={(event) =>
                          updateField(
                            "number_of_payments",
                            event.target
                              .value
                          )
                        }
                      />
                    </div>
                  </div>
                  <div className="form-field">
                    <label>
                      First Due Date
                    </label>
                    <input
                      type="date"
                      value={
                        form.first_due_date
                      }
                      onChange={(event) =>
                        updateField(
                          "first_due_date",
                          event.target.value
                        )
                      }
                    />
                  </div>
                  <div className="credit-preview">
                    <div>
                      <span>
                        Remaining Debt
                      </span>
                      <strong>
                        {formatMoney(
                          remainingDebt
                        )}
                      </strong>
                    </div>
                    <div>
                      <span>
                        Estimated Installment
                      </span>
                      <strong>
                        {formatMoney(
                          estimatedInstallment
                        )}
                      </strong>
                    </div>
                  </div>
                </div>
              )}
              <div className="modal-footer">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={closeModal}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="primary-action-button"
                  disabled={saving}
                >
                  {saving
                    ? "Processing..."
                    : "Complete Sale"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
function SaleSummary({
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
        <strong>{value}</strong>
      </div>
    </div>
  );
}
function PaymentBadge({
  type,
}) {
  if (type === "credit") {
    return (
      <span className="payment-badge credit">
        <CreditCard size={13} />
        Credit
      </span>
    );
  }
  return (
    <span className="payment-badge cash">
      <Banknote size={13} />
      Cash
    </span>
  );
}
function formatMoney(value) {
  return new Intl.NumberFormat(
    "en-US",
    {
      style: "currency",
      currency: "USD",
    }
  ).format(Number(value ?? 0));
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
export default Sales;
