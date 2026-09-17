import { useTranslation } from "react-i18next";
import { useEffect, useMemo, useState } from "react";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Package,
  X,
} from "lucide-react";
import {
  getAppliances,
  createAppliance,
  updateAppliance,
  deleteAppliance,
} from "../api/appliances";
const emptyForm = {
  name: "",
  category: "",
  brand: "",
  purchase_price: "",
  date_added: "",
};
function Appliances() {
    const { t } = useTranslation();
const [appliances, setAppliances] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAppliance, setEditingAppliance] =
    useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  useEffect(() => {
    loadAppliances();
  }, []);
  async function loadAppliances() {
    try {
      setLoading(true);
      setError("");
      const data = await getAppliances();
      setAppliances(data);
    } catch (err) {
      setError(t("appliances.couldNotLoad"));
    } finally {
      setLoading(false);
    }
  }
  const filteredAppliances = useMemo(() => {
    const value = search.toLowerCase().trim();
    if (!value) {
      return appliances;
    }
    return appliances.filter((appliance) => {
      return (
        appliance.name
          ?.toLowerCase()
          .includes(value) ||
        appliance.brand
          ?.toLowerCase()
          .includes(value) ||
        appliance.category
          ?.toLowerCase()
          .includes(value)
      );
    });
  }, [appliances, search]);
  function openCreateModal() {
    setEditingAppliance(null);
    setForm(emptyForm);
    setFormErrors({});
    setModalOpen(true);
  }
  function openEditModal(appliance) {
    setEditingAppliance(appliance);
    setForm({
      name: appliance.name ?? "",
      category: appliance.category ?? "",
      brand: appliance.brand ?? "",
      purchase_price:
        appliance.purchase_price ?? "",
      date_added:
        formatDateForInput(
          appliance.date_added
        ),
    });
    setFormErrors({});
    setModalOpen(true);
  }
  function closeModal() {
    if (saving) return;
    setModalOpen(false);
    setEditingAppliance(null);
    setForm(emptyForm);
    setFormErrors({});
  }
  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({
      ...current,
      [name]: value,
    }));
    setFormErrors((current) => ({
      ...current,
      [name]: undefined,
    }));
  }
  async function handleSubmit(event) {
    event.preventDefault();
    try {
      setSaving(true);
      setFormErrors({});
      const payload = {
        name: form.name,
        category: form.category,
        brand: form.brand,
        purchase_price:
          Number(form.purchase_price),
        date_added: form.date_added,
      };
      if (editingAppliance) {
        await updateAppliance(
          editingAppliance.id,
          payload
        );
      } else {
        await createAppliance(payload);
      }
      await loadAppliances();
      closeModal();
    } catch (err) {
      if (err?.errors) {
        setFormErrors(err.errors);
      } else {
        setFormErrors({
          general:
            "Something went wrong. Please try again.",
        });
      }
    } finally {
      setSaving(false);
    }
  }
  async function handleDelete(appliance) {
    const confirmed = window.confirm(
      `Delete "${appliance.name}"?`
    );
    if (!confirmed) return;
    try {
      await deleteAppliance(appliance.id);
      setAppliances((current) =>
        current.filter(
          (item) => item.id !== appliance.id
        )
      );
    } catch (err) {
      alert(
        "Could not delete this appliance. It may already be used by inventory or sales."
      );
    }
  }
  return (
    <div className="appliances-page">
      <div className="page-toolbar">
        <div>
          <h2>{t("appliances.title")}</h2>
          <p>
            {t("appliances.subtitle")}
          </p>
        </div>
        <button
          className="primary-action-button"
          onClick={openCreateModal}
        >
          <Plus size={18} />
          {t("appliances.addAppliance")}
        </button>
      </div>
      <div className="content-card">
        <div className="table-toolbar">
          <div className="table-search">
            <Search size={18} />
            <input
              type="text"
              placeholder={t("common.searchPlace")}
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
            />
          </div>
          <div className="result-count">
            {filteredAppliances.length} {t("common.resultCount")}
          </div>
        </div>
        {loading ? (
          <div className="table-state">
            {t("appliances.loading")}
          </div>
        ) : error ? (
          <div className="table-state table-error">
            <p>{error}</p>
            <button
              className="secondary-button"
              onClick={loadAppliances}
            >
              Try Again
            </button>
          </div>
        ) : filteredAppliances.length === 0 ? (
          <div className="empty-appliances">
            <div className="empty-icon">
              <Package size={28} />
            </div>
            <h3>{t("appliances.noAppliances")}</h3>
            <p>
              Add your first appliance to start
              managing your stock.
            </p>
            <button
              className="primary-action-button"
              onClick={openCreateModal}
            >
              <Plus size={18} />{t("appliances.form.addTitle")}</button>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>{t("appliances.col.appliance")}</th>
                  <th>{t("appliances.col.category")}</th>
                  <th>{t("appliances.col.brand")}</th>
                  <th>{t("appliances.purchasePrice")}</th>
                  <th>{t("appliances.dateAdded")}</th>
                  <th className="actions-column">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredAppliances.map(
                  (appliance) => (
                    <tr key={appliance.id}>
                      <td>
                        <div className="appliance-name-cell">
                          <div className="product-icon">
                            <Package size={18} />
                          </div>
                          <div>
                            <strong>
                              {appliance.name}
                            </strong>
                            <span>
                              ID #{appliance.id}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="category-badge">
                          {appliance.category}
                        </span>
                      </td>
                      <td>{appliance.brand}</td>
                      <td className="price-cell">
                        {formatMoney(
                          appliance.purchase_price
                        )}
                      </td>
                      <td>
                        {formatDisplayDate(
                          appliance.date_added
                        )}
                      </td>
                      <td>
                        <div className="row-actions">
                          <button
                            className="icon-button"
                            title="Edit"
                            onClick={() =>
                              openEditModal(
                                appliance
                              )
                            }
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            className="icon-button delete-button"
                            title="Delete"
                            onClick={() =>
                              handleDelete(
                                appliance
                              )
                            }
                          >
                            <Trash2 size={16} />
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
      {modalOpen && (
        <div
          className="modal-backdrop"
          onMouseDown={closeModal}
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
                  {editingAppliance
                    ? t("appliances.form.editTitle") : t("appliances.form.addTitle")}
                </h2>
                <p>
                  {editingAppliance
                    ? t("appliances.form.updateDesc") : t("appliances.form.addDesc")}
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
              {formErrors.general && (
                <div className="form-general-error">
                  {formErrors.general}
                </div>
              )}
              <FormField
                label={t("appliances.form.applianceName")}
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder={t("appliances.form.namePlaceholder")}
                error={formErrors.name}
              />
              <div className="form-grid">
                <FormField
                  label={t("appliances.form.category")}
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  placeholder={t("appliances.form.catPlaceholder")}
                  error={formErrors.category}
                />
                <FormField
                  label={t("appliances.form.brand")}
                  name="brand"
                  value={form.brand}
                  onChange={handleChange}
                  placeholder={t("appliances.form.brandPlaceholder")}
                  error={formErrors.brand}
                />
              </div>
              <div className="form-grid">
                <FormField
                  label={t("appliances.form.purchasePrice")}
                  name="purchase_price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.purchase_price}
                  onChange={handleChange}
                  placeholder="750"
                  error={
                    formErrors.purchase_price
                  }
                />
                <FormField
                  label={t("appliances.form.dateAdded")}
                  name="date_added"
                  type="date"
                  value={form.date_added}
                  onChange={handleChange}
                  error={formErrors.date_added}
                />
              </div>
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
                    ? t("appliances.form.saving") : editingAppliance ? t("appliances.form.saveChanges") : t("appliances.form.addTitle")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
function FormField({
  label,
  error,
  ...inputProps
}) {
  return (
    <div className="form-field">
      <label htmlFor={inputProps.name}>
        {label}
      </label>
      <input
        id={inputProps.name}
        {...inputProps}
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
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(Number(value ?? 0));
}
function formatDateForInput(date) {
  if (!date) return "";
  return String(date).slice(0, 10);
}
function formatDisplayDate(date) {
  if (!date) return "-";
  return new Date(date).toLocaleDateString(
    "en-US",
    {
      year: "numeric",
      month: "short",
      day: "numeric",
    }
  );
}
export default Appliances;
