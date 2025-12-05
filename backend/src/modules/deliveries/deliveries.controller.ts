import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { DeliveriesService } from './deliveries.service';
import { CreateDeliveryDto } from './dto/create-delivery.dto';
import { UpdateDeliveryDto } from './dto/update-delivery.dto';
import { UpdateDeliveryStatusDto } from './dto/update-status.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { DeliveryStatus } from '@prisma/client';

@ApiTags('deliveries')
@Controller('deliveries')
export class DeliveriesController {
  constructor(private readonly deliveriesService: DeliveriesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new delivery' })
  @ApiResponse({ status: 201, description: 'Delivery successfully created' })
  @ApiResponse({ status: 404, description: 'Order or driver not found' })
  @ApiResponse({ status: 409, description: 'Order already has a delivery' })
  create(@Body() createDeliveryDto: CreateDeliveryDto) {
    return this.deliveriesService.create(createDeliveryDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all deliveries with pagination and filters' })
  @ApiQuery({ name: 'skip', required: false, type: Number })
  @ApiQuery({ name: 'take', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, enum: DeliveryStatus })
  @ApiQuery({ name: 'driverId', required: false, type: Number })
  @ApiQuery({ name: 'date', required: false, type: Date })
  @ApiResponse({ status: 200, description: 'List of deliveries with total count' })
  findAll(
    @Query('skip') skip?: string,
    @Query('take') take?: string,
    @Query('status') status?: DeliveryStatus,
    @Query('driverId') driverId?: string,
    @Query('date') date?: string,
  ) {
    return this.deliveriesService.findAll({
      skip: skip ? parseInt(skip) : undefined,
      take: take ? parseInt(take) : undefined,
      status,
      driverId: driverId ? parseInt(driverId) : undefined,
      date: date ? new Date(date) : undefined,
    });
  }

  @Get('active')
  @ApiOperation({ summary: 'Get all active deliveries' })
  @ApiResponse({ status: 200, description: 'List of active deliveries' })
  getActive() {
    return this.deliveriesService.getActiveDeliveries();
  }

  @Get('driver/:driverId')
  @ApiOperation({ summary: 'Get deliveries for a specific driver' })
  @ApiParam({ name: 'driverId', type: Number })
  @ApiQuery({ name: 'date', required: false, type: Date })
  @ApiResponse({ status: 200, description: 'List of driver deliveries' })
  getDriverDeliveries(
    @Param('driverId', ParseIntPipe) driverId: number,
    @Query('date') date?: string,
  ) {
    return this.deliveriesService.getDriverDeliveries(
      driverId,
      date ? new Date(date) : undefined,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get delivery by ID' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'Delivery found' })
  @ApiResponse({ status: 404, description: 'Delivery not found' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.deliveriesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update delivery' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'Delivery successfully updated' })
  @ApiResponse({ status: 404, description: 'Delivery not found' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDeliveryDto: UpdateDeliveryDto,
  ) {
    return this.deliveriesService.update(id, updateDeliveryDto);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update delivery status' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'Status successfully updated' })
  @ApiResponse({ status: 400, description: 'Invalid status transition' })
  @ApiResponse({ status: 404, description: 'Delivery not found' })
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateStatusDto: UpdateDeliveryStatusDto,
  ) {
    return this.deliveriesService.updateStatus(id, updateStatusDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete delivery' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 204, description: 'Delivery successfully deleted' })
  @ApiResponse({ status: 404, description: 'Delivery not found' })
  @ApiResponse({ status: 409, description: 'Cannot delete active delivery' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.deliveriesService.remove(id);
  }
}