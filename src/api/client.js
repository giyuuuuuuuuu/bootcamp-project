const LOCAL_API_ORIGIN = "http://localhost:3000";
const PRODUCTION_API_BASE_PATH = "/api/v1/tasks";

function getBaseUrl() {
  const hostname = window.location.hostname;
  const isLocalhost =
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname === "0.0.0.0";

  if (isLocalhost) {
    return `${LOCAL_API_ORIGIN}/api/v1/tasks`;
  }

  return PRODUCTION_API_BASE_PATH;
}

const BASE_URL = getBaseUrl();

async function request(url, options = {}) {
  const response = await fetch(url, options);

  if (!response.ok) {
    let payload = null;

    try {
      payload = await response.json();
    } catch (_error) {
      payload = null;
    }

    const error = new Error(payload?.error || "Error de red");
    error.status = response.status;
    throw error;
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

export async function getTasks() {
  return request(BASE_URL);
}

export async function createTask(data) {
  return request(BASE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
}

export async function deleteTask(id) {
  return request(`${BASE_URL}/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}

export async function updateTask(id, data) {
  return request(`${BASE_URL}/${encodeURIComponent(id)}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
}

export async function completeAllTasks() {
  return request(`${BASE_URL}/actions/complete-all`, {
    method: "POST",
  });
}

export async function clearCompletedTasks() {
  return request(`${BASE_URL}/actions/completed`, {
    method: "DELETE",
  });
}
