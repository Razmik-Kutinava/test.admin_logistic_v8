import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { AutoAssignOrderDto } from './dto/auto-assign.dto';
import { DriversService } from '../drivers/drivers.service';
import { DistrictsService } from '../districts/districts.service';
import { Order, OrderStatus, OrderPriority, Prisma, DriverStatus } from '@prisma/client';

type OrderWithRelations = Prisma.OrderGetPayload<{
  include: {
    warehouse: true;
    district: true;
    delivery: true;
  };
}>;

type OrderWithoutDelivery = Prisma.OrderGetPayload<{
  include: {
    warehouse: true;
    district: true;
  };
}>;

type OrderWithFullRelations = Prisma.OrderGetPayload<{
  include: {
    warehouse: true;
    district: true;
    delivery: {
      include: {
        driver: true;
      };
    };
  };
}>;

@Injectable()
export class OrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly driversService: DriversService,
    private readonly districtsService: DistrictsService,
  ) {}

  async create(createOrderDto: CreateOrderDto): Promise<OrderWithRelations> {
    try {
      // Auto-determine district if not provided
      let districtId = createOrderDto.districtId;
      if (!districtId) {
        districtId = await this.districtsService.findDistrictByAddress(
          createOrderDto.address,
        );
      }

      const order = await this.prisma.order.create({
        data: {
          ...createOrderDto,
          districtId,
        },
        include: {
          warehouse: true,
          district: true,
          delivery: true,
        },
      });

      // Auto-assign if priority is HIGH or URGENT
      if (order.priority === OrderPriority.HIGH || order.priority === OrderPriority.URGENT) {
        try {
          await this.autoAssignOrder({ orderId: order.id });
        } catch (error) {
          console.error(`Failed to auto-assign order ${order.id}:`, error);
        }
      }

      return order;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException('Order with this number already exists');
        }
      }
      throw error;
    }
  }

  async findAll(params?: {
    skip?: number;
    take?: number;
    status?: OrderStatus;
    priority?: OrderPriority;
    warehouseId?: number;
    districtId?: number;
  }): Promise<{ data: OrderWithFullRelations[]; total: number }> {
    const { skip = 0, take = 10, status, priority, warehouseId, districtId } = params || {};

    const where: Prisma.OrderWhereInput = {};
    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (warehouseId) where.warehouseId = warehouseId;
    if (districtId) where.districtId = districtId;

    const [data, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        skip,
        take,
        include: {
          warehouse: true,
          district: true,
          delivery: {
            include: {
              driver: true,
            },
          },
        },
        orderBy: [
          { priority: 'desc' },
          { createdAt: 'desc' },
        ],
      }),
      this.prisma.order.count({ where }),
    ]);

    return { data, total };
  }

  async findOne(id: number): Promise<OrderWithFullRelations> {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        warehouse: true,
        district: true,
        delivery: {
          include: {
            driver: true,
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    return order;
  }

  async update(id: number, updateOrderDto: UpdateOrderDto): Promise<OrderWithRelations> {
    await this.findOne(id); // Check if exists

    try {
      return await this.prisma.order.update({
        where: { id },
        data: updateOrderDto,
        include: {
          warehouse: true,
          district: true,
          delivery: true,
        },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException('Order with this number already exists');
        }
      }
      throw error;
    }
  }

  async remove(id: number): Promise<void> {
    const order = await this.findOne(id);

    if (order.delivery) {
      throw new ConflictException('Cannot delete order with associated delivery');
    }

    await this.prisma.order.delete({
      where: { id },
    });
  }

  async autoAssignOrder(autoAssignDto: AutoAssignOrderDto): Promise<any> {
    const { orderId, preferredDriverId, notes } = autoAssignDto;

    // Get order details
    const order = await this.findOne(orderId);

    if (order.status !== OrderStatus.NEW) {
      throw new BadRequestException('Order is already assigned or processed');
    }

    if (order.delivery) {
      throw new ConflictException('Order already has a delivery assigned');
    }

    let selectedDriver;

    // Use preferred driver if provided and available
    if (preferredDriverId) {
      const driver = await this.prisma.driver.findUnique({
        where: { id: preferredDriverId },
      });

      if (!driver || driver.status !== DriverStatus.ACTIVE) {
        throw new BadRequestException('Preferred driver is not available');
      }

      selectedDriver = driver;
    } else {
      // Auto-select driver based on district and load
      const availableDrivers = await this.driversService.getAvailableDrivers(
        order.districtId || undefined,
      );

      if (availableDrivers.length === 0) {
        // If no drivers in district, get any available driver
        const allAvailableDrivers = await this.driversService.getAvailableDrivers();

        if (allAvailableDrivers.length === 0) {
          throw new NotFoundException('No available drivers found');
        }

        selectedDriver = allAvailableDrivers[0];
      } else {
        // Select driver with least active deliveries
        selectedDriver = availableDrivers[0];
      }
    }

    // Create delivery and update order status in a transaction
    const result = await this.prisma.$transaction(async (tx) => {
      // Create delivery
      const delivery = await tx.delivery.create({
        data: {
          orderId: order.id,
          driverId: selectedDriver.id,
          status: 'ASSIGNED',
          notes,
        },
        include: {
          driver: true,
          order: true,
        },
      });

      // Update order status
      const updatedOrder = await tx.order.update({
        where: { id: orderId },
        data: {
          status: OrderStatus.ASSIGNED,
        },
      });

      // Update driver status if needed
      await tx.driver.update({
        where: { id: selectedDriver.id },
        data: {
          status: DriverStatus.ON_DELIVERY,
        },
      });

      // Log the assignment
      await tx.systemLog.create({
        data: {
          action: 'AUTO_ASSIGN_ORDER',
          entityType: 'order',
          entityId: orderId,
          details: {
            orderId,
            driverId: selectedDriver.id,
            driverName: selectedDriver.name,
            method: preferredDriverId ? 'preferred' : 'auto',
          },
        },
      });

      return {
        order: updatedOrder,
        delivery,
        driver: selectedDriver,
      };
    });

    return result;
  }

  async getUnassignedOrders(): Promise<OrderWithoutDelivery[]> {
    return await this.prisma.order.findMany({
      where: {
        status: OrderStatus.NEW,
        delivery: null,
      },
      include: {
        warehouse: true,
        district: true,
      },
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'asc' },
      ],
    });
  }

  async bulkAssign(orderIds: number[]): Promise<any> {
    const results = [];

    for (const orderId of orderIds) {
      try {
        const result = await this.autoAssignOrder({ orderId });
        results.push({
          orderId,
          success: true,
          data: result,
        });
      } catch (error) {
        results.push({
          orderId,
          success: false,
          error: error.message,
        });
      }
    }

    return {
      total: orderIds.length,
      successful: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length,
      results,
    };
  }

  async cancelOrder(id: number, reason?: string): Promise<OrderWithRelations> {
    const order = await this.findOne(id);

    if (order.status === OrderStatus.COMPLETED) {
      throw new BadRequestException('Cannot cancel completed order');
    }

    // Cancel delivery if exists
    if (order.delivery) {
      await this.prisma.delivery.update({
        where: { id: order.delivery.id },
        data: {
          status: 'FAILED',
          notes: reason || 'Order cancelled',
        },
      });

      // Update driver status back to ACTIVE
      await this.prisma.driver.update({
        where: { id: order.delivery.driverId },
        data: {
          status: DriverStatus.ACTIVE,
        },
      });
    }

    // Update order status
    return await this.prisma.order.update({
      where: { id },
      data: {
        status: OrderStatus.CANCELLED,
      },
      include: {
        warehouse: true,
        district: true,
        delivery: true,
      },
    });
  }
}