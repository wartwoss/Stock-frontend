export async function getStorages() {
  const response = await fetch("/api/storages", {
    headers: {
      Accept: "application/json",
    },
  });
  if (!response.ok) {
    throw new Error("Failed to load storages");
  }
  return response.json();
}

