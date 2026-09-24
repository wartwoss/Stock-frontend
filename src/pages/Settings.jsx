import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toLatinDigits } from "../utils/numbers";
import { runBackup } from "../api/backup";
import { CloudUpload } from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";
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
    Users,
  X,
  Clock3,
  BellRing,
  Play,
  Save,
  MapPin,
  CheckCircle2,
  Palette,
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
  const { t } = useTranslation();
  const [storages, setStorages] =
    useState([]);
  const [loading, setLoading] =
    useState(true);
  const { theme, setTheme, uiScale, setUiScale, fontScale, setFontScale } = useTheme();
  const [backupRunning, setBackupRunning] = useState(false);
  const [backupStatus, setBackupStatus] = useState(null);
  const [backupMessage, setBackupMessage] = useState("");
  const [backupError, setBackupError] = useState("");
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
    } catch {
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
    } catch {
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
            : toLatinDigits(value),
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
        {t("common.loading")}
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
  async function handleRunBackup() {
    try {
      setBackupRunning(true);
      setBackupMessage("");
      setBackupError("");
      const result = await runBackup();
      setBackupMessage(
        "Backup complete! " + (result.filename || "") + " uploaded to Google Drive."
      );
      setBackupStatus({ last_backup: result.backed_up_at });
    } catch (err) {
      setBackupError(err.message || "Backup failed. Check rclone is configured.");
    } finally {
      setBackupRunning(false);
    }
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
          <h2>{t("settings.title")}</h2>
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

        
        {/* CUSTOMERS SETTINGS */}
        <section className="settings-section">
          <div className="settings-section-header">
            <div className="settings-heading">
              <div className="settings-heading-icon">
                <Users size={20} />
              </div>
              <div>
                <h3>{t("navigation.customers")}</h3>
                <p>{t("customers.subtitle", "Manage customers, outstanding debts and credit accounts.")}</p>
              </div>
            </div>
          </div>
          <div className="monitoring-form">
            <Link 
              to="/customers" 
              style={{ display: "inline-block", padding: "10px 16px", backgroundColor: "#7460ff", color: "white", borderRadius: "8px", textDecoration: "none", fontWeight: "600", fontSize: "14px" }}
            >
              {t("navigation.customers")}
            </Link>
          </div>
        </section>

        {/* THEME SETTINGS */}
        <section className="settings-section">
          <div className="settings-section-header">
            <div className="settings-heading">
              <div className="settings-heading-icon">
                <Palette size={20} />
              </div>
              <div>
                <h3>{t("settings.theme.title")}</h3>
                <p>{t("settings.theme.subtitle")}</p>
              </div>
            </div>
          </div>
          <div className="monitoring-form">
            <div className="form-field" style={{ marginBottom: 0 }}>
              <label>{t("settings.theme.label")}</label>
              <select 
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                style={{ width: "100%", maxWidth: "300px", marginTop: "8px", padding: "10px", borderRadius: "8px", border: "1px solid #dfe2e7" }}
              >
                <option value="minimalism">Minimalism (Light Blue & Simple)</option>
                <option value="brutalism">Brutalism (Gray & Sharp Corners)</option>
              </select>
              </div>
            </div>
            <div className="monitoring-form" style={{ marginTop: '20px', display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
              <div className="form-field" style={{ marginBottom: 0, flex: 1, minWidth: '200px' }}>
                <label>{t("settings.theme.uiScale", "UI Scale")}</label>
                <select 
                  value={uiScale}
                  onChange={(e) => setUiScale(parseFloat(e.target.value))}
                  style={{ width: "100%", marginTop: "8px", padding: "10px", borderRadius: "8px", border: "1px solid #dfe2e7" }}
                >
                  <option value="0.8">80% (Small)</option>
                  <option value="0.9">90%</option>
                  <option value="1">100% (Default)</option>
                  <option value="1.1">110%</option>
                  <option value="1.2">120% (Large)</option>
                </select>
              </div>
              <div className="form-field" style={{ marginBottom: 0, flex: 1, minWidth: '200px' }}>
                <label>{t("settings.theme.fontScale", "Font Size")}</label>
                <select 
                  value={fontScale}
                  onChange={(e) => setFontScale(parseFloat(e.target.value))}
                  style={{ width: "100%", marginTop: "8px", padding: "10px", borderRadius: "8px", border: "1px solid #dfe2e7" }}
                >
                  <option value="0.85">Small</option>
                  <option value="1">Normal</option>
                  <option value="1.15">Large</option>
                  <option value="1.3">Extra Large</option>
                </select>
              </div>
            </div>

        </section>


        {/* GOOGLE DRIVE BACKUP */}
        <section className="settings-section">
          <div className="settings-section-header">
            <div className="settings-heading">
              <div className="settings-heading-icon">
                <CloudUpload size={20} />
              </div>
              <div>
                <h3>{t("settings.backup.title")}</h3>
                <p>{t("settings.backup.subtitle")}</p>
              </div>
            </div>
          </div>
          <div className="monitoring-form">
            {backupMessage && (
              <div className="settings-success-message">
                <CheckCircle2 size={16} />
                {backupMessage}
              </div>
            )}
            {backupError && (
              <div className="form-general-error">{backupError}</div>
            )}
            {backupStatus?.last_backup && (
              <div className="monitoring-status-card" style={{ marginBottom: "14px" }}>
                <div className="monitoring-status-icon">
                  <CheckCircle2 size={19} />
                </div>
                <div>
                  <span>{t("settings.backup.lastBackup")}</span>
                  <strong>
                    {new Date(backupStatus.last_backup).toLocaleString("en-US", {
                      year: "numeric", month: "short", day: "numeric",
                      hour: "numeric", minute: "2-digit"
                    })}
                  </strong>
                </div>
              </div>
            )}
            <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
              <button
                type="button"
                className="primary-action-button"
                onClick={handleRunBackup}
                disabled={backupRunning}
                style={{ display: "flex", alignItems: "center", gap: "7px" }}
              >
                <CloudUpload size={15} />
                {backupRunning ? "Backing up..." : "Backup to Google Drive"}
              </button>
              <span style={{ fontSize: "11px", color: "#969ca7" }}>
                Saves a .sql file locally and uploads to your configured Google Drive.
              </span>
            </div>
          </div>
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
                  type="text"
                  inputMode="numeric"
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


