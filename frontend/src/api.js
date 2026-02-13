const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5005";

export const API_URLS = {
    AUTH: `${API_BASE_URL}/api/auth`,
    MEDICINES: `${API_BASE_URL}/api/medicines`,
    BULK_UPLOAD: `${API_BASE_URL}/api/medicines/bulk-upload`,
    BILLS: `${API_BASE_URL}/api/bills`,
    STORES: `${API_BASE_URL}/api/stores`,
    ORDERS: `${API_BASE_URL}/api/orders`,
    VAULT: `${API_BASE_URL}/api/vault`,
    REVIEWS: `${API_BASE_URL}/api/reviews`,
    CHAT: `${API_BASE_URL}/api/chat`,
};

export default API_BASE_URL;
