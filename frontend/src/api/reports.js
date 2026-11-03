const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export async function listReports(limit = 100, offset = 0) {
  const res = await fetch(`${API_BASE}/api/reports?limit=${limit}&offset=${offset}`);
  if (!res.ok) {
    throw new Error(`Failed to fetch reports (${res.status} ${res.statusText})`);
  }
  return res.json();
}

export async function getReport(reportId) {
  const res = await fetch(`${API_BASE}/api/reports/${reportId}`);
  if (!res.ok) {
    throw new Error(`Failed to fetch report (${res.status} ${res.statusText})`);
  }
  return res.json();
}

export async function createReport(data) {
  const res = await fetch(`${API_BASE}/api/reports`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || `Failed to create report (${res.status})`);
  }
  return res.json();
}

export async function deleteReport(reportId) {
  const res = await fetch(`${API_BASE}/api/reports/${reportId}`, {
    method: 'DELETE',
  });
  if (!res.ok && res.status !== 204) {
    throw new Error(`Failed to delete report (${res.status})`);
  }
  return true;
}
