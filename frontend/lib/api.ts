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

// Student APIs
export const studentAPI = {
  apply: (data: {
    name: string;
    college: string;
    course: string;
    email: string;
  }) => api.post("/student/apply", data),
  sendOTP: (email: string) => api.post("/student/send-otp", { email }),
  verifyOTP: (email: string, otp: string) =>
    api.post("/student/verify-otp", { email, otp }),
  submitID: (email: string, idCardLink: string) =>
    api.post("/student/submit-id", { email, idCardLink }),
};

// Business APIs
export const businessAPI = {
  apply: (data: {
    name: string;
    company: string;
    role: string;
    stage: string;
    email: string;
  }) => api.post("/business/apply", data),
};

// Auth APIs
export const authAPI = {
  login: (email: string, password: string) =>
    api.post("/auth/login", { email, password }),
  logout: () => api.post("/auth/logout"),
};

// Admin APIs
export const adminAPI = {
  getStats: () => api.get("/admin/stats"),
  getStudents: (params?: any) => api.get("/admin/students", { params }),
  getBusiness: (params?: any) => api.get("/admin/business", { params }),
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
};
