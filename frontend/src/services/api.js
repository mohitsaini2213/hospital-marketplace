import axios from 'axios';

export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // send the HTTP-only refresh cookie
});

// In-memory access token — deliberately NOT localStorage, so it can't be
// read by injected/third-party scripts. It's lost on hard refresh, which is
// fine: /api/auth/refresh (using the HTTP-only cookie) silently restores it.
let accessToken = null;
let onUnauthorized = () => {};

export const setAccessToken = (token) => {
  accessToken = token;
};
export const getAccessToken = () => accessToken;
export const setUnauthorizedHandler = (fn) => {
  onUnauthorized = fn;
};

api.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

let refreshPromise = null;

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    const status = error.response?.status;

    if (status === 401 && !original._retry && !original.url.includes('/auth/')) {
      original._retry = true;
      try {
        refreshPromise = refreshPromise || api.post('/auth/refresh');
        const { data } = await refreshPromise;
        refreshPromise = null;
        setAccessToken(data.accessToken);
        original.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(original);
      } catch (refreshErr) {
        refreshPromise = null;
        setAccessToken(null);
        onUnauthorized();
        return Promise.reject(refreshErr);
      }
    }

    return Promise.reject(error);
  }
);

// Normalizes backend error shape { success:false, message, details } into a
// plain string + field-level details so forms can show inline errors.
export const parseApiError = (err) => {
  const res = err?.response?.data;
  if (res?.message) return { message: res.message, details: res.details || null };
  if (err?.message === 'Network Error') {
    return { message: 'Unable to connect to the server. Please check your connection and try again.', details: null };
  }
  return { message: 'Something went wrong. Please try again.', details: null };
};

export default api;
