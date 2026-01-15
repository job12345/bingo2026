import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { ApiResponse, ErrorResponse } from '@/types';

/**
 * API Client Configuration
 */
class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
      timeout: Number(import.meta.env.VITE_API_TIMEOUT) || 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  /**
   * ตั้งค่า Interceptors
   */
  private setupInterceptors() {
    // Request Interceptor (เพิ่ม Access Token)
    this.client.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const token = localStorage.getItem('accessToken');
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response Interceptor (จัดการ Error)
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError<ErrorResponse>) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

        // ถ้า Token หมดอายุ (401) → Refresh Token
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const refreshToken = localStorage.getItem('refreshToken');
            if (!refreshToken) {
              throw new Error('No refresh token');
            }

            const { data } = await axios.post(`${this.client.defaults.baseURL}/auth/refresh`, {
              refreshToken,
            });

            localStorage.setItem('accessToken', data.accessToken);

            // Retry Request
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
            }
            return this.client(originalRequest);
          } catch (refreshError) {
            // Refresh Token ล้มเหลว → Logout
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            window.location.href = '/login';
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );
  }

  /**
   * GET Request
   */
  async get<T>(url: string, params?: any): Promise<T> {
    const { data } = await this.client.get<T>(url, { params });
    return data;
  }

  /**
   * POST Request
   */
  async post<T>(url: string, body?: any): Promise<T> {
    const { data } = await this.client.post<T>(url, body);
    return data;
  }

  /**
   * PUT Request
   */
  async put<T>(url: string, body?: any): Promise<T> {
    const { data } = await this.client.put<T>(url, body);
    return data;
  }

  /**
   * DELETE Request
   */
  async delete<T>(url: string): Promise<T> {
    const { data } = await this.client.delete<T>(url);
    return data;
  }

  /**
   * Upload File
   */
  async uploadFile<T>(url: string, file: File, onProgress?: (progress: number) => void): Promise<T> {
    const formData = new FormData();
    formData.append('file', file);

    const { data } = await this.client.post<T>(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(progress);
        }
      },
    });

    return data;
  }
}

export const apiClient = new ApiClient();
