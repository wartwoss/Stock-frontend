const BASE_URL = "/api/payments";
export async function getPayments() {
  const response = await fetch(BASE_URL, {
    headers: {
      Accept: "application/json",
    },
  });
  if (!response.ok) {
    throw new Error("Failed to load payments");
  }
  return response.json();
}
export async function getPayment(id) {
  const response = await fetch(
    `${BASE_URL}/${id}`,
    {
      headers: {
        Accept: "application/json",
      },
    }
  );
  if (!response.ok) {
    throw new Error("Failed to load payment");
  }
  return response.json();
}
export async function getPaymentsByCredit(
  creditId
) {
  const response = await fetch(
    `/api/credits/${creditId}/payments`,
    {
      headers: {
        Accept: "application/json",
      },
    }
  );
  if (!response.ok) {
    throw new Error(
      "Failed to load credit payments"
    );
  }
  return response.json();
}
export async function recordPayment(
  creditId,
  data
) {
  const response = await fetch(
    `/api/credits/${creditId}/payments`,
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