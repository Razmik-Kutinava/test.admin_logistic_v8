import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateDriverDto } from './dto/create-driver.dto';
import { UpdateDriverDto } from './dto/update-driver.dto';
import { Driver, DriverStatus, Prisma } from '@prisma/client';

@Injectable()
export class DriversService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createDriverDto: CreateDriverDto): Promise<Driver> {
    try {
      return await this.prisma.driver.create({
        data: createDriverDto,
        include: {
          district: true,
        },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException('Driver with this email already exists');
        }
      }
      throw error;
    }
  }

  async findAll(params?: {
    skip?: number;
    take?: number;
    status?: DriverStatus;
    districtId?: number;
  }): Promise<{ data: Driver[]; total: number }> {
    const { skip = 0, take = 10, status, districtId } = params || {};

    const where: Prisma.DriverWhereInput = {};
    if (status) where.status = status;
    if (districtId) where.districtId = districtId;

    const [data, total] = await Promise.all([
      this.prisma.driver.findMany({
        where,
        skip,
        take,
        include: {
          district: true,
          _count: {
            select: { deliveries: true },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.driver.count({ where }),
    ]);

    return { data, total };
  }

  async findOne(id: number): Promise<Driver> {
    const driver = await this.prisma.driver.findUnique({
      where: { id },
      include: {
        district: true,
        deliveries: {
          take: 10,
          orderBy: {
            createdAt: 'desc',
          },
          include: {
            order: true,
          },
        },
      },
    });

    if (!driver) {
      throw new NotFoundException(`Driver with ID ${id} not found`);
    }

    return driver;
  }

  async update(id: number, updateDriverDto: UpdateDriverDto): Promise<Driver> {
    await this.findOne(id); // Check if exists

    try {
      return await this.prisma.driver.update({
        where: { id },
        data: updateDriverDto,
        include: {
          district: true,
        },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException('Driver with this email already exists');
        }
      }
      throw error;
    }
  }

  async remove(id: number): Promise<void> {
    await this.findOne(id); // Check if exists

    // Check if driver has active deliveries
    const activeDeliveries = await this.prisma.delivery.count({
      where: {
        driverId: id,
        status: {
          in: ['ASSIGNED', 'PICKED_UP', 'IN_TRANSIT'],
        },
      },
    });

    if (activeDeliveries > 0) {
      throw new ConflictException('Cannot delete driver with active deliveries');
    }

    await this.prisma.driver.delete({
      where: { id },
    });
  }

  async getAvailableDrivers(districtId?: number): Promise<Driver[]> {
    const where: Prisma.DriverWhereInput = {
      status: DriverStatus.ACTIVE,
    };

    if (districtId) {
      where.districtId = districtId;
    }

    return await this.prisma.driver.findMany({
      where,
      include: {
        _count: {
          select: {
            deliveries: {
              where: {
                status: {
                  in: ['ASSIGNED', 'PICKED_UP', 'IN_TRANSIT'],
                },
              },
            },
          },
        },
      },
      orderBy: {
        deliveries: {
          _count: 'asc',
        },
      },
    });
  }

  async updateStatus(id: number, status: DriverStatus): Promise<Driver> {
    await this.findOne(id); // Check if exists

    return await this.prisma.driver.update({
      where: { id },
      data: { status },
      include: {
        district: true,
      },
    });
  }

  async getDriverStats(id: number): Promise<any> {
    const driver = await this.findOne(id);

    const stats = await this.prisma.delivery.groupBy({
      by: ['status'],
      where: { driverId: id },
      _count: true,
    });

    const todayDeliveries = await this.prisma.delivery.count({
      where: {
        driverId: id,
        createdAt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
        },
      },
    });

    return {
      driver,
      stats,
      todayDeliveries,
    };
  }
}