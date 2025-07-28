import Cookies from 'js-cookie';
import type { ApiResponse } from './api';
import { api } from './api';

export interface User {
    id: string;
    name: string;
    email: string;
    tenantId: string;
    role: 'ADMIN' | 'USER';
}

export interface LoginCredentials {
    email: string;
    password: string;
    tenantId: string;
}

export interface RegisterData extends LoginCredentials {
    name: string;
    role?: 'ADMIN' | 'USER';
}

export interface AuthResponse {
    user: User;
    tokens: {
        accessToken: string;
        refreshToken: string;
    };
}

export const AuthService = {
    isAuthenticated(): boolean {
        return !!Cookies.get('accessToken');
    },

    hasRole(role: 'ADMIN' | 'USER'): boolean {
        const user = this.getCurrentUser();
        return user?.role === role;
    },

    logout(): void {
        Cookies.remove('accessToken');
        Cookies.remove('refreshToken');
        Cookies.remove('user');
        globalThis.location.href = '/login';
    },

    getCurrentUser(): undefined | User {
        try {
            const userStr = Cookies.get('user');
            return userStr ? JSON.parse(userStr) : undefined;
        } catch {
            return undefined;
        }
    },

    async register(data: RegisterData): Promise<AuthResponse> {
        const response = await api.post<ApiResponse<AuthResponse>>('/auth/register', data);

        const { user, tokens } = response.data.data;

        Cookies.set('accessToken', tokens.accessToken);
        Cookies.set('refreshToken', tokens.refreshToken);
        Cookies.set('user', JSON.stringify(user));

        return response.data.data;
    },

    async login(credentials: LoginCredentials): Promise<AuthResponse> {
        const response = await api.post<ApiResponse<AuthResponse>>('/auth/login', credentials);

        const { user, tokens } = response.data.data;

        Cookies.set('accessToken', tokens.accessToken);
        Cookies.set('refreshToken', tokens.refreshToken);
        Cookies.set('user', JSON.stringify(user));

        return response.data.data;
    },
};