import axios from "axios";

// ============================================================
// MESSINA GALLERY API URL
// ============================================================

export const API_URL =
  import.meta.env.VITE_API_URL;

if (!API_URL) {
  throw new Error(
    "VITE_API_URL is missing. Add it to frontend/.env"
  );
}

// ============================================================
// AXIOS INSTANCE
// ============================================================

const api =
  axios.create({
    baseURL:
      API_URL,

    headers: {
      Accept:
        "application/json",
    },
  });

// ============================================================
// JWT TOKEN
// ============================================================

api.interceptors.request.use(
  (
    config
  ) => {
    const token =
      localStorage.getItem(
        "token"
      );

    if (
      token
    ) {
      config.headers.Authorization =
        `Bearer ${token}`;
    }

    return config;
  },

  (
    error
  ) =>
    Promise.reject(
      error
    )
);

// ============================================================
// EXPORT
// ============================================================

export default api;