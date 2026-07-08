import axios from 'axios';

const BASE = process.env.REACT_APP_API_URL 
  ? `${process.env.REACT_APP_API_URL}/api/v1`
  : 'http://localhost:8000/api/v1';

const api = axios.create({
  baseURL: BASE,
  timeout: 10000,
});

// Random endpoints
export const getUUID     = ()      => api.get('/random/uuid');
export const getOTP      = (d=6)   => api.get(`/random/otp?digits=${d}`);
export const getToken    = ()      => api.get('/random/token');
export const getAESKey   = (b=256) => api.get(`/random/aes-key?bits=${b}`);
export const getBytes    = (n=32)  => api.get(`/random/bytes?length=${n}`);
export const getInteger  = (min=1, max=100) => api.get(`/random/integer?min=${min}&max=${max}`);
export const getPassword = (l=16)  => api.get(`/random/password?length=${l}`);

// Entropy status
export const getStatus   = ()      => api.get('/entropy/status');

export default api;