export async function runBackup() {
  const response = await fetch("/api/backup/run", {
    method: "POST",
    headers: { Accept: "application/json" },
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || "Backup failed.");
  }
  return data;
}

export async function getBackupStatus() {
  const response = await fetch("/api/backup/status", {
    headers: { Accept: "application/json" },
  });
  if (!response.ok) return null;
  return response.json();
}
