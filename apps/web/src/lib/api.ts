import type { AxiosResponse } from 'axios';
import axios from 'axios';
import Cookies from 'js-cookie';
import toast from 'react-hot-toast';

const API_URL = (process.env['NEXT_PUBLIC_API_URL'] ?? '/api').trim()

export interface ApiResponse<T = unknown> {
    data: T;
    success: boolean;
    message?: string;
    timestamp: string;
}

export const api = axios.create({
    timeout: 10_000,
    baseURL: API_URL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    }
});

api.interceptors.request.use(
    (config) => {
        const token = Cookies.get('accessToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

api.interceptors.response.use(
    (response: AxiosResponse<ApiResponse>) => {
        return response;
    },
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const refreshToken = Cookies.get('refreshToken');
                if (refreshToken) {
                    const response = await axios.post(
                        `${API_URL}/auth/refresh`,
                        { refreshToken }
                    );

                    const { accessToken, refreshToken: newRefreshToken } = response.data.data;

                    Cookies.set('accessToken', accessToken);
                    Cookies.set('refreshToken', newRefreshToken);

                    originalRequest.headers.Authorization = `Bearer ${accessToken}`;
                    return api(originalRequest);
                }
            } catch (refreshError) {
                Cookies.remove('accessToken');
                Cookies.remove('refreshToken');
                Cookies.remove('user');
                globalThis.location.href = '/login';
                throw refreshError;
            }
        }

        const message = error.response?.data?.message ?? 'An error occurred';
        toast.error(message);

        throw error;
    }
);