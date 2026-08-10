import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001";

export const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": "69420",
  },
  withCredentials: true,
});

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
  getCommunityMembers: (params?: any) => api.get("/admin/community-members", { params }),
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
  getOrderDetails: (orderId: string) => api.get(`/community/card/order/${orderId}`),
};
