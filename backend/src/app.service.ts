import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello() {
    return {
      name: 'Admin Logistic API',
      version: '1.0.0',
      description: 'Система управления логистикой и доставкой',
      endpoints: {
        documentation: '/api/docs',
        health: '/health',
        drivers: '/drivers',
        orders: '/orders',
        deliveries: '/deliveries',
        districts: '/districts',
        warehouses: '/warehouses',
        dashboard: '/dashboard',
      },
      status: 'running',
      timestamp: new Date().toISOString(),
    };
  }

  getHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  }
}
