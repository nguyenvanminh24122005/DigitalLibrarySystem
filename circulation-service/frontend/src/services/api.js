import axios from "axios";

const gatewayUrl = import.meta.env.VITE_API_GATEWAY_URL;
export const LOCAL_API = `http://${window.location.hostname}:5002`;
const routeFallbackListeners = new Set();
const unauthorizedListeners = new Set();

console.log("Gateway URL:", import.meta.env.VITE_API_GATEWAY_URL);
console.log("Fallback URL:", LOCAL_API);

const api = axios.create({
  baseURL: `${gatewayUrl}/api/v1/circulation`,
  timeout: 10000,
  headers: {
    "ngrok-skip-browser-warning": "true"
  }
});

export const localApi = axios.create({
  baseURL: `${LOCAL_API}/api`,
  timeout: 10000
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

function notifyRouteFallback() {
  routeFallbackListeners.forEach((listener) => listener(true));
}

function notifyUnauthorized() {
  localStorage.removeItem("token");
  unauthorizedListeners.forEach((listener) => listener());
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      notifyUnauthorized();
      throw error;
    }

    if (error.response && error.response.status < 500 && error.response.status !== 404) {
      throw error;
    }

    if (error.config?.method?.toLowerCase() !== "get") {
      throw error;
    }

    notifyRouteFallback();

    const { method, url, data, params } = error.config;
    return localApi.request({ method, url, data, params });
  }
);

export function login(username, password) {
  return axios.post(`${gatewayUrl}/api/v1/identity/login`, { username, password }, {
    timeout: 10000,
    headers: {
      "ngrok-skip-browser-warning": "true"
    }
  });
}

export function checkGatewayConnection() {
  return axios.get(`${gatewayUrl}/health`, {
    timeout: 10000,
    headers: {
      "ngrok-skip-browser-warning": "true"
    }
  });
}

export function onGatewayRouteFallback(listener) {
  routeFallbackListeners.add(listener);
  return () => routeFallbackListeners.delete(listener);
}

export function onUnauthorized(listener) {
  unauthorizedListeners.add(listener);
  return () => unauthorizedListeners.delete(listener);
}

export default api;
