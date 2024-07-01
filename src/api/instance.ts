import axios from 'axios';

export const axiosInstance = axios.create({
  baseURL: (import.meta.env.VITE_API_URL as string) ?? '/api/v1',
  timeout: 30000,
  responseType: 'json',
});
