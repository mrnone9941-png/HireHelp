import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_URL ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/api` : 'http://localhost:5000/api',
});

// Add a request interceptor to inject the token
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const auth = localStorage.getItem('auth_store');
      if (auth) {
        try {
          const parsed = JSON.parse(auth);
          const token = parsed.state?.token;
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
          }
        } catch (e) {
          console.error('Error parsing auth token', e);
        }
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
