import { Module } from '@nestjs/common';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { PrismaModule } from '../../common/prisma/prisma.module';
import { DriversModule } from '../drivers/drivers.module';
import { DistrictsModule } from '../districts/districts.module';

@Module({
  imports: [PrismaModule, DriversModule, DistrictsModule],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}