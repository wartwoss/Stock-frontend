const BASE_URL = "/api/inventory";
export async function getInventory() {
  const response = await fetch(BASE_URL, {
    headers: {
      Accept: "application/json",
    },
  });
  if (!response.ok) {
    throw new Error("Failed to load inventory");
  }
  return response.json();
}
export async function stockIn(data) {
  const response = await fetch(
    `${BASE_URL}/stock-in`,
    {
      method: "POST",
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
export async function adjustInventory(
  inventoryId,
  adjustment
) {
  const response = await fetch(
    `${BASE_URL}/${inventoryId}/adjust`,
    {
      method: "PATCH",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        adjustment,
      }),
    }
  );
  const result = await response.json();
  if (!response.ok) {
    throw result;
  }
  return result;
}
