import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateDistrictDto } from './dto/create-district.dto';
import { UpdateDistrictDto } from './dto/update-district.dto';
import { District, Prisma } from '@prisma/client';

type DistrictWithRelations = Prisma.DistrictGetPayload<{
  include: {
    zone: true;
    _count: {
      select: { drivers: true; orders: true };
    };
  };
}>;

@Injectable()
export class DistrictsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createDistrictDto: CreateDistrictDto): Promise<DistrictWithRelations> {
    return await this.prisma.district.create({
      data: createDistrictDto,
      include: {
        zone: true,
        _count: {
          select: { drivers: true, orders: true },
        },
      },
    });
  }

  async findAll(params?: {
    skip?: number;
    take?: number;
    city?: string;
    zoneId?: number;
  }): Promise<{ data: DistrictWithRelations[]; total: number }> {
    const { skip = 0, take = 10, city, zoneId } = params || {};

    const where: Prisma.DistrictWhereInput = {};
    if (city) where.city = city;
    if (zoneId) where.zoneId = zoneId;

    const [data, total] = await Promise.all([
      this.prisma.district.findMany({
        where,
        skip,
        take,
        include: {
          zone: true,
          _count: {
            select: { drivers: true, orders: true },
          },
        },
        orderBy: {
          name: 'asc',
        },
      }),
      this.prisma.district.count({ where }),
    ]);

    return { data, total };
  }

  async findOne(id: number): Promise<any> {
    const district = await this.prisma.district.findUnique({
      where: { id },
      include: {
        zone: true,
        drivers: {
          take: 10,
          orderBy: {
            createdAt: 'desc',
          },
        },
        _count: {
          select: { drivers: true, orders: true },
        },
      },
    });

    if (!district) {
      throw new NotFoundException(`District with ID ${id} not found`);
    }

    return district;
  }

  async update(id: number, updateDistrictDto: UpdateDistrictDto): Promise<DistrictWithRelations> {
    await this.findOne(id); // Check if exists

    return await this.prisma.district.update({
      where: { id },
      data: updateDistrictDto,
      include: {
        zone: true,
        _count: {
          select: { drivers: true, orders: true },
        },
      },
    });
  }

  async remove(id: number): Promise<void> {
    const district = await this.findOne(id);

    // Check if district has assigned drivers or orders
    if (district._count.drivers > 0) {
      throw new ConflictException('Cannot delete district with assigned drivers');
    }

    if (district._count.orders > 0) {
      throw new ConflictException('Cannot delete district with assigned orders');
    }

    await this.prisma.district.delete({
      where: { id },
    });
  }

  async findDistrictByAddress(address: string): Promise<number | null> {
    // Simple implementation: search for districts by matching street names
    // In production, you might want to use geocoding APIs or more sophisticated matching

    const normalizedAddress = address.toLowerCase();
    const districts: Array<{ id: number; streets: string[] }> = await this.prisma.district.findMany({
      select: {
        id: true,
        streets: true,
      },
    });

    for (const district of districts) {
      if (district.streets && district.streets.length > 0) {
        for (const street of district.streets) {
          if (normalizedAddress.includes(street.toLowerCase())) {
            return district.id;
          }
        }
      }
    }

    // If no district found by street, try to find by city
    const words = normalizedAddress.split(/[\s,]+/);
    const districtByCity = await this.prisma.district.findFirst({
      where: {
        city: {
          in: words,
          mode: 'insensitive',
        },
      },
    });

    return districtByCity?.id || null;
  }

  async getDistrictStats(id: number): Promise<any> {
    const district = await this.findOne(id);

    const stats = await Promise.all([
      // Active drivers in district
      this.prisma.driver.count({
        where: {
          districtId: id,
          status: 'ACTIVE',
        },
      }),
      // Today's orders in district
      this.prisma.order.count({
        where: {
          districtId: id,
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
          },
        },
      }),
      // Active deliveries in district
      this.prisma.delivery.count({
        where: {
          driver: {
            districtId: id,
          },
          status: {
            in: ['ASSIGNED', 'PICKED_UP', 'IN_TRANSIT'],
          },
        },
      }),
    ]);

    return {
      district,
      activeDrivers: stats[0],
      todayOrders: stats[1],
      activeDeliveries: stats[2],
    };
  }

  async getCities(): Promise<string[]> {
    const cities = await this.prisma.district.findMany({
      select: { city: true },
      distinct: ['city'],
    });

    return cities.map(d => d.city);
  }
}