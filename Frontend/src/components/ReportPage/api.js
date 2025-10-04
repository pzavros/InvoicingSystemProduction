import axios from "axios";

// Use empty string to rely on Vite proxy configuration in development
// In production, use the full API URL
const API_BASE_URL = import.meta.env.PROD 
  ? (import.meta.env.VITE_APP_API_BASE_URL || 'http://localhost:5000')
  : ''; // Use Vite proxy in development

const reportApi = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

// Add token to requests if available
reportApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token expiration
reportApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export async function downloadLogisticsReport({ from, to, statusIds, columns = [] }) {
  const params = new URLSearchParams();
  params.append("from", from.toISOString());
  params.append("to",   to.toISOString());
  // append each statusId as repeated query param
  statusIds.forEach(id => params.append("statusIds", id));
  // append each selected column as repeated query param
  columns.forEach(col => params.append("columns", col));

  const url = `/api/reports/logistics?${params.toString()}`;
  
  try {
    const response = await reportApi.get(url, {
      responseType: 'blob',
      headers: {
        Accept: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      },
    });
    
    const blob = response.data;
    const filename = `LogisticsReport_${from
      .toISOString()
      .slice(0, 10)}_to_${to.toISOString().slice(0, 10)}.xlsx`;

    // trigger browser download
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  } catch (error) {
    console.error("Error downloading logistics report:", error);
    throw new Error("Failed to download report");
  }
}

export default reportApi;
