import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateDeliveryDto } from './dto/create-delivery.dto';
import { UpdateDeliveryDto } from './dto/update-delivery.dto';
import { UpdateDeliveryStatusDto } from './dto/update-status.dto';
import { Delivery, DeliveryStatus, OrderStatus, DriverStatus, Prisma } from '@prisma/client';

@Injectable()
export class DeliveriesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createDeliveryDto: CreateDeliveryDto): Promise<Delivery> {
    // Check if order exists and doesn't have a delivery
    const order = await this.prisma.order.findUnique({
      where: { id: createDeliveryDto.orderId },
      include: { delivery: true },
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${createDeliveryDto.orderId} not found`);
    }

    if (order.delivery) {
      throw new ConflictException('Order already has a delivery assigned');
    }

    // Check if driver exists and is available
    const driver = await this.prisma.driver.findUnique({
      where: { id: createDeliveryDto.driverId },
    });

    if (!driver) {
      throw new NotFoundException(`Driver with ID ${createDeliveryDto.driverId} not found`);
    }

    if (driver.status === DriverStatus.INACTIVE) {
      throw new BadRequestException('Driver is not available');
    }

    // Create delivery and update order status in a transaction
    const result = await this.prisma.$transaction(async (tx) => {
      const delivery = await tx.delivery.create({
        data: createDeliveryDto,
        include: {
          order: true,
          driver: true,
        },
      });

      await tx.order.update({
        where: { id: createDeliveryDto.orderId },
        data: { status: OrderStatus.ASSIGNED },
      });

      await tx.driver.update({
        where: { id: createDeliveryDto.driverId },
        data: { status: DriverStatus.ON_DELIVERY },
      });

      return delivery;
    });

    return result;
  }

  async findAll(params?: {
    skip?: number;
    take?: number;
    status?: DeliveryStatus;
    driverId?: number;
    date?: Date;
  }): Promise<{ data: Delivery[]; total: number }> {
    const { skip = 0, take = 10, status, driverId, date } = params || {};

    const where: Prisma.DeliveryWhereInput = {};
    if (status) where.status = status;
    if (driverId) where.driverId = driverId;
    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      where.createdAt = {
        gte: startOfDay,
        lte: endOfDay,
      };
    }

    const [data, total] = await Promise.all([
      this.prisma.delivery.findMany({
        where,
        skip,
        take,
        include: {
          order: {
            include: {
              warehouse: true,
              district: true,
            },
          },
          driver: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.delivery.count({ where }),
    ]);

    return { data, total };
  }

  async findOne(id: number): Promise<Delivery> {
    const delivery = await this.prisma.delivery.findUnique({
      where: { id },
      include: {
        order: {
          include: {
            warehouse: true,
            district: true,
          },
        },
        driver: true,
      },
    });

    if (!delivery) {
      throw new NotFoundException(`Delivery with ID ${id} not found`);
    }

    return delivery;
  }

  async update(id: number, updateDeliveryDto: UpdateDeliveryDto): Promise<Delivery> {
    await this.findOne(id); // Check if exists

    return await this.prisma.delivery.update({
      where: { id },
      data: {
        ...updateDeliveryDto,
        pickupTime: updateDeliveryDto.pickupTime
          ? new Date(updateDeliveryDto.pickupTime)
          : undefined,
        deliveryTime: updateDeliveryDto.deliveryTime
          ? new Date(updateDeliveryDto.deliveryTime)
          : undefined,
      },
      include: {
        order: true,
        driver: true,
      },
    });
  }

  async updateStatus(id: number, updateStatusDto: UpdateDeliveryStatusDto): Promise<Delivery> {
    const delivery = await this.findOne(id);

    // Validate status transitions
    const validTransitions: Record<DeliveryStatus, DeliveryStatus[]> = {
      ASSIGNED: ['PICKED_UP', 'FAILED'],
      PICKED_UP: ['IN_TRANSIT', 'FAILED'],
      IN_TRANSIT: ['DELIVERED', 'FAILED'],
      DELIVERED: [],
      FAILED: ['ASSIGNED'],
    };

    if (!validTransitions[delivery.status].includes(updateStatusDto.status)) {
      throw new BadRequestException(
        `Invalid status transition from ${delivery.status} to ${updateStatusDto.status}`,
      );
    }

    // Update delivery and related entities in a transaction
    const result = await this.prisma.$transaction(async (tx) => {
      const updatedDelivery = await tx.delivery.update({
        where: { id },
        data: {
          status: updateStatusDto.status,
          notes: updateStatusDto.notes || delivery.notes,
          pickupTime:
            updateStatusDto.status === DeliveryStatus.PICKED_UP && !delivery.pickupTime
              ? new Date()
              : delivery.pickupTime,
          deliveryTime:
            updateStatusDto.status === DeliveryStatus.DELIVERED ? new Date() : undefined,
        },
        include: {
          order: true,
          driver: true,
        },
      });

      // Update order status based on delivery status
      let orderStatus: OrderStatus;
      switch (updateStatusDto.status) {
        case DeliveryStatus.PICKED_UP:
        case DeliveryStatus.IN_TRANSIT:
          orderStatus = OrderStatus.IN_PROGRESS;
          break;
        case DeliveryStatus.DELIVERED:
          orderStatus = OrderStatus.COMPLETED;
          break;
        case DeliveryStatus.FAILED:
          orderStatus = OrderStatus.CANCELLED;
          break;
        default:
          orderStatus = OrderStatus.ASSIGNED;
      }

      await tx.order.update({
        where: { id: delivery.orderId },
        data: { status: orderStatus },
      });

      // Update driver status
      if (
        updateStatusDto.status === DeliveryStatus.DELIVERED ||
        updateStatusDto.status === DeliveryStatus.FAILED
      ) {
        // Check if driver has other active deliveries
        const activeDeliveries = await tx.delivery.count({
          where: {
            driverId: delivery.driverId,
            status: {
              in: [DeliveryStatus.ASSIGNED, DeliveryStatus.PICKED_UP, DeliveryStatus.IN_TRANSIT],
            },
            id: { not: id },
          },
        });

        if (activeDeliveries === 0) {
          await tx.driver.update({
            where: { id: delivery.driverId },
            data: { status: DriverStatus.ACTIVE },
          });
        }
      }

      // Log the status update
      await tx.systemLog.create({
        data: {
          action: 'UPDATE_DELIVERY_STATUS',
          entityType: 'delivery',
          entityId: id,
          details: {
            deliveryId: id,
            oldStatus: delivery.status,
            newStatus: updateStatusDto.status,
            notes: updateStatusDto.notes,
          },
        },
      });

      return updatedDelivery;
    });

    return result;
  }

  async remove(id: number): Promise<void> {
    const delivery = await this.findOne(id);

    if (
      delivery.status === DeliveryStatus.PICKED_UP ||
      delivery.status === DeliveryStatus.IN_TRANSIT
    ) {
      throw new ConflictException('Cannot delete active delivery');
    }

    await this.prisma.$transaction(async (tx) => {
      // Reset order status if delivery is not completed
      if (delivery.status !== DeliveryStatus.DELIVERED) {
        await tx.order.update({
          where: { id: delivery.orderId },
          data: { status: OrderStatus.NEW },
        });
      }

      // Update driver status
      const activeDeliveries = await tx.delivery.count({
        where: {
          driverId: delivery.driverId,
          status: {
            in: [DeliveryStatus.ASSIGNED, DeliveryStatus.PICKED_UP, DeliveryStatus.IN_TRANSIT],
          },
          id: { not: id },
        },
      });

      if (activeDeliveries === 0) {
        await tx.driver.update({
          where: { id: delivery.driverId },
          data: { status: DriverStatus.ACTIVE },
        });
      }

      await tx.delivery.delete({
        where: { id },
      });
    });
  }

  async getActiveDeliveries(): Promise<Delivery[]> {
    return await this.prisma.delivery.findMany({
      where: {
        status: {
          in: [DeliveryStatus.ASSIGNED, DeliveryStatus.PICKED_UP, DeliveryStatus.IN_TRANSIT],
        },
      },
      include: {
        order: {
          include: {
            warehouse: true,
            district: true,
          },
        },
        driver: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });
  }

  async getDriverDeliveries(driverId: number, date?: Date): Promise<Delivery[]> {
    const where: Prisma.DeliveryWhereInput = { driverId };

    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      where.createdAt = {
        gte: startOfDay,
        lte: endOfDay,
      };
    }

    return await this.prisma.delivery.findMany({
      where,
      include: {
        order: {
          include: {
            warehouse: true,
            district: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
}