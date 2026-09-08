const BASE_URL = "/api/notifications";
export async function getNotifications() {
  const response = await fetch(BASE_URL, {
    headers: {
      Accept: "application/json",
    },
  });
  if (!response.ok) {
    throw new Error(
      "Failed to load notifications"
    );
  }
  return response.json();
}
export async function getUnreadNotifications() {
  const response = await fetch(
    `${BASE_URL}/unread`,
    {
      headers: {
        Accept: "application/json",
      },
    }
  );
  if (!response.ok) {
    throw new Error(
      "Failed to load unread notifications"
    );
  }
  return response.json();
}
export async function getUnreadCount() {
  const response = await fetch(
    `${BASE_URL}/unread-count`,
    {
      headers: {
        Accept: "application/json",
      },
    }
  );
  if (!response.ok) {
    throw new Error(
      "Failed to load unread count"
    );
  }
  return response.json();
}
export async function getNotification(id) {
  const response = await fetch(
    `${BASE_URL}/${id}`,
    {
      headers: {
        Accept: "application/json",
      },
    }
  );
  if (!response.ok) {
    throw new Error(
      "Failed to load notification"
    );
  }
  return response.json();
}
export async function markNotificationRead(id) {
  const response = await fetch(
    `${BASE_URL}/${id}/read`,
    {
      method: "PATCH",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    }
  );
  const result = await response.json();
  if (!response.ok) {
    throw result;
  }
  return result;
}
export async function markAllNotificationsRead() {
  const response = await fetch(
    `${BASE_URL}/read-all`,
    {
      method: "PATCH",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    }
  );
  const result = await response.json();
  if (!response.ok) {
    throw result;
  }
  return result;
}
export async function deleteNotification(id) {
  const response = await fetch(
    `${BASE_URL}/${id}`,
    {
      method: "DELETE",
      headers: {
        Accept: "application/json",
      },
    }
  );
  if (!response.ok) {
    throw new Error(
      "Failed to delete notification"
    );
  }
  return true;
}