import axios from "axios";

const mlClient = axios.create({
  baseURL: process.env.ML_SERVICE_URL || "http://127.0.0.1:8000",
  timeout: Number(process.env.REQUEST_TIMEOUT_MS) || 5000
});

export const predictFraud = async (payload) => {
  try {
    const { data } = await mlClient.post("/predict_fraud", payload);
    return data;
  } catch (error) {
    const upstreamMessage =
      error.response?.data?.detail ||
      error.response?.data?.message ||
      error.message;

    const wrappedError = new Error(`ML service error: ${upstreamMessage}`);
    wrappedError.statusCode = 502;
    throw wrappedError;
  }
};
