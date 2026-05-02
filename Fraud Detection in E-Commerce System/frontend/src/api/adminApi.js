import axios from "axios";

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:4000",
  withCredentials: true
});

const authStorageKey = "admin_token";

const setAuthToken = (token) => {
  if (token) {
    apiClient.defaults.headers.common.Authorization = `Bearer ${token}`;
    localStorage.setItem(authStorageKey, token);
  } else {
    delete apiClient.defaults.headers.common.Authorization;
    localStorage.removeItem(authStorageKey);
  }
};

const initAuthToken = () => {
  const token = localStorage.getItem(authStorageKey);
  if (token) {
    apiClient.defaults.headers.common.Authorization = `Bearer ${token}`;
  }
};

initAuthToken();

export const fetchAdminSession = async () => {
  const { data } = await apiClient.get("/api/admin/session");
  return data;
};

export const loginAdmin = async (username, password) => {
  const { data } = await apiClient.post("/api/admin/login", { username, password });
  if (data.token) {
    setAuthToken(data.token);
  }
  return data;
};

export const logoutAdmin = async () => {
  const { data } = await apiClient.post("/api/admin/logout");
  setAuthToken(null);
  return data;
};

export const fetchDashboardStats = async () => {
  const { data } = await apiClient.get("/api/admin/dashboard-stats");
  return data;
};

export const fetchRecentTransactions = async (query = {}) => {
  const { data } = await apiClient.get("/api/admin/recent-transactions", {
    params: query
  });
  return data.transactions;
};

export const bulkReviewTransactions = async (transactionIds, action) => {
  const { data } = await apiClient.post("/api/admin/bulk-review", {
    transactionIds,
    action,
    reviewedBy: "fraud.analyst@finops.local"
  });
  return data;
};

export const fetchFraudLogs = async () => {
  const { data } = await apiClient.get("/api/admin/fraud-logs");
  return data.logs;
};

export const fetchUsers = async () => {
  const { data } = await apiClient.get("/api/admin/users");
  return data.users;
};

export const reviewTransaction = async (transactionId, action) => {
  const { data } = await apiClient.post("/api/admin/review-transaction", {
    transactionId,
    action,
    reviewedBy: "fraud.analyst@finops.local"
  });

  return data;
};

export const submitCheckout = async (payload) => {
  const { data } = await apiClient.post("/api/checkout", payload);
  return data;
};

export const analyzeDatasetUpload = async (file) => {
  const formData = new FormData();
  formData.append("dataset", file);

  const { data } = await apiClient.post("/api/admin/analyze-dataset", formData, {
    headers: {
      "Content-Type": "multipart/form-data"
    }
  });

  return data.result;
};
