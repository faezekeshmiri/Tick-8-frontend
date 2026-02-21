import axios, { AxiosError } from 'axios';

export const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api/v1';

let _accessToken: string | null = null;

export function setAccessToken(token: string | null): void {
  _accessToken = token;
}

export function getAccessToken(): string | null {
  return _accessToken;
}

export const apiClient = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // send httpOnly refresh-token cookie automatically
});

// Attach access token to every request
apiClient.interceptors.request.use((config) => {
  if (_accessToken) {
    config.headers.Authorization = `Bearer ${_accessToken}`;
  }
  return config;
});

let _refreshPromise: Promise<string> | null = null;

// Silent token refresh on 401
apiClient.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const original = error.config as typeof error.config & { _retry?: boolean };
    if (error.response?.status === 401 && !original?._retry) {
      original._retry = true;
      try {
        if (!_refreshPromise) {
          _refreshPromise = axios
            .post<{ access_token: string }>(
              `${BASE_URL}/auth/refresh`,
              {},
              { withCredentials: true }
            )
            .then((r) => r.data.access_token)
            .finally(() => {
              _refreshPromise = null;
            });
        }
        const newToken = await _refreshPromise;
        setAccessToken(newToken);
        original!.headers!.Authorization = `Bearer ${newToken}`;
        return apiClient(original!);
      } catch {
        setAccessToken(null);
        window.dispatchEvent(new CustomEvent('auth:logout'));
        return Promise.reject(error);
      }
    }
    return Promise.reject(error);
  }
);
