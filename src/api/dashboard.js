export async function getDashboard() {
  const response = await fetch("/api/dashboard", {
    headers: {
      Accept: "application/json",
    },
  });
  if (!response.ok) {
    throw new Error(
      "Failed to load dashboard data"
    );
  }
  return response.json();
}