import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DriversModule } from './modules/drivers/drivers.module';
import { OrdersModule } from './modules/orders/orders.module';
import { DeliveriesModule } from './modules/deliveries/deliveries.module';
import { DistrictsModule } from './modules/districts/districts.module';
import { WarehousesModule } from './modules/warehouses/warehouses.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { PrismaModule } from './common/prisma/prisma.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    DriversModule,
    OrdersModule,
    DeliveriesModule,
    DistrictsModule,
    WarehousesModule,
    DashboardModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
