import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '../stores/useAuthStore';
import { SocialLoginResponse } from '../types/auth';

export const client = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL,
  timeout: 10000,
});

client.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

interface RetryableRequestConfig extends InternalAxiosRequestConfig {
  _retried?: boolean;
}

// access token 만료(401) 시 refresh token으로 재발급 후 원래 요청을 한 번만 재시도한다.
// 백엔드 refresh가 rolling(재발급할 때마다 기존 refresh token을 폐기)이라, 동시에 여러
// 요청이 401을 맞아도 refresh 호출은 한 번만 나가도록 진행 중인 refresh를 공유한다.
let refreshPromise: Promise<string> | null = null;

client.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const config = error.config as RetryableRequestConfig | undefined;

    if (error.response?.status !== 401 || !config || config._retried || config.url === '/auth/refresh') {
      return Promise.reject(error);
    }

    const { refreshToken, setSession, clearAuth } = useAuthStore.getState();
    if (!refreshToken) {
      return Promise.reject(error);
    }

    config._retried = true;

    if (!refreshPromise) {
      refreshPromise = client
        .post<SocialLoginResponse>('/auth/refresh', { refresh_token: refreshToken })
        .then(({ data }) => {
          setSession(data.access_token, data.refresh_token);
          return data.access_token;
        })
        .catch((refreshError) => {
          clearAuth();
          throw refreshError;
        })
        .finally(() => {
          refreshPromise = null;
        });
    }

    const newAccessToken = await refreshPromise;
    config.headers.Authorization = `Bearer ${newAccessToken}`;
    return client(config);
  }
);
