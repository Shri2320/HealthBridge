import axios from 'axios';

// Create a central "client" for all your requests
const api = axios.create({
    baseURL: 'http://localhost:8080/api', // The address of your backend
    headers: {
        'Content-Type': 'application/json',
    }
});

// Automatically add the Token to every request (if we have one)
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token'); // Grab token from browser storage
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;