import axios from 'axios';

// Create axios instance with default config
const api = axios.create({
    baseURL: '/api',  // All API calls go through proxy
    withCredentials: true,  // Send cookies for session auth
    headers: {
        'Content-Type': 'application/json'
    }
});

// Add response interceptor for error handling
api.interceptors.response.use(
    response => response,
    error => {
        if (error.response?.status === 401) {
            console.warn('Unauthorized - session may have expired');
            // Optionally redirect to login
            if (window.location.pathname.startsWith('/admin') &&
                !window.location.pathname.includes('login')) {
                window.location.href = '/admin-login';
            }
        }
        return Promise.reject(error);
    }
);

export default api;
