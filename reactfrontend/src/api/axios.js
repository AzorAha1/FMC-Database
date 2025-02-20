import axios from 'axios';
// const BASE_URL = 'http://100.0.1.60:5003';
// const BASE_URL = 'http://hrmanagement.local:5003'
const BASE_URL = 'http://192.168.1.105:5003'
// const BASE_URL = 'http://localhost:5003'
const instance = axios.create({
    baseURL: BASE_URL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
});

// Add request interceptor to handle errors
instance.interceptors.request.use(
    config => {
        return config;
    },
    error => {
        console.error('Request error:', error);
        return Promise.reject(error);
    }
);

// Add response interceptor to handle errors
instance.interceptors.response.use(
    response => response,
    error => {
        if (error.response) {
            console.error('Response error:', error.response.data);
        } else if (error.request) {
            console.error('No response received:', error.request);
        } else {
            console.error('Error setting up request:', error.message);
        }
        return Promise.reject(error);
    }
);

export default instance;