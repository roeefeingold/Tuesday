import axios from 'axios';

const client = axios.create({
  baseURL: '/api',
});

client.interceptors.request.use((config) => {
  const token = localStorage.getItem('tuesday_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('tuesday_token');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const get = (url, params) => client.get(url, { params });
export const post = (url, data, config) => client.post(url, data, config);
export const patch = (url, data) => client.patch(url, data);
export const del = (url) => client.delete(url);

export default client;
