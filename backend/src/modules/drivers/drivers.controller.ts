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
import { DriversService } from './drivers.service';
import { CreateDriverDto } from './dto/create-driver.dto';
import { UpdateDriverDto } from './dto/update-driver.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { DriverStatus } from '@prisma/client';

@ApiTags('drivers')
@Controller('drivers')
export class DriversController {
  constructor(private readonly driversService: DriversService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new driver' })
  @ApiResponse({ status: 201, description: 'Driver successfully created' })
  @ApiResponse({ status: 409, description: 'Driver with this email already exists' })
  create(@Body() createDriverDto: CreateDriverDto) {
    return this.driversService.create(createDriverDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all drivers with pagination' })
  @ApiQuery({ name: 'skip', required: false, type: Number })
  @ApiQuery({ name: 'take', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, enum: DriverStatus })
  @ApiQuery({ name: 'districtId', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'List of drivers with total count' })
  findAll(
    @Query('skip') skip?: string,
    @Query('take') take?: string,
    @Query('status') status?: DriverStatus,
    @Query('districtId') districtId?: string,
  ) {
    return this.driversService.findAll({
      skip: skip ? parseInt(skip) : undefined,
      take: take ? parseInt(take) : undefined,
      status,
      districtId: districtId ? parseInt(districtId) : undefined,
    });
  }

  @Get('available')
  @ApiOperation({ summary: 'Get available drivers for assignment' })
  @ApiQuery({ name: 'districtId', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'List of available drivers' })
  getAvailable(@Query('districtId') districtId?: string) {
    return this.driversService.getAvailableDrivers(
      districtId ? parseInt(districtId) : undefined,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get driver by ID' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'Driver found' })
  @ApiResponse({ status: 404, description: 'Driver not found' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.driversService.findOne(id);
  }

  @Get(':id/stats')
  @ApiOperation({ summary: 'Get driver statistics' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'Driver statistics' })
  @ApiResponse({ status: 404, description: 'Driver not found' })
  getStats(@Param('id', ParseIntPipe) id: number) {
    return this.driversService.getDriverStats(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update driver' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'Driver successfully updated' })
  @ApiResponse({ status: 404, description: 'Driver not found' })
  @ApiResponse({ status: 409, description: 'Email already exists' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDriverDto: UpdateDriverDto,
  ) {
    return this.driversService.update(id, updateDriverDto);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update driver status' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'Status successfully updated' })
  @ApiResponse({ status: 404, description: 'Driver not found' })
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body('status') status: DriverStatus,
  ) {
    return this.driversService.updateStatus(id, status);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete driver' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 204, description: 'Driver successfully deleted' })
  @ApiResponse({ status: 404, description: 'Driver not found' })
  @ApiResponse({ status: 409, description: 'Cannot delete driver with active deliveries' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.driversService.remove(id);
  }
}