import axios, { AxiosInstance, AxiosResponse } from 'axios';
import toast from 'react-hot-toast';
import { 
  AuthResponse, 
  User, 
  Customer, 
  Invoice, 
  InvoicesResponse,
  LoginForm, 
  RegisterForm,
  CustomerForm,
  InvoiceForm,
  PaginationParams,
  Plan
} from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor for error handling
    this.api.interceptors.response.use(
      (response: AxiosResponse) => {
        return response;
      },
      (error) => {
        if (error.response) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          const { status, data } = error.response;
          
          if (status === 401) {
            // Unauthorized - clear token and redirect to login
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
            return Promise.reject(error);
          }
          
          if (status === 403) {
            // Forbidden - typically subscription limit reached
            toast.error(data.message || 'Access denied. Please upgrade your plan.');
          } else if (status >= 400 && status < 500) {
            // Client errors
            toast.error(data.message || 'Something went wrong');
          } else if (status >= 500) {
            // Server errors
            toast.error('Server error. Please try again later.');
          }
        } else if (error.request) {
          // The request was made but no response was received
          toast.error('Network error. Please check your connection.');
        } else {
          // Something happened in setting up the request that triggered an Error
          toast.error('An error occurred. Please try again.');
        }
        
        return Promise.reject(error);
      }
    );
  }

  // Auth endpoints
  async login(credentials: LoginForm): Promise<AuthResponse> {
    const response = await this.api.post('/auth/login', credentials);
    return response.data;
  }

  async register(userData: RegisterForm): Promise<AuthResponse> {
    const response = await this.api.post('/auth/register', userData);
    return response.data;
  }

  async getProfile(): Promise<{ user: User }> {
    const response = await this.api.get('/auth/me');
    return response.data;
  }

  async updateProfile(userData: Partial<User>): Promise<{ user: User }> {
    const response = await this.api.put('/auth/me', userData);
    return response.data;
  }

  // Customer endpoints
  async getCustomers(): Promise<{ customers: Customer[]; count: number }> {
    const response = await this.api.get('/customers');
    return response.data;
  }

  async getCustomer(id: string): Promise<{ customer: Customer }> {
    const response = await this.api.get(`/customers/${id}`);
    return response.data;
  }

  async createCustomer(customerData: CustomerForm): Promise<{ customer: Customer }> {
    const response = await this.api.post('/customers', customerData);
    return response.data;
  }

  async updateCustomer(id: string, customerData: Partial<CustomerForm>): Promise<{ customer: Customer }> {
    const response = await this.api.put(`/customers/${id}`, customerData);
    return response.data;
  }

  async deleteCustomer(id: string): Promise<void> {
    await this.api.delete(`/customers/${id}`);
  }

  // Invoice endpoints
  async getInvoices(params?: PaginationParams): Promise<InvoicesResponse> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.status) queryParams.append('status', params.status);
    if (params?.search) queryParams.append('search', params.search);

    const response = await this.api.get(`/invoices?${queryParams.toString()}`);
    return response.data;
  }

  async getInvoice(id: string): Promise<{ invoice: Invoice }> {
    const response = await this.api.get(`/invoices/${id}`);
    return response.data;
  }

  async createInvoice(invoiceData: InvoiceForm): Promise<{ invoice: Invoice }> {
    const response = await this.api.post('/invoices', invoiceData);
    return response.data;
  }

  async updateInvoice(id: string, invoiceData: Partial<InvoiceForm>): Promise<{ invoice: Invoice }> {
    const response = await this.api.put(`/invoices/${id}`, invoiceData);
    return response.data;
  }

  async updateInvoiceStatus(id: string, status: string): Promise<{ invoice: Invoice }> {
    const response = await this.api.put(`/invoices/${id}`, { status });
    return response.data;
  }

  async deleteInvoice(id: string): Promise<void> {
    await this.api.delete(`/invoices/${id}`);
  }

  async duplicateInvoice(id: string): Promise<{ invoice: Invoice }> {
    const response = await this.api.post(`/invoices/${id}/duplicate`);
    return response.data;
  }

  async downloadInvoicePDF(id: string): Promise<Blob> {
    const response = await this.api.get(`/invoices/${id}/pdf`, {
      responseType: 'blob',
    });
    return response.data;
  }

  // Payment endpoints
  async getPlans(): Promise<{ plans: Plan[] }> {
    const response = await this.api.get('/payments/plans');
    return response.data;
  }

  async subscribe(planId: string): Promise<any> {
    const response = await this.api.post('/payments/subscribe', { planId });
    return response.data;
  }

  // Health check
  async healthCheck(): Promise<any> {
    const response = await this.api.get('/health');
    return response.data;
  }

  // Generic HTTP methods
  async get<T = any>(url: string, config?: any): Promise<{ data: T }> {
    const response = await this.api.get(url, config);
    return response.data;
  }

  async post<T = any>(url: string, data?: any, config?: any): Promise<{ data: T }> {
    const response = await this.api.post(url, data, config);
    return response.data;
  }

  async put<T = any>(url: string, data?: any, config?: any): Promise<{ data: T }> {
    const response = await this.api.put(url, data, config);
    return response.data;
  }

  async delete<T = any>(url: string, config?: any): Promise<{ data: T }> {
    const response = await this.api.delete(url, config);
    return response.data;
  }
}

export const apiService = new ApiService();
export default apiService;
