import { useTranslation } from "react-i18next";
import { toLatinDigits } from "../utils/numbers";
import {
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  Boxes,
  Plus,
  Search,
  SlidersHorizontal,
  Warehouse,
  Package,
  X,
  Minus,
} from "lucide-react";
import {
  getInventory,
  stockIn,
  adjustInventory,
} from "../api/inventory";
import {
  getAppliances,
} from "../api/appliances";
import {
  getStorages,
} from "../api/storages";
function Inventory() {
    const { t } = useTranslation();
const [inventory, setInventory] =
    useState([]);
  const [appliances, setAppliances] =
    useState([]);
  const [storages, setStorages] =
    useState([]);
  const [search, setSearch] =
    useState("");
  const [storageFilter, setStorageFilter] =
    useState("");
  const [loading, setLoading] =
    useState(true);
  const [error, setError] =
    useState("");
  const [stockModalOpen, setStockModalOpen] =
    useState(false);
  const [
    adjustmentModalOpen,
    setAdjustmentModalOpen,
  ] = useState(false);
  const [
    selectedInventory,
    setSelectedInventory,
  ] = useState(null);
  const [stockForm, setStockForm] =
    useState({
      appliance_id: "",
      storage_id: "",
      quantity: "",
    });
  const [adjustment, setAdjustment] =
    useState("");
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
        inventoryData,
        applianceData,
        storageData,
      ] = await Promise.all([
        getInventory(),
        getAppliances(),
        getStorages(),
      ]);
      setInventory(inventoryData);
      setAppliances(applianceData);
      setStorages(storageData);
    } catch (err) {
      setError(
        "Could not load inventory information."
      );
    } finally {
      setLoading(false);
    }
  }
  const filteredInventory =
    useMemo(() => {
      const value =
        search.toLowerCase().trim();
      return inventory.filter((item) => {
        const matchesSearch =
          !value ||
          item.appliance?.name
            ?.toLowerCase()
            .includes(value) ||
          item.appliance?.brand
            ?.toLowerCase()
            .includes(value) ||
          item.appliance?.category
            ?.toLowerCase()
            .includes(value);
        const matchesStorage =
          !storageFilter ||
          String(item.storage_id) ===
            String(storageFilter);
        return (
          matchesSearch &&
          matchesStorage
        );
      });
    }, [
      inventory,
      search,
      storageFilter,
    ]);
  const totalStock =
    filteredInventory.reduce(
      (total, item) =>
        total +
        Number(
          item.quantity_in_stock ?? 0
        ),
      0
    );
  const totalSold =
    filteredInventory.reduce(
      (total, item) =>
        total +
        Number(
          item.quantity_sold ?? 0
        ),
      0
    );
  const totalPurchased =
    filteredInventory.reduce(
      (total, item) =>
        total +
        Number(
          item.total_purchased ?? 0
        ),
      0
    );
  function openStockModal() {
    setStockForm({
      appliance_id: "",
      storage_id: "",
      quantity: "",
    });
    setFormError("");
    setStockModalOpen(true);
  }
  function closeStockModal() {
    if (saving) return;
    setStockModalOpen(false);
    setFormError("");
  }
  function openAdjustmentModal(item) {
    setSelectedInventory(item);
    setAdjustment("");
    setFormError("");
    setAdjustmentModalOpen(true);
  }
  function closeAdjustmentModal() {
    if (saving) return;
    setAdjustmentModalOpen(false);
    setSelectedInventory(null);
    setAdjustment("");
    setFormError("");
  }
  async function handleStockIn(event) {
    event.preventDefault();
    try {
      setSaving(true);
      setFormError("");
      await stockIn({
        appliance_id: Number(
          stockForm.appliance_id
        ),
        storage_id: Number(
          stockForm.storage_id
        ),
        quantity: Number(
          stockForm.quantity
        ),
      });
      await loadPage();
      setStockModalOpen(false);
    } catch (err) {
      setFormError(
        getApiError(
          err,
          "Could not add stock."
        )
      );
    } finally {
      setSaving(false);
    }
  }
  async function handleAdjustment(
    event
  ) {
    event.preventDefault();
    const amount =
      Number(adjustment);
    if (!amount) {
      setFormError(
        "Adjustment cannot be zero."
      );
      return;
    }
    try {
      setSaving(true);
      setFormError("");
      await adjustInventory(
        selectedInventory.id,
        amount
      );
      await loadPage();
      setAdjustmentModalOpen(false);
      setSelectedInventory(null);
    } catch (err) {
      setFormError(
        getApiError(
          err,
          "Could not adjust inventory."
        )
      );
    } finally {
      setSaving(false);
    }
  }
  return (
    <div className="inventory-page">
      <div className="page-toolbar">
        <div>
          <h2>{t("inventory.title")}</h2>
          <p>
            {t("inventory.subtitle")}
          </p>
        </div>
        <button
          className="primary-action-button"
          onClick={openStockModal}
        >
          <Plus size={18} />
          {t("inventory.stockIn")}
        </button>
      </div>
      <section className="inventory-summary">
        <SummaryCard
          icon={<Boxes size={20} />}
          title={t("inventory.purchased")}
          value={totalPurchased}
        />
        <SummaryCard
          icon={<Package size={20} />}
          title={t("inventory.available")}
          value={totalStock}
        />
        <SummaryCard
          icon={
            <SlidersHorizontal
              size={20}
            />
          }
          title={t("inventory.sold")}
          value={totalSold}
        />
      </section>
      <div className="content-card">
        <div className="inventory-toolbar">
          <div className="table-search">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search appliances..."
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
            />
          </div>
          <div className="storage-filter">
            <Warehouse size={17} />
            <select
              value={storageFilter}
              onChange={(event) =>
                setStorageFilter(
                  event.target.value
                )
              }
            >
              <option value="">
                {t("inventory.allStorages")}
              </option>
              {storages.map(
                (storage) => (
                  <option
                    key={storage.id}
                    value={storage.id}
                  >
                    {storage.name}
                  </option>
                )
              )}
            </select>
          </div>
        </div>
        {loading ? (
          <div className="table-state">
            {t("inventory.loading")}
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
        ) : filteredInventory.length ===
          0 ? (
          <div className="empty-appliances">
            <div className="empty-icon">
              <Boxes size={28} />
            </div>
            <h3>
              No inventory records
            </h3>
            <p>
              Add stock to an appliance
              to get started.
            </p>
            <button
              className="primary-action-button"
              onClick={openStockModal}
            >
              <Plus size={18} />
              Add Stock
            </button>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>{t("inventory.col.appliance")}</th>
                  <th>{t("inventory.col.storage")}</th>
                  <th>{t("inventory.purchased")}</th>
                  <th>{t("inventory.col.sold")}</th>
                  <th>{t("inventory.available")}</th>
                  <th>Status</th>
                  <th>{t("inventory.action")}</th>
                </tr>
              </thead>
              <tbody>
                {filteredInventory.map(
                  (item) => {
                    const available =
                      Number(
                        item.quantity_in_stock ??
                          0
                      );
                    return (
                      <tr key={item.id}>
                        <td>
                          <div className="appliance-name-cell">
                            <div className="product-icon">
                              <Package
                                size={18}
                              />
                            </div>
                            <div>
                              <strong>
                                {item
                                  .appliance
                                  ?.name ??
                                  "Unknown"}
                              </strong>
                              <span>
                                {item
                                  .appliance
                                  ?.brand ??
                                  ""}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="storage-cell">
                            <Warehouse
                              size={15}
                            />
                            <span>
                              {item.storage
                                ?.name ??
                                "Unknown"}
                            </span>
                          </div>
                        </td>
                        <td>
                          {
                            item.total_purchased
                          }
                        </td>
                        <td>
                          {
                            item.quantity_sold
                          }
                        </td>
                        <td>
                          <strong className="stock-number">
                            {available}
                          </strong>
                        </td>
                        <td>
                          <StockStatus
                            quantity={
                              available
                            }
                          />
                        </td>
                        <td>
                          <button
                            className="adjust-button"
                            onClick={() =>
                              openAdjustmentModal(
                                item
                              )
                            }
                          >
                            <SlidersHorizontal
                              size={15}
                            />
                            Adjust
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
      {stockModalOpen && (
        <div
          className="modal-backdrop"
          onMouseDown={
            closeStockModal
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
                <h2>{t("inventory.stockIn")}</h2>
                <p>
                  Add newly purchased
                  units to inventory.
                </p>
              </div>
              <button
                className="modal-close"
                onClick={
                  closeStockModal
                }
              >
                <X size={20} />
              </button>
            </div>
            <form
              className="appliance-form"
              onSubmit={
                handleStockIn
              }
            >
              {formError && (
                <div className="form-general-error">
                  {formError}
                </div>
              )}
              <div className="form-field">
                <label>{t("inventory.form.appliance")}</label>
                <select
                  required
                  value={
                    stockForm.appliance_id
                  }
                  onChange={(event) =>
                    setStockForm(
                      (current) => ({
                        ...current,
                        appliance_id:
                          event.target
                            .value,
                      })
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
                        }{" "}
                        â€”{" "}
                        {
                          appliance.brand
                        }
                      </option>
                    )
                  )}
                </select>
              </div>
              <div className="form-field">
                <label>{t("inventory.form.storageLocation")}</label>
                <select
                  required
                  value={
                    stockForm.storage_id
                  }
                  onChange={(event) =>
                    setStockForm(
                      (current) => ({
                        ...current,
                        storage_id:
                          event.target
                            .value,
                      })
                    )
                  }
                >
                  <option value="">
                    Select storage
                  </option>
                  {storages.map(
                    (storage) => (
                      <option
                        key={storage.id}
                        value={storage.id}
                      >
                        {storage.name}
                        {" â€” "}
                        {storage.location}
                      </option>
                    )
                  )}
                </select>
              </div>
              <div className="form-field">
                <label>{t("inventory.form.quantityAdded")}</label>
                <input
                  required
                  type="text"
                  inputMode="numeric"
                  min="1"
                  value={
                    stockForm.quantity
                  }
                  placeholder="10"
                  onChange={(event) =>
                    setStockForm(
                      (current) => ({
                        ...current,
                        quantity: toLatinDigits(event.target.value),
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
                    closeStockModal
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
                    ? "Adding..."
                    : "Add Stock"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {adjustmentModalOpen &&
        selectedInventory && (
          <div
            className="modal-backdrop"
            onMouseDown={
              closeAdjustmentModal
            }
          >
            <div
              className="app-modal adjustment-modal"
              onMouseDown={(event) =>
                event.stopPropagation()
              }
            >
              <div className="modal-header">
                <div>
                  <h2>
                    Adjust Inventory
                  </h2>
                  <p>
                    Correct the current
                    physical stock count.
                  </p>
                </div>
                <button
                  className="modal-close"
                  onClick={
                    closeAdjustmentModal
                  }
                >
                  <X size={20} />
                </button>
              </div>
              <form
                className="appliance-form"
                onSubmit={
                  handleAdjustment
                }
              >
                <div className="adjustment-product">
                  <Package size={21} />
                  <div>
                    <strong>
                      {
                        selectedInventory
                          .appliance
                          ?.name
                      }
                    </strong>
                    <span>
                      Current stock:{" "}
                      {
                        selectedInventory
                          .quantity_in_stock
                      }
                    </span>
                  </div>
                </div>
                {formError && (
                  <div className="form-general-error">
                    {formError}
                  </div>
                )}
                <div className="form-field">
                  <label>
                    Adjustment
                  </label>
                  <input
                    required
                    type="text"
                    inputMode="decimal"
                    value={adjustment}
                    placeholder="Example: -1 or 2"
                    onChange={(event) =>
                      setAdjustment(toLatinDigits(event.target.value))
                    }
                  />
                  <small className="adjustment-help">
                    Use a positive number
                    to add stock, or a
                    negative number to
                    remove an accidental
                    extra unit.
                  </small>
                </div>
                <div className="quick-adjustments">
                  <button
                    type="button"
                    onClick={() =>
                      setAdjustment("-1")
                    }
                  >
                    <Minus size={14} />
                    Remove 1
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setAdjustment("1")
                    }
                  >
                    <Plus size={14} />
                    Add 1
                  </button>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="secondary-button"
                    onClick={
                      closeAdjustmentModal
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
                      : "Apply Adjustment"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
    </div>
  );
}
function SummaryCard({
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
function StockStatus({ quantity }) {
  if (quantity <= 0) {
    return (
      <span className="stock-status out">
        Out of Stock
      </span>
    );
  }
  if (quantity <= 3) {
    return (
      <span className="stock-status low">
        Low Stock
      </span>
    );
  }
  return (
    <span className="stock-status available">
      Available
    </span>
  );
}
function getApiError(
  error,
  fallback
) {
  if (error?.errors) {
    const first =
      Object.values(error.errors)[0];
    if (Array.isArray(first)) {
      return first[0];
    }
  }
  if (error?.message) {
    return error.message;
  }
  return fallback;
}
export default Inventory;