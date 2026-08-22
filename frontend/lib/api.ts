/**
 * @file api.ts
 * @description Axios API client and interceptor configurations.
 * @architecture Centralized networking layer for communicating with the backend. Handles token injection, 401 retries, and error unwrapping.
 */
import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

export const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": "69420",
  },
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    // 1. Guard against swallowing login errors: If the request was a login attempt, we don't want to try refreshing the token
    const isLoginRequest = originalRequest.url?.includes('/login');
    
    // 2. 401 Intercept: If the API returns Unauthorized (401), we attempt to seamlessly refresh the token
    if (error.response?.status === 401 && !originalRequest._retry && !isLoginRequest) {
      originalRequest._retry = true; // Mark to prevent infinite refresh loops
      try {
        // Attempt to hit the refresh endpoint. Since we use httpOnly cookies, credentials are sent automatically.
        await axios.post(`${API_URL}/api/auth/refresh`, {}, { withCredentials: true });
        
        // 3. Success: Re-execute the original failed request with the newly issued token
        return api(originalRequest);
      } catch (refreshError) {
        // 4. Failure: The refresh token is also invalid/expired. We must fall back to the login page.
        if (typeof window !== "undefined") {
          const path = window.location.pathname;
          
          // 5. Infinite reload prevention: We only trigger a hard reload if the user isn't ALREADY on the login route
          // The local React component catch blocks will handle the UI state swap (e.g., setStatus("login"))
          if (path.startsWith("/admin") && path !== "/admin") {
            window.location.href = "/admin";
          } else if (path !== "/community" && path !== "/admin") {
            window.location.href = "/community";
          }
        }
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

// Business APIs
export const businessAPI = {
  apply: (data: {
    name: string;
    company: string;
    role: string;
    stage: string;
    email: string;
    phone: string;
  }) => api.post("/business/apply", data),
};

// Auth APIs
export const authAPI = {
  login: (email: string, password: string) =>
    api.post("/auth/login", { email, password }),
  logout: () => api.post("/auth/logout"),
  getMe: () => api.get("/auth/me"),
  refresh: () => api.post("/auth/refresh"),
};

// Admin APIs
export const adminAPI = {
  getStats: () => api.get("/admin/stats"),
  getBusiness: (params?: any) => api.get("/admin/business", { params }),
  getCommunityMembers: (params?: any) =>
    api.get("/admin/community-members", { params }),
  approve: (type: "student" | "business", id: string) =>
    api.patch(`/admin/approve/${type}/${id}`),
  reject: (type: "student" | "business", id: string) =>
    api.patch(`/admin/reject/${type}/${id}`),
  sendBulkEmail: (data: {
    recipients: string[];
    subject: string;
    content: string;
  }) => api.post("/admin/bulk-email", data),
  getOrders: () => api.get("/admin/orders"),
  exportOrders: () => api.get("/admin/orders/export", { responseType: "blob" }),
};

// Community APIs
export const communityAPI = {
  getMembers: (params?: any) => api.get("/community/members", { params }),
  getMe: () => api.get("/community/me"),
  login: (data: any) => api.post("/community/login", data),
  logout: () => api.post("/community/logout"),
  updateProfile: (data: any) => api.put("/community/profile", data),
  uploadPhoto: (data: FormData) =>
    api.post("/community/profile/photo", data, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  checkoutCard: (data: {
    shippingAddress: string;
    fullName: string;
    companyAndDesignation: string;
    email: string;
    phone: string;
  }) => api.post("/community/card/checkout", data),
  getOrderDetails: (orderId: string) =>
    api.get(`/community/card/order/${orderId}`),
};
