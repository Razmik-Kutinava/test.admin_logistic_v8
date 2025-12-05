import { Controller, Get, Query } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
} from '@nestjs/swagger';

@ApiTags('dashboard')
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('dispatchers')
  @ApiOperation({ summary: 'Get dispatcher dashboard data' })
  @ApiQuery({ name: 'country', required: false, type: String })
  @ApiQuery({ name: 'city', required: false, type: String })
  @ApiQuery({ name: 'districtId', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Dispatcher dashboard data' })
  getDispatcherDashboard(
    @Query('country') country?: string,
    @Query('city') city?: string,
    @Query('districtId') districtId?: string,
  ) {
    return this.dashboardService.getDispatcherDashboard({
      country,
      city,
      districtId: districtId ? parseInt(districtId) : undefined,
    });
  }

  @Get('management')
  @ApiOperation({ summary: 'Get management dashboard data' })
  @ApiQuery({ name: 'startDate', required: false, type: Date })
  @ApiQuery({ name: 'endDate', required: false, type: Date })
  @ApiQuery({ name: 'country', required: false, type: String })
  @ApiResponse({ status: 200, description: 'Management dashboard data' })
  getManagementDashboard(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('country') country?: string,
  ) {
    return this.dashboardService.getManagementDashboard({
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      country,
    });
  }

  @Get('kpi')
  @ApiOperation({ summary: 'Get KPI metrics' })
  @ApiResponse({ status: 200, description: 'KPI metrics' })
  getKPI() {
    return this.dashboardService.getKPI();
  }
}

