import {
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  Bell,
  BellRing,
  CheckCheck,
  Clock3,
  AlertTriangle,
  CalendarClock,
  Trash2,
  Eye,
  X,
  UserRound,
  CreditCard,
} from "lucide-react";
import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
} from "../api/notifications";
function Notifications() {
  const [
    notifications,
    setNotifications,
  ] = useState([]);
  const [filter, setFilter] =
    useState("all");
  const [loading, setLoading] =
    useState(true);
  const [error, setError] =
    useState("");
  const [
    selectedNotification,
    setSelectedNotification,
  ] = useState(null);
  const [detailOpen, setDetailOpen] =
    useState(false);
  const [workingId, setWorkingId] =
    useState(null);
  const [markingAll, setMarkingAll] =
    useState(false);
  useEffect(() => {
    loadNotifications();
  }, []);
  async function loadNotifications() {
    try {
      setLoading(true);
      setError("");
      const data =
        await getNotifications();
      setNotifications(data);
    } catch (err) {
      setError(
        "Could not load notifications."
      );
    } finally {
      setLoading(false);
    }
  }
  const unreadCount =
    notifications.filter(
      (notification) =>
        !notification.is_read
    ).length;
  const activeCount =
    notifications.filter(
      (notification) =>
        !notification.resolved_at
    ).length;
  const resolvedCount =
    notifications.filter(
      (notification) =>
        notification.resolved_at
    ).length;
  const filteredNotifications =
    useMemo(() => {
      switch (filter) {
        case "unread":
          return notifications.filter(
            (notification) =>
              !notification.is_read
          );
        case "active":
          return notifications.filter(
            (notification) =>
              !notification.resolved_at
          );
        case "resolved":
          return notifications.filter(
            (notification) =>
              notification.resolved_at
          );
        default:
          return notifications;
      }
    }, [
      notifications,
      filter,
    ]);
  async function handleMarkRead(
    notification
  ) {
    if (notification.is_read) {
      return;
    }
    try {
      setWorkingId(
        notification.id
      );
      await markNotificationRead(
        notification.id
      );
      setNotifications(
        (current) =>
          current.map((item) =>
            item.id ===
            notification.id
              ? {
                  ...item,
                  is_read: true,
                }
              : item
          )
      );
      if (
        selectedNotification?.id ===
        notification.id
      ) {
        setSelectedNotification(
          (current) => ({
            ...current,
            is_read: true,
          })
        );
      }
    } catch (err) {
      alert(
        "Could not mark notification as read."
      );
    } finally {
      setWorkingId(null);
    }
  }
  async function handleMarkAllRead() {
    if (unreadCount === 0) {
      return;
    }
    try {
      setMarkingAll(true);
      await markAllNotificationsRead();
      setNotifications(
        (current) =>
          current.map(
            (notification) => ({
              ...notification,
              is_read: true,
            })
          )
      );
    } catch (err) {
      alert(
        "Could not mark notifications as read."
      );
    } finally {
      setMarkingAll(false);
    }
  }
  async function handleDelete(
    notification
  ) {
    const confirmed =
      window.confirm(
        `Delete "${notification.title}"?`
      );
    if (!confirmed) return;
    try {
      setWorkingId(
        notification.id
      );
      await deleteNotification(
        notification.id
      );
      setNotifications(
        (current) =>
          current.filter(
            (item) =>
              item.id !==
              notification.id
          )
      );
      if (
        selectedNotification?.id ===
        notification.id
      ) {
        setDetailOpen(false);
        setSelectedNotification(null);
      }
    } catch (err) {
      alert(
        "Could not delete notification."
      );
    } finally {
      setWorkingId(null);
    }
  }
  async function openDetails(
    notification
  ) {
    setSelectedNotification(
      notification
    );
    setDetailOpen(true);
    if (!notification.is_read) {
      await handleMarkRead(
        notification
      );
    }
  }
  function closeDetails() {
    setDetailOpen(false);
    setSelectedNotification(null);
  }
  return (
    <div className="notifications-page">
      <div className="page-toolbar">
        <div>
          <h2>Notifications</h2>
          <p>
            Track upcoming, due and
            overdue installment alerts.
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            className="secondary-button notification-read-all"
            onClick={
              handleMarkAllRead
            }
            disabled={markingAll}
          >
            <CheckCheck size={17} />
            {markingAll
              ? "Marking..."
              : "Mark All Read"}
          </button>
        )}
      </div>
      <section className="notification-summary">
        <NotificationSummary
          icon={<Bell size={20} />}
          title="Total"
          value={
            notifications.length
          }
        />
        <NotificationSummary
          icon={
            <BellRing size={20} />
          }
          title="Unread"
          value={unreadCount}
        />
        <NotificationSummary
          icon={
            <AlertTriangle
              size={20}
            />
          }
          title="Active Alerts"
          value={activeCount}
        />
        <NotificationSummary
          icon={
            <CheckCheck size={20} />
          }
          title="Resolved"
          value={resolvedCount}
        />
      </section>
      <div className="content-card">
        <div className="notification-controls">
          <NotificationTab
            label="All"
            value="all"
            selected={filter}
            count={
              notifications.length
            }
            onClick={setFilter}
          />
          <NotificationTab
            label="Unread"
            value="unread"
            selected={filter}
            count={unreadCount}
            onClick={setFilter}
          />
          <NotificationTab
            label="Active"
            value="active"
            selected={filter}
            count={activeCount}
            onClick={setFilter}
          />
          <NotificationTab
            label="Resolved"
            value="resolved"
            selected={filter}
            count={resolvedCount}
            onClick={setFilter}
          />
        </div>
        {loading ? (
          <div className="table-state">
            Loading notifications...
          </div>
        ) : error ? (
          <div className="table-state table-error">
            <p>{error}</p>
            <button
              className="secondary-button"
              onClick={
                loadNotifications
              }
            >
              Try Again
            </button>
          </div>
        ) : filteredNotifications.length ===
          0 ? (
          <div className="empty-appliances">
            <div className="empty-icon">
              <Bell size={28} />
            </div>
            <h3>
              No notifications
            </h3>
            <p>
              Payment alerts will
              appear here automatically.
            </p>
          </div>
        ) : (
          <div className="notification-list">
            {filteredNotifications.map(
              (notification) => (
                <div
                  key={
                    notification.id
                  }
                  className={
                    notification.is_read
                      ? "notification-item"
                      : "notification-item unread"
                  }
                >
                  <div
                    className={`notification-type-icon ${getNotificationClass(
                      notification.type
                    )}`}
                  >
                    {getNotificationIcon(
                      notification.type
                    )}
                  </div>
                  <div className="notification-main">
                    <div className="notification-title-row">
                      <div>
                        <h3>
                          {
                            notification.title
                          }
                        </h3>
                        {!notification.is_read && (
                          <span className="unread-dot" />
                        )}
                      </div>
                      <span className="notification-time">
                        {formatDateTime(
                          notification.created_at
                        )}
                      </span>
                    </div>
                    <p>
                      {
                        notification.message
                      }
                    </p>
                    <div className="notification-meta">
                      <NotificationTypeBadge
                        type={
                          notification.type
                        }
                      />
                      <span
                        className={
                          notification.resolved_at
                            ? "resolution-badge resolved"
                            : "resolution-badge active"
                        }
                      >
                        {notification.resolved_at
                          ? "Resolved"
                          : "Needs Attention"}
                      </span>
                      <span
                        className={
                          notification.is_read
                            ? "read-status read"
                            : "read-status unread-status"
                        }
                      >
                        {notification.is_read
                          ? "Read"
                          : "Unread"}
                      </span>
                    </div>
                  </div>
                  <div className="notification-actions">
                    <button
                      className="icon-button"
                      title="View"
                      onClick={() =>
                        openDetails(
                          notification
                        )
                      }
                    >
                      <Eye size={16} />
                    </button>
                    {!notification.is_read && (
                      <button
                        className="notification-check-button"
                        title="Mark as read"
                        disabled={
                          workingId ===
                          notification.id
                        }
                        onClick={() =>
                          handleMarkRead(
                            notification
                          )
                        }
                      >
                        <CheckCheck
                          size={16}
                        />
                      </button>
                    )}
                    <button
                      className="icon-button delete-button"
                      title="Delete"
                      disabled={
                        workingId ===
                        notification.id
                      }
                      onClick={() =>
                        handleDelete(
                          notification
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
      </div>
      {/* DETAIL MODAL */}
      {detailOpen &&
        selectedNotification && (
          <div
            className="modal-backdrop"
            onMouseDown={
              closeDetails
            }
          >
            <div
              className="app-modal notification-detail-modal"
              onMouseDown={(event) =>
                event.stopPropagation()
              }
            >
              <div className="modal-header">
                <div>
                  <h2>
                    Notification
                  </h2>
                  <p>
                    Payment monitoring
                    alert details.
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
              <div className="notification-detail-body">
                <div
                  className={`notification-detail-heading ${getNotificationClass(
                    selectedNotification.type
                  )}`}
                >
                  <div className="notification-large-icon">
                    {getNotificationIcon(
                      selectedNotification.type,
                      24
                    )}
                  </div>
                  <div>
                    <span>
                      {formatNotificationType(
                        selectedNotification.type
                      )}
                    </span>
                    <h3>
                      {
                        selectedNotification.title
                      }
                    </h3>
                  </div>
                </div>
                <div className="notification-message-box">
                  {
                    selectedNotification.message
                  }
                </div>
                <div className="notification-detail-grid">
                  <NotificationDetail
                    icon={
                      <CreditCard
                        size={15}
                      />
                    }
                    title="Credit"
                    value={
                      `#${selectedNotification.credit_id}`
                    }
                  />
                  <NotificationDetail
                    icon={
                      <Clock3
                        size={15}
                      />
                    }
                    title="Created"
                    value={
                      formatDateTime(
                        selectedNotification.created_at
                      )
                    }
                  />
                  <NotificationDetail
                    icon={
                      <Eye size={15} />
                    }
                    title="Viewed"
                    value={
                      selectedNotification.is_read
                        ? "Yes"
                        : "No"
                    }
                  />
                  <NotificationDetail
                    icon={
                      <CheckCheck
                        size={15}
                      />
                    }
                    title="Issue Status"
                    value={
                      selectedNotification.resolved_at
                        ? "Resolved"
                        : "Active"
                    }
                  />
                </div>
                {selectedNotification.credit && (
                  <div className="notification-credit-preview">
                    <div className="notification-credit-title">
                      <UserRound
                        size={17}
                      />
                      Credit Account
                    </div>
                    <div className="notification-credit-values">
                      <div>
                        <span>
                          Customer
                        </span>
                        <strong>
                          {selectedNotification
                            .credit
                            .customer
                            ?.name ??
                            "Unknown"}
                        </strong>
                      </div>
                      <div>
                        <span>
                          Remaining Debt
                        </span>
                        <strong>
                          {formatMoney(
                            selectedNotification
                              .credit
                              .remaining_debt
                          )}
                        </strong>
                      </div>
                      <div>
                        <span>
                          Next Due
                        </span>
                        <strong>
                          {formatDate(
                            selectedNotification
                              .credit
                              .next_due_date
                          )}
                        </strong>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
    </div>
  );
}
function NotificationSummary({
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
function NotificationTab({
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
          ? "notification-tab active"
          : "notification-tab"
      }
      onClick={() =>
        onClick(value)
      }
    >
      {label}
      <span>
        {count}
      </span>
    </button>
  );
}
function NotificationTypeBadge({
  type,
}) {
  return (
    <span
      className={`notification-type-badge ${getNotificationClass(
        type
      )}`}
    >
      {formatNotificationType(
        type
      )}
    </span>
  );
}
function NotificationDetail({
  icon,
  title,
  value,
}) {
  return (
    <div className="notification-detail-value">
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
function getNotificationClass(
  type
) {
  switch (type) {
    case "overdue":
      return "overdue";
    case "due_today":
      return "today";
    case "due_soon":
      return "soon";
    default:
      return "general";
  }
}
function formatNotificationType(
  type
) {
  switch (type) {
    case "overdue":
      return "Overdue";
    case "due_today":
      return "Due Today";
    case "due_soon":
      return "Due Soon";
    default:
      return "Notification";
  }
}
function getNotificationIcon(
  type,
  size = 18
) {
  switch (type) {
    case "overdue":
      return (
        <AlertTriangle
          size={size}
        />
      );
    case "due_today":
      return (
        <CalendarClock
          size={size}
        />
      );
    case "due_soon":
      return (
        <Clock3 size={size} />
      );
    default:
      return (
        <Bell size={size} />
      );
  }
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
  if (!year || !month || !day) {
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
function formatDateTime(value) {
  if (!value) {
    return "-";
  }
  const date =
    new Date(value);
  return date.toLocaleString(
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
export default Notifications;