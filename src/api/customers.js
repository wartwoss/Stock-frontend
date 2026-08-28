const BASE_URL = "/api/customers";
export async function getCustomers() {
  const response = await fetch(BASE_URL, {
    headers: {
      Accept: "application/json",
    },
  });
  if (!response.ok) {
    throw new Error(
      "Failed to load customers"
    );
  }
  return response.json();
}
export async function getCustomer(id) {
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
      "Failed to load customer"
    );
  }
  return response.json();
}
export async function createCustomer(data) {
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
export async function updateCustomer(
  id,
  data
) {
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
export async function deleteCustomer(id) {
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
    const result =
      await response.json();
    throw result;
  }
  return true;
}