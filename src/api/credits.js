const BASE_URL = "/api/credits";
export async function getCredits() {
  const response = await fetch(BASE_URL, {
    headers: {
      Accept: "application/json",
    },
  });
  if (!response.ok) {
    throw new Error("Failed to load credits");
  }
  return response.json();
}
export async function getCredit(id) {
  const response = await fetch(
    `${BASE_URL}/${id}`,
    {
      headers: {
        Accept: "application/json",
      },
    }
  );
  if (!response.ok) {
    throw new Error("Failed to load credit");
  }
  return response.json();
}
export async function getCreditSummary(id) {
  const response = await fetch(
    `${BASE_URL}/${id}/summary`,
    {
      headers: {
        Accept: "application/json",
      },
    }
  );
  if (!response.ok) {
    throw new Error(
      "Failed to load credit summary"
    );
  }
  return response.json();
}
export async function createCredit(data) {
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
export async function getUpcomingCredits(
  days = 7
) {
  const response = await fetch(
    `${BASE_URL}/upcoming?days=${days}`,
    {
      headers: {
        Accept: "application/json",
      },
    }
  );
  if (!response.ok) {
    throw new Error(
      "Failed to load upcoming credits"
    );
  }
  return response.json();
}
export async function getOverdueCredits() {
  const response = await fetch(
    `${BASE_URL}/overdue`,
    {
      headers: {
        Accept: "application/json",
      },
    }
  );
  if (!response.ok) {
    throw new Error(
      "Failed to load overdue credits"
    );
  }
  return response.json();
}
export async function getCompletedCredits() {
  const response = await fetch(
    `${BASE_URL}/completed`,
    {
      headers: {
        Accept: "application/json",
      },
    }
  );
  if (!response.ok) {
    throw new Error(
      "Failed to load completed credits"
    );
  }
  return response.json();
}
