import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { DriverStatus, OrderStatus, DeliveryStatus } from '@prisma/client';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getDispatcherDashboard(filters?: {
    country?: string;
    city?: string;
    districtId?: number;
  }) {
    const where: any = {};
    if (filters?.country) {
      where.district = { country: filters.country };
    }
    if (filters?.city) {
      where.district = { ...where.district, city: filters.city };
    }
    if (filters?.districtId) {
      where.districtId = filters.districtId;
    }

    const [
      activeDrivers,
      totalDrivers,
      activeDeliveries,
      pendingOrders,
      completedToday,
      driversWithDeliveries,
    ] = await Promise.all([
      // Active drivers count
      this.prisma.driver.count({
        where: {
          status: DriverStatus.ACTIVE,
          ...(filters?.districtId && { districtId: filters.districtId }),
        },
      }),

      // Total drivers
      this.prisma.driver.count({
        where: filters?.districtId ? { districtId: filters.districtId } : {},
      }),

      // Active deliveries
      this.prisma.delivery.count({
        where: {
          status: {
            in: [DeliveryStatus.ASSIGNED, DeliveryStatus.PICKED_UP, DeliveryStatus.IN_TRANSIT],
          },
          ...where,
        },
      }),

      // Pending orders
      this.prisma.order.count({
        where: {
          status: OrderStatus.NEW,
          ...where,
        },
      }),

      // Completed today
      this.prisma.delivery.count({
        where: {
          status: DeliveryStatus.DELIVERED,
          deliveryTime: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
          },
          ...where,
        },
      }),

      // Drivers with deliveries (for table)
      this.prisma.driver.findMany({
        where: {
          status: DriverStatus.ACTIVE,
          ...(filters?.districtId && { districtId: filters.districtId }),
        },
        include: {
          district: true,
          deliveries: {
            where: {
              status: {
                in: [DeliveryStatus.ASSIGNED, DeliveryStatus.PICKED_UP, DeliveryStatus.IN_TRANSIT],
              },
            },
            include: {
              order: true,
            },
          },
          _count: {
            select: {
              deliveries: {
                where: {
                  createdAt: {
                    gte: new Date(new Date().setHours(0, 0, 0, 0)),
                  },
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: 50,
      }),
    ]);

    // Calculate average delivery time (for today)
    const todayDeliveries = await this.prisma.delivery.findMany({
      where: {
        status: DeliveryStatus.DELIVERED,
        deliveryTime: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
        },
        ...where,
      },
      select: {
        pickupTime: true,
        deliveryTime: true,
      },
    });

    const avgDeliveryTime = this.calculateAverageDeliveryTime(todayDeliveries);

    return {
      kpi: {
        activeDrivers,
        totalDrivers,
        activeDeliveries,
        pendingOrders,
        completedToday,
        averageDeliveryTime: avgDeliveryTime,
      },
      drivers: driversWithDeliveries,
    };
  }

  async getManagementDashboard(filters?: {
    startDate?: Date;
    endDate?: Date;
    country?: string;
  }) {
    const startDate = filters?.startDate || new Date(new Date().setDate(1)); // Start of month
    const endDate = filters?.endDate || new Date();

    const where: any = {
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    };

    if (filters?.country) {
      where.district = { country: filters.country };
    }

    const [
      totalDeliveries,
      successfulDeliveries,
      failedDeliveries,
      totalOrders,
      driversStats,
      deliveriesByStatus,
      deliveriesByDay,
    ] = await Promise.all([
      // Total deliveries
      this.prisma.delivery.count({ where }),

      // Successful deliveries
      this.prisma.delivery.count({
        where: {
          ...where,
          status: DeliveryStatus.DELIVERED,
        },
      }),

      // Failed deliveries
      this.prisma.delivery.count({
        where: {
          ...where,
          status: DeliveryStatus.FAILED,
        },
      }),

      // Total orders
      this.prisma.order.count({ where }),

      // Driver statistics
      this.prisma.driver.findMany({
        include: {
          _count: {
            select: {
              deliveries: {
                where: {
                  ...where,
                  status: DeliveryStatus.DELIVERED,
                },
              },
            },
          },
        },
        orderBy: {
          deliveries: {
            _count: 'desc',
          },
        },
        take: 10,
      }),

      // Deliveries by status
      this.prisma.delivery.groupBy({
        by: ['status'],
        where,
        _count: true,
      }),

      // Deliveries by day (for chart)
      this.getDeliveriesByDay(startDate, endDate, filters?.country),
    ]);

    // Calculate success rate
    const successRate =
      totalDeliveries > 0 ? (successfulDeliveries / totalDeliveries) * 100 : 0;

    // Calculate average delivery time
    const completedDeliveries = await this.prisma.delivery.findMany({
      where: {
        ...where,
        status: DeliveryStatus.DELIVERED,
        pickupTime: { not: null },
        deliveryTime: { not: null },
      },
      select: {
        pickupTime: true,
        deliveryTime: true,
      },
    });

    const avgDeliveryTime = this.calculateAverageDeliveryTime(completedDeliveries);

    return {
      kpi: {
        totalDeliveries,
        successfulDeliveries,
        failedDeliveries,
        successRate: Math.round(successRate * 100) / 100,
        totalOrders,
        averageDeliveryTime: avgDeliveryTime,
      },
      topDrivers: driversStats.map(driver => ({
        id: driver.id,
        name: driver.name,
        phone: driver.phone,
        completedDeliveries: driver._count.deliveries,
      })),
      deliveriesByStatus,
      deliveriesByDay,
    };
  }

  async getKPI() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      activeDrivers,
      pendingOrders,
      activeDeliveries,
      completedToday,
    ] = await Promise.all([
      this.prisma.driver.count({
        where: { status: DriverStatus.ACTIVE },
      }),
      this.prisma.order.count({
        where: { status: OrderStatus.NEW },
      }),
      this.prisma.delivery.count({
        where: {
          status: {
            in: [DeliveryStatus.ASSIGNED, DeliveryStatus.PICKED_UP, DeliveryStatus.IN_TRANSIT],
          },
        },
      }),
      this.prisma.delivery.count({
        where: {
          status: DeliveryStatus.DELIVERED,
          deliveryTime: { gte: today },
        },
      }),
    ]);

    return {
      activeDrivers,
      pendingOrders,
      activeDeliveries,
      completedToday,
    };
  }

  private calculateAverageDeliveryTime(
    deliveries: Array<{ pickupTime: Date | null; deliveryTime: Date | null }>,
  ): number {
    const validDeliveries = deliveries.filter(
      d => d.pickupTime && d.deliveryTime,
    );

    if (validDeliveries.length === 0) return 0;

    const totalMinutes = validDeliveries.reduce((sum, delivery) => {
      const diff = delivery.deliveryTime!.getTime() - delivery.pickupTime!.getTime();
      return sum + diff / (1000 * 60); // Convert to minutes
    }, 0);

    return Math.round(totalMinutes / validDeliveries.length);
  }

  private async getDeliveriesByDay(startDate: Date, endDate: Date, country?: string) {
    const where: any = {
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    };

    if (country) {
      where.order = {
        district: { country },
      };
    }

    const deliveries = await this.prisma.delivery.findMany({
      where,
      select: {
        createdAt: true,
        status: true,
      },
    });

    // Group by day
    const grouped: Record<string, { date: string; delivered: number; failed: number }> = {};

    deliveries.forEach(delivery => {
      const date = delivery.createdAt.toISOString().split('T')[0];
      if (!grouped[date]) {
        grouped[date] = { date, delivered: 0, failed: 0 };
      }
      if (delivery.status === DeliveryStatus.DELIVERED) {
        grouped[date].delivered++;
      } else if (delivery.status === DeliveryStatus.FAILED) {
        grouped[date].failed++;
      }
    });

    return Object.values(grouped).sort((a, b) => a.date.localeCompare(b.date));
  }
}

