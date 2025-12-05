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
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { AutoAssignOrderDto } from './dto/auto-assign.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { OrderStatus, OrderPriority } from '@prisma/client';

@ApiTags('orders')
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new order' })
  @ApiResponse({ status: 201, description: 'Order successfully created' })
  @ApiResponse({ status: 409, description: 'Order with this number already exists' })
  create(@Body() createOrderDto: CreateOrderDto) {
    return this.ordersService.create(createOrderDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all orders with pagination and filters' })
  @ApiQuery({ name: 'skip', required: false, type: Number })
  @ApiQuery({ name: 'take', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, enum: OrderStatus })
  @ApiQuery({ name: 'priority', required: false, enum: OrderPriority })
  @ApiQuery({ name: 'warehouseId', required: false, type: Number })
  @ApiQuery({ name: 'districtId', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'List of orders with total count' })
  findAll(
    @Query('skip') skip?: string,
    @Query('take') take?: string,
    @Query('status') status?: OrderStatus,
    @Query('priority') priority?: OrderPriority,
    @Query('warehouseId') warehouseId?: string,
    @Query('districtId') districtId?: string,
  ) {
    return this.ordersService.findAll({
      skip: skip ? parseInt(skip) : undefined,
      take: take ? parseInt(take) : undefined,
      status,
      priority,
      warehouseId: warehouseId ? parseInt(warehouseId) : undefined,
      districtId: districtId ? parseInt(districtId) : undefined,
    });
  }

  @Get('unassigned')
  @ApiOperation({ summary: 'Get all unassigned orders' })
  @ApiResponse({ status: 200, description: 'List of unassigned orders' })
  getUnassigned() {
    return this.ordersService.getUnassignedOrders();
  }

  @Post('auto-assign')
  @ApiOperation({ summary: 'Auto-assign an order to a driver' })
  @ApiResponse({ status: 200, description: 'Order successfully assigned' })
  @ApiResponse({ status: 400, description: 'Invalid request or driver not available' })
  @ApiResponse({ status: 404, description: 'Order not found or no available drivers' })
  autoAssign(@Body() autoAssignDto: AutoAssignOrderDto) {
    return this.ordersService.autoAssignOrder(autoAssignDto);
  }

  @Post('bulk-assign')
  @ApiOperation({ summary: 'Bulk auto-assign multiple orders' })
  @ApiBody({ description: 'Array of order IDs', type: [Number] })
  @ApiResponse({ status: 200, description: 'Bulk assignment results' })
  bulkAssign(@Body() orderIds: number[]) {
    return this.ordersService.bulkAssign(orderIds);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get order by ID' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'Order found' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.ordersService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update order' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'Order successfully updated' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  @ApiResponse({ status: 409, description: 'Order number already exists' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateOrderDto: UpdateOrderDto,
  ) {
    return this.ordersService.update(id, updateOrderDto);
  }

  @Post(':id/cancel')
  @ApiOperation({ summary: 'Cancel an order' })
  @ApiParam({ name: 'id', type: Number })
  @ApiBody({ schema: { properties: { reason: { type: 'string' } } } })
  @ApiResponse({ status: 200, description: 'Order successfully cancelled' })
  @ApiResponse({ status: 400, description: 'Cannot cancel completed order' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  cancelOrder(
    @Param('id', ParseIntPipe) id: number,
    @Body('reason') reason?: string,
  ) {
    return this.ordersService.cancelOrder(id, reason);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete order' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 204, description: 'Order successfully deleted' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  @ApiResponse({ status: 409, description: 'Cannot delete order with associated delivery' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.ordersService.remove(id);
  }
}