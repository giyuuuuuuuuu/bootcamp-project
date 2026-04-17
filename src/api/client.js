const LOCAL_API_ORIGIN = "http://localhost:3000";
const PRODUCTION_API_BASE_PATH = "/api/v1/tasks";
const REQUEST_TIMEOUT_MS = 8000;

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
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  let response;
  try {
    response = await fetch(url, { ...options, signal: controller.signal });
  } catch (error) {
    window.clearTimeout(timeoutId);
    if (error.name === "AbortError") {
      const timeoutError = new Error("La solicitud superó el tiempo máximo de espera.");
      timeoutError.status = 408;
      throw timeoutError;
    }
    throw error;
  }
  window.clearTimeout(timeoutId);
  const responseText = response.status === 204 ? "" : await response.text();
  const contentType = response.headers.get("content-type") || "";
  const canBeJson =
    contentType.includes("application/json") ||
    responseText.trim().startsWith("{") ||
    responseText.trim().startsWith("[");
  let payload = null;

  if (responseText && canBeJson) {
    try {
      payload = JSON.parse(responseText);
    } catch (_error) {
      payload = null;
    }
  }

  if (!response.ok) {
    const error = new Error(
      payload?.error ||
        (canBeJson
          ? "Error de red"
          : "La API devolvio HTML en lugar de JSON. Revisa rutas /api en Vercel."),
    );
    error.status = response.status;
    throw error;
  }

  if (response.status === 204) {
    return null;
  }

  if (payload !== null) {
    return payload;
  }

  const error = new Error(
    "Respuesta inesperada del servidor: se esperaba JSON valido.",
  );
  error.status = response.status;
  throw error;
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
