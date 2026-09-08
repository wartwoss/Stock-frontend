const BASE_URL = "/api/storages";
export async function getStorages() {
  const response = await fetch(BASE_URL, {
    headers: {
      Accept: "application/json",
    },
  });
  if (!response.ok) {
    throw new Error("Failed to load storages");
  }
  return response.json();
}
export async function createStorage(data) {
  const response = await fetch(BASE_URL, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  const result = await response.json();
  if (!response.ok) {
    throw result;
  }
  return result;
}
export async function updateStorage(id, data) {
  const response = await fetch(
    `${BASE_URL}/${id}`,
    {
      method: "PATCH",
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
export async function deleteStorage(id) {
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
      "Failed to delete storage"
    );
  }
  return true;
}