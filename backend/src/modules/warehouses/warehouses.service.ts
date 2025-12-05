import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateWarehouseDto } from './dto/create-warehouse.dto';
import { UpdateWarehouseDto } from './dto/update-warehouse.dto';
import { Warehouse, Prisma } from '@prisma/client';

@Injectable()
export class WarehousesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createWarehouseDto: CreateWarehouseDto): Promise<Warehouse> {
    try {
      return await this.prisma.warehouse.create({
        data: createWarehouseDto,
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException('Warehouse with this name already exists');
        }
      }
      throw error;
    }
  }

  async findAll(params?: {
    skip?: number;
    take?: number;
    country?: string;
    city?: string;
  }): Promise<{ data: Warehouse[]; total: number }> {
    const { skip = 0, take = 10, country, city } = params || {};

    const where: Prisma.WarehouseWhereInput = {};
    if (country) where.country = country;
    if (city) where.city = city;

    const [data, total] = await Promise.all([
      this.prisma.warehouse.findMany({
        where,
        skip,
        take,
        include: {
          _count: {
            select: { orders: true },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.warehouse.count({ where }),
    ]);

    return { data, total };
  }

  async findOne(id: number): Promise<Warehouse> {
    const warehouse = await this.prisma.warehouse.findUnique({
      where: { id },
      include: {
        _count: {
          select: { orders: true },
        },
        orders: {
          take: 10,
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!warehouse) {
      throw new NotFoundException(`Warehouse with ID ${id} not found`);
    }

    return warehouse;
  }

  async update(id: number, updateWarehouseDto: UpdateWarehouseDto): Promise<Warehouse> {
    await this.findOne(id); // Check if exists

    try {
      return await this.prisma.warehouse.update({
        where: { id },
        data: updateWarehouseDto,
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException('Warehouse with this name already exists');
        }
      }
      throw error;
    }
  }

  async remove(id: number): Promise<void> {
    await this.findOne(id); // Check if exists

    // Check if warehouse has orders
    const ordersCount = await this.prisma.order.count({
      where: { warehouseId: id },
    });

    if (ordersCount > 0) {
      throw new ConflictException(
        `Cannot delete warehouse with ${ordersCount} associated orders`,
      );
    }

    await this.prisma.warehouse.delete({
      where: { id },
    });
  }

  async getWarehouseStats(id: number): Promise<any> {
    const warehouse = await this.findOne(id);

    const stats = await this.prisma.order.groupBy({
      by: ['status'],
      where: { warehouseId: id },
      _count: true,
    });

    const todayOrders = await this.prisma.order.count({
      where: {
        warehouseId: id,
        createdAt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
        },
      },
    });

    return {
      warehouse,
      stats,
      todayOrders,
    };
  }
}

