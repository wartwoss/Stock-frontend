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
import { useExchangeRate } from "../contexts/ExchangeRateContext";
import { useTranslation } from "react-i18next";
import { toLatinDigits } from "../utils/numbers";
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
function getStoredStorageId(storageList = []) {
  const stored = localStorage.getItem("default_storage_id");
  if (stored && storageList.some((s) => String(s.id) === String(stored))) {
    return String(stored);
  }
  return storageList.length > 0 ? String(storageList[0].id) : "";
}

function createEmptyForm(defaultStorageId = "") {
  return {
    appliance_id: "",
    storage_id: defaultStorageId,
    quantity: 1,
    selling_price: "",
    payment_type: "cash",
    sale_date: getToday(),
    customer_mode: "none",
    customer_id: "",
    customer_name: "",
    phone_number: "",
    description: "",
    warranty_months: "",
    currency: "USD",
    exchange_rate_per_100: "150000",
    down_payment: "0",
    number_of_payments: "",
    first_due_date: "",
  };
}
function Sales() {
  const { t } = useTranslation();
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
    useState(() => createEmptyForm(getStoredStorageId()));
  const [saving, setSaving] =
    useState(false);
  const [formError, setFormError] =
    useState("");

  const [applianceSelectOpen, setApplianceSelectOpen] = useState(false);
  const [applianceSearch, setApplianceSearch] = useState("");
  const [customerSelectOpen, setCustomerSelectOpen] = useState(false);
  const [customerSearch, setCustomerSearch] = useState("");
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

      const defaultStorage = getStoredStorageId(storagesData);
      setForm((current) => ({
        ...current,
        storage_id: current.storage_id || defaultStorage,
      }));
    } catch {
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
  const basePrice = Number(form.selling_price || 0);
  const qty = Number(form.quantity || 0);
  const isIqd = form.currency === "IQD";
  const rate = Number(form.exchange_rate_per_100 || 150000) / 100;
  
  const unitPriceConverted = isIqd ? basePrice * rate : basePrice;
  const totalPrice = unitPriceConverted * qty;
  
  const remainingDebt = Math.max(0, totalPrice - Number(form.down_payment || 0));
  const estimatedInstallment = Number(form.number_of_payments) > 0 ? remainingDebt / Number(form.number_of_payments) : 0;
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
  const { exchangeRate } = useExchangeRate();

  function openModal() {
    const defaultStorage = getStoredStorageId(storages);
    const newForm = createEmptyForm(defaultStorage);
    newForm.currency = "USD";
    newForm.exchange_rate_per_100 = Math.round(exchangeRate || 150000).toString();
    setForm(newForm);
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
    const numericFields = ["quantity","selling_price","exchange_rate_per_100","warranty_months","down_payment","number_of_payments"];
    if (numericFields.includes(name)) value = toLatinDigits(value);
    if (name === "storage_id" && value) {
      localStorage.setItem("default_storage_id", value);
    }
    setForm((current) => {
      const next = {
        ...current,
        [name]: value,
      };
      if (name === "payment_type") {
        if (value === "credit" && next.customer_mode === "none") {
          next.customer_mode = "existing";
        }
      }
      return next;
    });
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
        form.customer_mode === "none"
      ) {
        setFormError(
          "A customer is required for credit agreements."
        );
        return;
      }
      if (
        form.customer_mode ===
          "existing" &&
        !form.customer_id
      ) {
        setFormError(
          "Select a customer for the credit agreement."
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
    } else {
      // Cash payment
      if (
        form.customer_mode === "existing" &&
        !form.customer_id
      ) {
        setFormError(
          "Please select a customer, or choose 'Walk-in' for an unregistered buyer."
        );
        return;
      }
      if (
        form.customer_mode === "new" &&
        (!form.customer_name || !form.phone_number)
      ) {
        setFormError(
          "Customer name and phone number are required, or choose 'Walk-in'."
        );
        return;
      }
    }
    let createdSale = null;
    try {
      setSaving(true);
      setFormError("");
      let customerId = null;

      // Process customer for both cash and credit if selected
      if (
        form.customer_mode === "new"
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
      } else if (
        form.customer_mode === "existing" &&
        form.customer_id
      ) {
        customerId =
          Number(
            form.customer_id
          );
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
        selling_price: unitPriceConverted,
        payment_type: form.payment_type,
        sale_date: form.sale_date,
        currency: form.currency,
        exchange_rate_per_100: Number(form.exchange_rate_per_100),
        warranty_months: form.warranty_months ? Number(form.warranty_months) : null,
      };
      if (customerId) {
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
          <Plus size={18} />{t("sales.newSale", "New Sale")}</button>
      </div>
      <section className="sales-summary">
        <SaleSummary
          icon={
            <ShoppingCart size={20} />
          }
          title={t("sales.metrics.totalSales", "Total Sales")}
          value={sales.length}
        />
        <SaleSummary
          icon={<Package size={20} />}
          title={t("sales.metrics.unitsSold", "Units Sold")}
          value={totalUnitsSold}
        />
        <SaleSummary
          icon={<Banknote size={20} />}
          title={t("sales.metrics.cashSales", "Cash Sales")}
          value={cashSales}
        />
        <SaleSummary
          icon={
            <CreditCard size={20} />
          }
          title={t("sales.metrics.creditSales", "Credit Sales")}
          value={creditSales}
        />
      </section>
      <div className="content-card">
        <div className="sales-toolbar">
          <div className="table-search">
            <Search size={18} />
            <input
              type="text"
              placeholder={t("sales.searchPlace", "Search appliance, customer or storage...")}
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
            <h3>{t("sales.noSales", "No sales yet")}</h3>
            <p>{t("sales.noSalesDesc", "Record your first sale.")}</p>
            <button
              className="primary-action-button"
              onClick={openModal}
            >
              <Plus size={18} />{t("sales.newSale", "New Sale")}</button>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>{t("sales.col.sale", "Sale")}</th>
                  <th>{t("sales.col.storage", "Storage")}</th>
                  <th>{t("sales.col.quantity", "Quantity")}</th>
                  <th>{t("sales.col.unitPrice", "Unit Price")}</th>
                  <th>{t("sales.col.total", "Total")}</th>
                  <th>{t("sales.col.payment", "Payment")}</th>
                  <th>{t("sales.col.customer", "Customer")}</th>
                  <th>{t("sales.col.date", "Date")}</th>
                    <th></th>
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
                        {formatCurrency(
                          sale.selling_price, sale.currency
                        )}
                      </td>
                      <td>
                        <strong>
                          {formatCurrency(
                            sale.total_price, sale.currency
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
                        {sale.customer ? (
                          <div>
                            <strong>
                              {sale.customer.name}
                            </strong>
                            {sale.customer.phone_number && (
                              <div
                                style={{
                                  fontSize: "11px",
                                  color: "var(--text-muted)",
                                }}
                              >
                                {sale.customer.phone_number}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span
                            style={{
                              color: "var(--text-muted)",
                            }}
                          >
                            Walk-in Customer
                          </span>
                        )}
                      </td>
                      <td>
                        {formatDate(
                          sale.sale_date
                        )}
                      </td>
                    <td>
                          <button
                            onClick={() => window.open(`/receipt/sale/${sale.id}`, "_blank")}
                            className="secondary-button"
                            style={{ padding: "4px 8px", fontSize: "12px" }}
                          >
                            {t("receipt.print", "Print")}
                          </button>
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
                <h2>{t("sales.newSale", "New Sale")}</h2>
                <p>{t("sales.form.recordNewSale", "Record a new product sale.")}</p>
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
                  <label>{t("sales.form.appliance", "Appliance")}</label>
                  <button
                    type="button"
                    className="select-button"
                    onClick={() => setApplianceSelectOpen(true)}
                    style={{ textAlign: "left", padding: "8px 12px", border: "1px solid #d1d5db", borderRadius: "6px", backgroundColor: "#fff", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }}
                  >
                    {form.appliance_id
                      ? appliances.find((a) => String(a.id) === String(form.appliance_id))?.name || t("sales.form.selectAppliance", "Select appliance")
                      : t("sales.form.selectAppliance", "Select appliance")}
                  </button>
                </div>
                <div className="form-field">
                  <label>{t("sales.form.storage", "Storage")}</label>
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
                      {t("sales.form.selectStorage", "Select storage")}
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
                  <label>{t("sales.form.quantity", "Quantity")}</label>
                  <input
                    required
                    type="text"

                    inputMode="decimal"
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
                  <label>{t("sales.form.sellingPrice", "Selling Price")}</label>
                  <input
                    required
                    type="text"

                    inputMode="decimal"
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
              <div className="form-grid">
                <div className="form-field">
                  <label>{t("sales.form.saleDate", "Sale Date")}</label>
                  <input
                    required
                    type="date"
                    value={form.sale_date}
                    onChange={(event) => updateField("sale_date", event.target.value)}
                  />
                </div>
                <div className="form-field">
                  <label>{t("sales.form.currency", "Currency")}</label>
                  <select
                    value={form.currency}
                    onChange={(event) => updateField("currency", event.target.value)}
                  >
                    <option value="USD">USD ($)</option>
                    <option value="IQD">IQD (Dinar)</option>
                  </select>
                </div>
              </div>

              {form.currency === "IQD" && (
                <div className="form-field">
                  <label>{t("sales.form.exchangeRate", "Exchange Rate (100$ to X Dinar)")}</label>
                  <input
                    required
                    type="text"

                    inputMode="decimal"
                    min="1"
                    value={form.exchange_rate_per_100}
                    onChange={(event) => updateField("exchange_rate_per_100", event.target.value)}
                  />
                </div>
              )}
                            <div className="sale-total-box">
                <span>{t("sales.form.totalAmount", "Total Sale Amount")}</span>
                <strong>
                  {form.currency === "IQD" ? Math.round(totalPrice).toLocaleString() + " IQD" : formatCurrency(totalPrice, form.currency)}
                </strong>
              </div>
              <div className="form-field">
                <label>{t("sales.form.paymentType", "Payment Type")}</label>
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
                      <strong>{t("sales.form.cash", "Cash")}</strong>
                      <span>{t("sales.form.paidImmediately", "Paid immediately")}</span>
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
                      <strong>{t("sales.form.credit", "Credit")}</strong>
                      <span>{t("sales.form.installments", "Installments")}</span>
                    </div>
                  </button>
                </div>
              </div>
                            {/* CUSTOMER SECTION */}
              <div className="credit-sale-section">
                <div className="credit-section-title">
                  <UserRound size={18} />
                  {t("sales.form.customerRequired", "Customer (Required)")}
                </div>
                <div className="customer-mode">
                  <button
                    type="button"
                    className={form.customer_mode === "existing" ? "active" : ""}
                    onClick={() => updateField("customer_mode", "existing")}
                  >
                    {t("sales.form.existingCustomer", "Existing Customer")}
                  </button>
                  <button
                    type="button"
                    className={form.customer_mode === "new" ? "active" : ""}
                    onClick={() => updateField("customer_mode", "new")}
                  >
                    {t("sales.form.newCustomer", "New Customer")}
                  </button>
                </div>
                {form.customer_mode === "none" ? (
                  <div
                    style={{
                      fontSize: "12px",
                      color: "#6b7280",
                      padding: "4px 0",
                    }}
                  >
                    Logged as an anonymous walk-in sale. Choose "Existing Customer" or "New Customer" to attach customer details for warranty tracking.
                  </div>
                ) : form.customer_mode ===
                  "existing" ? (
                  <div className="form-field">
                    <label>
                      Customer
                    </label>
                    <button
                      type="button"
                      className="select-button"
                      onClick={() => setCustomerSelectOpen(true)}
                      style={{ textAlign: "left", padding: "8px 12px", border: "1px solid #d1d5db", borderRadius: "6px", backgroundColor: "#fff", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }}
                    >
                      {form.customer_id
                        ? customers.find((c) => String(c.id) === String(form.customer_id))?.name || "Select customer"
                        : "Select customer"}
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="form-grid">
                      <div className="form-field">
                        <label>{t("sales.form.customerName", "Customer Name")}</label>
                        <input
                          value={
                            form.customer_name
                          }
                          placeholder={t("sales.form.namePlaceholder", "Ahmad Ali")}
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
                        <label>{t("sales.form.phoneNumber", "Phone Number")}</label>
                        <input
                          value={
                            form.phone_number
                          }
                          placeholder={t("sales.form.phonePlaceholder", "0770...")}
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
                      <label>{t("sales.form.warrantyMonths", "Warranty (Months)")}</label>
                      <input
                        type="text"

                        inputMode="decimal"
                        min="0"
                        value={form.warranty_months}
                        placeholder={t("sales.form.eg12", "e.g. 12")}
                        onChange={(event) => updateField("warranty_months", event.target.value)}
                      />
                    </div>
                    <div className="form-field">
                      <label>{t("sales.form.descWarrantyNote", "Description / Warranty Note")}</label>
                      <input
                        value={form.description}
                        placeholder={t("sales.form.optionalNotePlaceholder", "Optional warranty or customer note")}
                        onChange={(event) => updateField("description", event.target.value)}
                      />
                    </div>
                  </>
                )}
              </div>

              {/* INSTALLMENT SECTION */}
              {form.payment_type === "credit" && (
                <div className="credit-sale-section">
                  <div className="credit-section-title">
                    <CreditCard
                      size={18}
                    />
                    {t("sales.installmentDetails", "Installment Details")}
                  </div>
                  <div className="form-grid">
                    <div className="form-field">
                      <label>{t("sales.form.downPayment", "Down Payment")}</label>
                      <input
                        type="text"

                        inputMode="decimal"
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
                      <label>{t("sales.form.numberOfPayments", "Number of Payments")}</label>
                      <input
                        type="text"

                        inputMode="decimal"
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
                    <label>{t("sales.form.firstDueDate", "First Due Date")}</label>
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
                      <span>{t("sales.form.remainingDebt", "Remaining Debt")}</span>
                      <strong>
                        {formatCurrency(
                          remainingDebt, form.currency
                        )}
                      </strong>
                    </div>
                    <div>
                      <span>{t("sales.form.estimatedInstallment", "Estimated Installment")}</span>
                      <strong>
                        {formatCurrency(
                          estimatedInstallment, form.currency
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
                  {t("common.cancel", "Cancel")}
                </button>
                <button
                  type="submit"
                  className="primary-action-button"
                  disabled={saving}
                >
                  {saving
                    ? t("sales.form.processing", "Processing...")
                    : t("sales.form.completeSale", "Complete Sale")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Appliance Selection Modal */}
      {applianceSelectOpen && (
        <div className="modal-backdrop" style={{ zIndex: 1100 }} onMouseDown={() => setApplianceSelectOpen(false)}>
          <div className="app-modal" onMouseDown={(e) => e.stopPropagation()} style={{ maxWidth: '500px', maxHeight: '80vh', display: 'flex', flexDirection: 'column', height: '80vh' }}>
            <div className="modal-header" style={{ flexShrink: 0 }}>
              <h2>{t("sales.form.selectAppliance", "Select appliance")}</h2>
              <button type="button" className="modal-close" onClick={() => setApplianceSelectOpen(false)}><X size={20} /></button>
            </div>
            <div style={{ padding: '0 20px 10px 20px', flexShrink: 0 }}>
              <div className="table-search" style={{ margin: '0' }}>
                <Search size={18} />
                <input
                  type="text"
                  placeholder={t("sales.form.searchAppliances", "Search appliances...")}
                  value={applianceSearch}
                  onChange={(e) => setApplianceSearch(e.target.value)}
                  autoFocus
                />
              </div>
            </div>
            <div style={{ overflowY: 'auto', flex: 1, padding: '0 20px 20px 20px' }}>
              {appliances
                .filter(a => a.name.toLowerCase().includes(applianceSearch.toLowerCase()) || a.brand.toLowerCase().includes(applianceSearch.toLowerCase()))
                .map((a) => (
                  <div 
                    key={a.id} 
                    style={{ padding: '10px', borderBottom: '1px solid #e5e7eb', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}
                    onClick={() => {
                      updateField("appliance_id", String(a.id));
                      setApplianceSelectOpen(false);
                      setApplianceSearch("");
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <Package size={18} color="#6b7280" />
                    <div>
                      <div style={{ fontWeight: 500 }}>{a.name}</div>
                      <div style={{ fontSize: '12px', color: '#6b7280' }}>{a.brand}</div>
                    </div>
                  </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Customer Selection Modal */}
      {customerSelectOpen && (
        <div className="modal-backdrop" style={{ zIndex: 1100 }} onMouseDown={() => setCustomerSelectOpen(false)}>
          <div className="app-modal" onMouseDown={(e) => e.stopPropagation()} style={{ maxWidth: '500px', maxHeight: '80vh', display: 'flex', flexDirection: 'column', height: '80vh' }}>
            <div className="modal-header" style={{ flexShrink: 0 }}>
              <h2>Select Customer</h2>
              <button type="button" className="modal-close" onClick={() => setCustomerSelectOpen(false)}><X size={20} /></button>
            </div>
            <div style={{ padding: '0 20px 10px 20px', flexShrink: 0 }}>
              <div className="table-search" style={{ margin: '0' }}>
                <Search size={18} />
                <input
                  type="text"
                  placeholder="Search customers..."
                  value={customerSearch}
                  onChange={(e) => setCustomerSearch(e.target.value)}
                  autoFocus
                />
              </div>
            </div>
            <div style={{ overflowY: 'auto', flex: 1, padding: '0 20px 20px 20px' }}>
              {customers
                .filter(c => c.name.toLowerCase().includes(customerSearch.toLowerCase()) || (c.phone_number && c.phone_number.includes(customerSearch.toLowerCase())))
                .map((c) => (
                  <div 
                    key={c.id} 
                    style={{ padding: '10px', borderBottom: '1px solid #e5e7eb', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}
                    onClick={() => {
                      updateField("customer_id", String(c.id));
                      setCustomerSelectOpen(false);
                      setCustomerSearch("");
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <UserRound size={18} color="#6b7280" />
                    <div>
                      <div style={{ fontWeight: 500 }}>{c.name}</div>
                      <div style={{ fontSize: '12px', color: '#6b7280' }}>{c.phone_number}</div>
                    </div>
                  </div>
              ))}
            </div>
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
