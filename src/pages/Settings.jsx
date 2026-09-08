import {
  useEffect,
  useState,
} from "react";
import {
  Settings as SettingsIcon,
  Warehouse,
  Plus,
  Pencil,
  Trash2,
  X,
  Clock3,
  BellRing,
  Play,
  Save,
  MapPin,
  CheckCircle2,
} from "lucide-react";
import {
  getStorages,
  createStorage,
  updateStorage,
  deleteStorage,
} from "../api/storages";
import {
  getMonitoringSettings,
  updateMonitoringSettings,
  runMonitoringNow,
  getMonitoringStatus,
} from "../api/paymentMonitoring";
const emptyStorageForm = {
  name: "",
  location: "",
};
function Settings() {
  const [storages, setStorages] =
    useState([]);
  const [loading, setLoading] =
    useState(true);
  const [error, setError] =
    useState("");
  const [
    storageModalOpen,
    setStorageModalOpen,
  ] = useState(false);
  const [
    editingStorage,
    setEditingStorage,
  ] = useState(null);
  const [
    storageForm,
    setStorageForm,
  ] = useState(emptyStorageForm);
  const [
    storageErrors,
    setStorageErrors,
  ] = useState({});
  const [
    storageSaving,
    setStorageSaving,
  ] = useState(false);
  const [
    monitoring,
    setMonitoring,
  ] = useState({
    enabled: true,
    check_time: "08:00",
    days_before_due: 3,
  });
  const [
    monitoringStatus,
    setMonitoringStatus,
  ] = useState(null);
  const [
    monitoringSaving,
    setMonitoringSaving,
  ] = useState(false);
  const [
    runningCheck,
    setRunningCheck,
  ] = useState(false);
  const [
    monitoringMessage,
    setMonitoringMessage,
  ] = useState("");
  const [
    monitoringError,
    setMonitoringError,
  ] = useState("");
  useEffect(() => {
    loadPage();
  }, []);
  async function loadPage() {
    try {
      setLoading(true);
      setError("");
      const [
        storageData,
        monitoringData,
        statusData,
      ] = await Promise.all([
        getStorages(),
        getMonitoringSettings(),
        getMonitoringStatus(),
      ]);
      setStorages(storageData);
      const settings =
        monitoringData.settings ??
        monitoringData.data ??
        monitoringData;
      setMonitoring({
        enabled:
          Boolean(
            settings.enabled
          ),
        check_time:
          normalizeTime(
            settings.check_time
          ) || "08:00",
        days_before_due:
          Number(
            settings.days_before_due ??
              3
          ),
      });
      setMonitoringStatus(
        statusData.data ??
        statusData
      );
    } catch (err) {
      setError(
        "Could not load settings."
      );
    } finally {
      setLoading(false);
    }
  }
  function openCreateStorage() {
    setEditingStorage(null);
    setStorageForm(
      emptyStorageForm
    );
    setStorageErrors({});
    setStorageModalOpen(true);
  }
  function openEditStorage(storage) {
    setEditingStorage(storage);
    setStorageForm({
      name:
        storage.name ?? "",
      location:
        storage.location ?? "",
    });
    setStorageErrors({});
    setStorageModalOpen(true);
  }
  function closeStorageModal() {
    if (storageSaving) return;
    setStorageModalOpen(false);
    setEditingStorage(null);
    setStorageForm(
      emptyStorageForm
    );
    setStorageErrors({});
  }
  function handleStorageChange(
    event
  ) {
    const {
      name,
      value,
    } = event.target;
    setStorageForm(
      (current) => ({
        ...current,
        [name]: value,
      })
    );
    setStorageErrors(
      (current) => ({
        ...current,
        [name]: undefined,
      })
    );
  }
  async function handleStorageSubmit(
    event
  ) {
    event.preventDefault();
    try {
      setStorageSaving(true);
      setStorageErrors({});
      const payload = {
        name:
          storageForm.name,
        location:
          storageForm.location,
      };
      if (editingStorage) {
        await updateStorage(
          editingStorage.id,
          payload
        );
      } else {
        await createStorage(
          payload
        );
      }
      const data =
        await getStorages();
      setStorages(data);
      setStorageModalOpen(false);
      setEditingStorage(null);
      setStorageForm(
        emptyStorageForm
      );
    } catch (err) {
      if (err?.errors) {
        setStorageErrors(
          err.errors
        );
      } else {
        setStorageErrors({
          general:
            "Could not save storage location.",
        });
      }
    } finally {
      setStorageSaving(false);
    }
  }
  async function handleDeleteStorage(
    storage
  ) {
    const confirmed =
      window.confirm(
        `Delete "${storage.name}"?`
      );
    if (!confirmed) return;
    try {
      await deleteStorage(
        storage.id
      );
      setStorages(
        (current) =>
          current.filter(
            (item) =>
              item.id !==
              storage.id
          )
      );
    } catch (err) {
      alert(
        "This storage location may already be used by inventory or sales and cannot be deleted."
      );
    }
  }
  function handleMonitoringChange(
    event
  ) {
    const {
      name,
      value,
      type,
      checked,
    } = event.target;
    setMonitoring(
      (current) => ({
        ...current,
        [name]:
          type === "checkbox"
            ? checked
            : value,
      })
    );
    setMonitoringMessage("");
    setMonitoringError("");
  }
  async function saveMonitoringSettings(
    event
  ) {
    event.preventDefault();
    try {
      setMonitoringSaving(true);
      setMonitoringMessage("");
      setMonitoringError("");
      await updateMonitoringSettings({
        enabled:
          monitoring.enabled,
        check_time:
          monitoring.check_time,
        days_before_due:
          Number(
            monitoring.days_before_due
          ),
      });
      setMonitoringMessage(
        "Payment monitoring settings saved."
      );
      const status =
        await getMonitoringStatus();
      setMonitoringStatus(
        status.data ??
        status
      );
    } catch (err) {
      setMonitoringError(
        getApiError(
          err,
          "Could not save monitoring settings."
        )
      );
    } finally {
      setMonitoringSaving(false);
    }
  }
  async function handleRunNow() {
    try {
      setRunningCheck(true);
      setMonitoringMessage("");
      setMonitoringError("");
      await runMonitoringNow();
      setMonitoringMessage(
        "Payment monitoring check completed."
      );
      const status =
        await getMonitoringStatus();
      setMonitoringStatus(
        status.data ??
        status
      );
    } catch (err) {
      setMonitoringError(
        getApiError(
          err,
          "Could not run payment monitoring."
        )
      );
    } finally {
      setRunningCheck(false);
    }
  }
  if (loading) {
    return (
      <div className="table-state">
        Loading settings...
      </div>
    );
  }
  if (error) {
    return (
      <div className="table-state table-error">
        <p>{error}</p>
        <button
          className="secondary-button"
          onClick={loadPage}
        >
          Try Again
        </button>
      </div>
    );
  }
  const lastChecked =
    monitoringStatus?.last_checked_at ??
    monitoringStatus?.settings
      ?.last_checked_at ??
    null;
  return (
    <div className="settings-page">
      <div className="page-toolbar">
        <div>
          <h2>Settings</h2>
          <p>
            Configure storage locations
            and automatic payment
            monitoring.
          </p>
        </div>
      </div>
      <div className="settings-layout">
        {/* STORAGE SETTINGS */}
        <section className="settings-section">
          <div className="settings-section-header">
            <div className="settings-heading">
              <div className="settings-heading-icon">
                <Warehouse
                  size={20}
                />
              </div>
              <div>
                <h3>
                  Storage Locations
                </h3>
                <p>
                  Manage warehouses and
                  stock locations.
                </p>
              </div>
            </div>
            <button
              className="primary-action-button"
              onClick={
                openCreateStorage
              }
            >
              <Plus size={17} />
              Add Storage
            </button>
          </div>
          {storages.length === 0 ? (
            <div className="settings-empty">
              <Warehouse
                size={28}
              />
              <h4>
                No storage locations
              </h4>
              <p>
                Add your first storage
                location.
              </p>
            </div>
          ) : (
            <div className="storage-settings-list">
              {storages.map(
                (storage) => (
                  <div
                    className="storage-setting-item"
                    key={
                      storage.id
                    }
                  >
                    <div className="storage-setting-icon">
                      <Warehouse
                        size={19}
                      />
                    </div>
                    <div className="storage-setting-info">
                      <strong>
                        {
                          storage.name
                        }
                      </strong>
                      <span>
                        <MapPin
                          size={12}
                        />
                        {storage.location ||
                          "No location"}
                      </span>
                    </div>
                    <div className="storage-setting-id">
                      Storage #
                      {storage.id}
                    </div>
                    <div className="row-actions">
                      <button
                        className="icon-button"
                        title="Edit storage"
                        onClick={() =>
                          openEditStorage(
                            storage
                          )
                        }
                      >
                        <Pencil
                          size={16}
                        />
                      </button>
                      <button
                        className="icon-button delete-button"
                        title="Delete storage"
                        onClick={() =>
                          handleDeleteStorage(
                            storage
                          )
                        }
                      >
                        <Trash2
                          size={16}
                        />
                      </button>
                    </div>
                  </div>
                )
              )}
            </div>
          )}
        </section>
        {/* PAYMENT MONITORING */}
        <section className="settings-section">
          <div className="settings-section-header">
            <div className="settings-heading">
              <div className="settings-heading-icon">
                <BellRing
                  size={20}
                />
              </div>
              <div>
                <h3>
                  Payment Monitoring
                </h3>
                <p>
                  Configure automatic
                  installment reminders.
                </p>
              </div>
            </div>
            <div
              className={
                monitoring.enabled
                  ? "monitoring-status enabled"
                  : "monitoring-status disabled"
              }
            >
              <span />
              {monitoring.enabled
                ? "Enabled"
                : "Disabled"}
            </div>
          </div>
          <form
            className="monitoring-form"
            onSubmit={
              saveMonitoringSettings
            }
          >
            <div className="monitoring-toggle-row">
              <div>
                <strong>
                  Automatic Monitoring
                </strong>
                <span>
                  Automatically check
                  upcoming and overdue
                  payments.
                </span>
              </div>
              <label className="settings-switch">
                <input
                  type="checkbox"
                  name="enabled"
                  checked={
                    monitoring.enabled
                  }
                  onChange={
                    handleMonitoringChange
                  }
                />
                <span className="settings-slider" />
              </label>
            </div>
            <div className="monitoring-fields">
              <div className="monitoring-field">
                <div className="monitoring-field-icon">
                  <Clock3
                    size={17}
                  />
                </div>
                <div>
                  <label>
                    Daily Check Time
                  </label>
                  <span>
                    When the system
                    checks payments.
                  </span>
                </div>
                <input
                  type="time"
                  name="check_time"
                  required
                  value={
                    monitoring.check_time
                  }
                  onChange={
                    handleMonitoringChange
                  }
                />
              </div>
              <div className="monitoring-field">
                <div className="monitoring-field-icon">
                  <BellRing
                    size={17}
                  />
                </div>
                <div>
                  <label>
                    Reminder Days
                  </label>
                  <span>
                    Notify before payment
                    becomes due.
                  </span>
                </div>
                <input
                  type="number"
                  name="days_before_due"
                  min="0"
                  required
                  value={
                    monitoring.days_before_due
                  }
                  onChange={
                    handleMonitoringChange
                  }
                />
              </div>
            </div>
            <div className="monitoring-status-card">
              <div className="monitoring-status-icon">
                <CheckCircle2
                  size={19}
                />
              </div>
              <div>
                <span>
                  Last Monitoring Check
                </span>
                <strong>
                  {lastChecked
                    ? formatDateTime(
                        lastChecked
                      )
                    : "Not checked yet"}
                </strong>
              </div>
            </div>
            {monitoringMessage && (
              <div className="settings-success-message">
                <CheckCircle2
                  size={16}
                />
                {
                  monitoringMessage
                }
              </div>
            )}
            {monitoringError && (
              <div className="form-general-error">
                {
                  monitoringError
                }
              </div>
            )}
            <div className="monitoring-actions">
              <button
                type="button"
                className="secondary-button run-monitor-button"
                onClick={
                  handleRunNow
                }
                disabled={
                  runningCheck
                }
              >
                <Play size={15} />
                {runningCheck
                  ? "Checking..."
                  : "Run Check Now"}
              </button>
              <button
                type="submit"
                className="primary-action-button"
                disabled={
                  monitoringSaving
                }
              >
                <Save size={15} />
                {monitoringSaving
                  ? "Saving..."
                  : "Save Settings"}
              </button>
            </div>
          </form>
        </section>
        {/* SYSTEM INFO */}
        <section className="settings-section system-info-section">
          <div className="settings-section-header">
            <div className="settings-heading">
              <div className="settings-heading-icon">
                <SettingsIcon
                  size={20}
                />
              </div>
              <div>
                <h3>
                  System Information
                </h3>
                <p>
                  Current application
                  configuration.
                </p>
              </div>
            </div>
          </div>
          <div className="system-info-grid">
            <SystemInfo
              title="Storage Locations"
              value={
                storages.length
              }
            />
            <SystemInfo
              title="Monitoring"
              value={
                monitoring.enabled
                  ? "Active"
                  : "Disabled"
              }
            />
            <SystemInfo
              title="Reminder Window"
              value={
                `${monitoring.days_before_due} day(s)`
              }
            />
            <SystemInfo
              title="Daily Check"
              value={
                formatDisplayTime(
                  monitoring.check_time
                )
              }
            />
          </div>
        </section>
      </div>
      {/* STORAGE MODAL */}
      {storageModalOpen && (
        <div
          className="modal-backdrop"
          onMouseDown={
            closeStorageModal
          }
        >
          <div
            className="app-modal storage-modal"
            onMouseDown={(event) =>
              event.stopPropagation()
            }
          >
            <div className="modal-header">
              <div>
                <h2>
                  {editingStorage
                    ? "Edit Storage"
                    : "Add Storage"}
                </h2>
                <p>
                  Configure a stock
                  storage location.
                </p>
              </div>
              <button
                className="modal-close"
                onClick={
                  closeStorageModal
                }
              >
                <X size={20} />
              </button>
            </div>
            <form
              className="appliance-form"
              onSubmit={
                handleStorageSubmit
              }
            >
              {storageErrors.general && (
                <div className="form-general-error">
                  {
                    storageErrors.general
                  }
                </div>
              )}
              <div className="form-field">
                <label>
                  Storage Name
                </label>
                <input
                  required
                  name="name"
                  value={
                    storageForm.name
                  }
                  placeholder="Main Warehouse"
                  onChange={
                    handleStorageChange
                  }
                />
                {storageErrors.name && (
                  <span className="field-error">
                    {Array.isArray(
                      storageErrors.name
                    )
                      ? storageErrors
                          .name[0]
                      : storageErrors
                          .name}
                  </span>
                )}
              </div>
              <div className="form-field">
                <label>
                  Location
                </label>
                <input
                  required
                  name="location"
                  value={
                    storageForm.location
                  }
                  placeholder="Sulaymaniyah - Main Store"
                  onChange={
                    handleStorageChange
                  }
                />
                {storageErrors.location && (
                  <span className="field-error">
                    {Array.isArray(
                      storageErrors.location
                    )
                      ? storageErrors
                          .location[0]
                      : storageErrors
                          .location}
                  </span>
                )}
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={
                    closeStorageModal
                  }
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="primary-action-button"
                  disabled={
                    storageSaving
                  }
                >
                  {storageSaving
                    ? "Saving..."
                    : editingStorage
                      ? "Save Changes"
                      : "Add Storage"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
function SystemInfo({
  title,
  value,
}) {
  return (
    <div className="system-info-item">
      <span>{title}</span>
      <strong>{value}</strong>
    </div>
  );
}
function normalizeTime(value) {
  if (!value) {
    return "";
  }
  return String(value).slice(
    0,
    5
  );
}
function formatDisplayTime(value) {
  if (!value) {
    return "-";
  }
  const [
    hours,
    minutes,
  ] = value
    .split(":")
    .map(Number);
  const date =
    new Date();
  date.setHours(
    hours,
    minutes,
    0,
    0
  );
  return date.toLocaleTimeString(
    "en-US",
    {
      hour: "numeric",
      minute: "2-digit",
    }
  );
}
function formatDateTime(value) {
  if (!value) {
    return "-";
  }
  return new Date(
    value
  ).toLocaleString(
    "en-US",
    {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
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
export default Settings;
