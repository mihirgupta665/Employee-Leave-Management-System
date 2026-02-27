import axios from "axios";

const normalizeBaseUrl = (value) => value.replace(/\/+$/, "");
const apiBaseUrl = normalizeBaseUrl(import.meta.env.VITE_API_BASE_URL || "/api");

const client = axios.create({
  baseURL: apiBaseUrl
});

client.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default client;
