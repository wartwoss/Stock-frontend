const BASE_URL =
  "/api/payment-monitoring";
export async function getMonitoringSettings() {
  const response = await fetch(
    `${BASE_URL}/settings`,
    {
      headers: {
        Accept: "application/json",
      },
    }
  );
  if (!response.ok) {
    throw new Error(
      "Failed to load monitoring settings"
    );
  }
  return response.json();
}
export async function updateMonitoringSettings(
  data
) {
  const response = await fetch(
    `${BASE_URL}/settings`,
    {
      method: "PUT",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    }
  );
  const result = await response.json();
  if (!response.ok) {
    throw result;
  }
  return result;
}
export async function runMonitoringNow() {
  const response = await fetch(
    `${BASE_URL}/run-now`,
    {
      method: "POST",
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
export async function getMonitoringStatus() {
  const response = await fetch(
    `${BASE_URL}/status`,
    {
      headers: {
        Accept: "application/json",
      },
    }
  );
  if (!response.ok) {
    throw new Error(
      "Failed to load monitoring status"
    );
  }
  return response.json();
}