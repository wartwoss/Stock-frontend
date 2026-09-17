export async function getDashboard(filters = {}) {
  const queryParams = new URLSearchParams(filters).toString();
  const url = queryParams ? `/api/dashboard?${queryParams}` : "/api/dashboard";
  
  const response = await fetch(url, {
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