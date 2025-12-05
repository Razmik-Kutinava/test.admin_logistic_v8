import axios, { AxiosInstance, AxiosError } from 'axios';
import type { 
  Driver, 
  Order, 
  Delivery, 
  District, 
  Warehouse, 
  DashboardStats,
  ApiResponse,
  PaginatedResponse,
  FilterOptions 
} from '@/types';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: '/api/v1',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        // Add auth token if available
        const token = localStorage.getItem('authToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          // Handle unauthorized
          localStorage.removeItem('authToken');
          window.location.href = '/login';
        }
        
        // Handle database migration errors
        if (error.response?.status === 503) {
          const message = (error.response.data as any)?.message;
          if (message && message.includes('migrations')) {
            console.error('⚠️ Database migration required!', message);
            // Отправляем событие для показа баннера
            window.dispatchEvent(new CustomEvent('api-error', {
              detail: {
                status: 503,
                message: message
              }
            }));
          }
        }
        
        return Promise.reject(error);
      }
    );
  }

  // Dashboard
  async getDashboardStats(): Promise<DashboardStats> {
    const response = await this.client.get('/dashboard/kpi');
    const kpi = response.data;
    return {
      totalOrders: kpi.totalOrders || 0,
      pendingOrders: kpi.pendingOrders || 0,
      completedOrders: kpi.completedToday || 0,
      activeDeliveries: kpi.activeDeliveries || 0,
      availableDrivers: kpi.activeDrivers || 0,
      totalRevenue: 0,
      averageDeliveryTime: 0,
      customerSatisfaction: 0,
    };
  }

  async getDispatcherDashboard(filters?: { country?: string; city?: string; districtId?: number }) {
    const response = await this.client.get('/dashboard/dispatchers', { params: filters });
    return response.data;
  }

  async getManagementDashboard(filters?: { startDate?: string; endDate?: string; country?: string }) {
    const response = await this.client.get('/dashboard/management', { params: filters });
    return response.data;
  }

  // Drivers
  async getDrivers(filters?: FilterOptions): Promise<PaginatedResponse<Driver>> {
    const response = await this.client.get('/drivers', {
      params: filters,
    });
    const data = response.data;
    return {
      items: data.data || [],
      total: data.total || 0,
      page: filters?.page || 1,
      pageSize: filters?.pageSize || 10,
      totalPages: Math.ceil((data.total || 0) / (filters?.pageSize || 10)),
    };
  }

  async getDriver(id: string): Promise<Driver> {
    const response = await this.client.get<ApiResponse<Driver>>(`/drivers/${id}`);
    return response.data.data!;
  }

  async createDriver(driver: Partial<Driver>): Promise<Driver> {
    const response = await this.client.post<ApiResponse<Driver>>('/drivers', driver);
    return response.data.data!;
  }

  async updateDriver(id: string, driver: Partial<Driver>): Promise<Driver> {
    const response = await this.client.put<ApiResponse<Driver>>(`/drivers/${id}`, driver);
    return response.data.data!;
  }

  async deleteDriver(id: string): Promise<void> {
    await this.client.delete(`/drivers/${id}`);
  }

  // Orders
  async getOrders(filters?: FilterOptions): Promise<PaginatedResponse<Order>> {
    const response = await this.client.get('/orders', {
      params: filters,
    });
    const data = response.data;
    return {
      items: data.data || [],
      total: data.total || 0,
      page: filters?.page || 1,
      pageSize: filters?.pageSize || 10,
      totalPages: Math.ceil((data.total || 0) / (filters?.pageSize || 10)),
    };
  }

  async getOrder(id: string): Promise<Order> {
    const response = await this.client.get<ApiResponse<Order>>(`/orders/${id}`);
    return response.data.data!;
  }

  async createOrder(order: Partial<Order>): Promise<Order> {
    const response = await this.client.post<ApiResponse<Order>>('/orders', order);
    return response.data.data!;
  }

  async updateOrder(id: string, order: Partial<Order>): Promise<Order> {
    const response = await this.client.put<ApiResponse<Order>>(`/orders/${id}`, order);
    return response.data.data!;
  }

  async updateOrderStatus(id: string, status: Order['status']): Promise<Order> {
    const response = await this.client.patch<ApiResponse<Order>>(`/orders/${id}/status`, { status });
    return response.data.data!;
  }

  async assignOrderToDriver(orderId: string, driverId: string): Promise<Order> {
    const response = await this.client.post<ApiResponse<Order>>(`/orders/${orderId}/assign`, { driverId });
    return response.data.data!;
  }

  // Deliveries
  async getDeliveries(filters?: FilterOptions): Promise<PaginatedResponse<Delivery>> {
    const response = await this.client.get('/deliveries', {
      params: filters,
    });
    const data = response.data;
    return {
      items: data.data || [],
      total: data.total || 0,
      page: filters?.page || 1,
      pageSize: filters?.pageSize || 10,
      totalPages: Math.ceil((data.total || 0) / (filters?.pageSize || 10)),
    };
  }

  async getDelivery(id: string): Promise<Delivery> {
    const response = await this.client.get<ApiResponse<Delivery>>(`/deliveries/${id}`);
    return response.data.data!;
  }

  async createDelivery(delivery: Partial<Delivery>): Promise<Delivery> {
    const response = await this.client.post<ApiResponse<Delivery>>('/deliveries', delivery);
    return response.data.data!;
  }

  async updateDeliveryStatus(id: string, status: Delivery['status']): Promise<Delivery> {
    const response = await this.client.patch<ApiResponse<Delivery>>(`/deliveries/${id}/status`, { status });
    return response.data.data!;
  }

  async optimizeDeliveryRoute(id: string): Promise<Delivery> {
    const response = await this.client.post<ApiResponse<Delivery>>(`/deliveries/${id}/optimize`);
    return response.data.data!;
  }

  // Districts
  async getDistricts(filters?: FilterOptions): Promise<PaginatedResponse<District>> {
    const response = await this.client.get('/districts', {
      params: filters,
    });
    const data = response.data;
    return {
      items: data.data || [],
      total: data.total || 0,
      page: filters?.page || 1,
      pageSize: filters?.pageSize || 10,
      totalPages: Math.ceil((data.total || 0) / (filters?.pageSize || 10)),
    };
  }

  async getDistrict(id: string): Promise<District> {
    const response = await this.client.get<ApiResponse<District>>(`/districts/${id}`);
    return response.data.data!;
  }

  async createDistrict(district: Partial<District>): Promise<District> {
    const response = await this.client.post<ApiResponse<District>>('/districts', district);
    return response.data.data!;
  }

  async updateDistrict(id: string, district: Partial<District>): Promise<District> {
    const response = await this.client.put<ApiResponse<District>>(`/districts/${id}`, district);
    return response.data.data!;
  }

  async deleteDistrict(id: string): Promise<void> {
    await this.client.delete(`/districts/${id}`);
  }

  // Warehouses
  async getWarehouses(filters?: FilterOptions): Promise<PaginatedResponse<Warehouse>> {
    const response = await this.client.get('/warehouses', {
      params: filters,
    });
    const data = response.data;
    return {
      items: data.data || [],
      total: data.total || 0,
      page: filters?.page || 1,
      pageSize: filters?.pageSize || 10,
      totalPages: Math.ceil((data.total || 0) / (filters?.pageSize || 10)),
    };
  }

  async getWarehouse(id: string): Promise<Warehouse> {
    const response = await this.client.get<ApiResponse<Warehouse>>(`/warehouses/${id}`);
    return response.data.data!;
  }

  async createWarehouse(warehouse: Partial<Warehouse>): Promise<Warehouse> {
    const response = await this.client.post<ApiResponse<Warehouse>>('/warehouses', warehouse);
    return response.data.data!;
  }

  async updateWarehouse(id: string, warehouse: Partial<Warehouse>): Promise<Warehouse> {
    const response = await this.client.put<ApiResponse<Warehouse>>(`/warehouses/${id}`, warehouse);
    return response.data.data!;
  }

  async deleteWarehouse(id: string): Promise<void> {
    await this.client.delete(`/warehouses/${id}`);
  }
}

export const apiClient = new ApiClient();
