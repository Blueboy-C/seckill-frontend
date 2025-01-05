import axios from 'axios';

const instance = axios.create({
  baseURL: 'http://localhost:8080', // 后端 API 地址
  timeout: 10000, // 请求超时时间,
  headers: {
    'Content-Type': 'application/json', // 设置请求头
  },
  withCredentials: true, // 允许携带凭证（如 Cookie）
});

// 请求拦截器
instance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 响应拦截器
instance.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response.status === 401) {
      // 未授权，跳转到登录页
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default instance;