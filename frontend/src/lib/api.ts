import axios from 'axios';

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api',
    timeout: 10000,
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
    // Read from zustand persisted store in localStorage
    if (typeof window !== 'undefined') {
        const raw = localStorage.getItem('pharma-auth');
        if (raw) {
            try {
                const { state } = JSON.parse(raw);
                if (state?.token) {
                    config.headers.Authorization = `Bearer ${state.token}`;
                }
            } catch { }
        }
    }
    return config;
});

// Handle 401 globally
api.interceptors.response.use(
    (res) => res,
    (err) => {
        if (err.response?.status === 401 && typeof window !== 'undefined') {
            localStorage.removeItem('pharma-auth');
            window.location.href = '/login';
        }
        return Promise.reject(err);
    }
);

export default api;
