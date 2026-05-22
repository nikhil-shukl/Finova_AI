const trimUrl = (value = "") => String(value).trim().replace(/\/+$/, "");

const configuredBackend = trimUrl(import.meta.env.VITE_BACKEND_URL);
const configuredApi = trimUrl(import.meta.env.VITE_API_URL);
const apiAsBackend = configuredApi.endsWith("/api")
  ? configuredApi.slice(0, -4)
  : configuredApi;

export const API_ORIGIN = configuredBackend || apiAsBackend || "http://localhost:5000";
export const API_BASE = API_ORIGIN.endsWith("/api")
  ? API_ORIGIN
  : `${API_ORIGIN}/api`;
