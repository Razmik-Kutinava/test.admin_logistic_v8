// Driver types
export interface Driver {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email?: string;
  status: 'available' | 'busy' | 'offline';
  vehicleType: 'car' | 'van' | 'truck';
  vehicleNumber?: string;
  rating?: number;
  totalDeliveries?: number;
  currentLocation?: {
    lat: number;
    lng: number;
  };
  createdAt: string;
  updatedAt: string;
}

// Order types
export interface Order {
  id: string;
  orderNumber: string;
  status: 'pending' | 'processing' | 'in_delivery' | 'delivered' | 'cancelled';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  customer: {
    name: string;
    phone: string;
    email?: string;
  };
  deliveryAddress: {
    street: string;
    city: string;
    postalCode: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  items: OrderItem[];
  totalAmount: number;
  paymentStatus: 'pending' | 'paid' | 'refunded';
  paymentMethod?: 'cash' | 'card' | 'online';
  notes?: string;
  driverId?: string;
  deliveryId?: string;
  estimatedDeliveryTime?: string;
  actualDeliveryTime?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  id: string;
  productName: string;
  quantity: number;
  price: number;
  total: number;
}

// Delivery types
export interface Delivery {
  id: string;
  deliveryNumber: string;
  status: 'assigned' | 'in_progress' | 'completed' | 'failed';
  driverId: string;
  driver?: Driver;
  orders: Order[];
  route?: DeliveryRoute;
  startTime?: string;
  endTime?: string;
  totalDistance?: number;
  totalDuration?: number;
  createdAt: string;
  updatedAt: string;
}

export interface DeliveryRoute {
  id: string;
  waypoints: RouteWaypoint[];
  totalDistance: number;
  totalDuration: number;
  optimized: boolean;
}

export interface RouteWaypoint {
  orderId: string;
  address: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  estimatedArrival: string;
  actualArrival?: string;
  status: 'pending' | 'arrived' | 'completed' | 'skipped';
}

// District types
export interface District {
  id: string;
  name: string;
  code: string;
  boundaries?: {
    type: string;
    coordinates: number[][][];
  };
  warehouseId?: string;
  active: boolean;
  deliveryFee?: number;
  estimatedDeliveryTime?: string;
  createdAt: string;
  updatedAt: string;
}

// Warehouse types
export interface Warehouse {
  id: string;
  name: string;
  code: string;
  address: {
    street: string;
    city: string;
    postalCode: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  capacity?: number;
  currentStock?: number;
  operatingHours?: {
    open: string;
    close: string;
  };
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

// Dashboard statistics
export interface DashboardStats {
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
  activeDeliveries: number;
  availableDrivers: number;
  totalRevenue: number;
  averageDeliveryTime: number;
  customerSatisfaction: number;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Filter types
export interface FilterOptions {
  search?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}
