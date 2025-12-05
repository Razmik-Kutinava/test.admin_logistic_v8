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
import { DistrictsService } from './districts.service';
import { CreateDistrictDto } from './dto/create-district.dto';
import { UpdateDistrictDto } from './dto/update-district.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';

@ApiTags('districts')
@Controller('districts')
export class DistrictsController {
  constructor(private readonly districtsService: DistrictsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new district' })
  @ApiResponse({ status: 201, description: 'District successfully created' })
  create(@Body() createDistrictDto: CreateDistrictDto) {
    return this.districtsService.create(createDistrictDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all districts with pagination and filters' })
  @ApiQuery({ name: 'skip', required: false, type: Number })
  @ApiQuery({ name: 'take', required: false, type: Number })
  @ApiQuery({ name: 'city', required: false, type: String })
  @ApiQuery({ name: 'zoneId', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'List of districts with total count' })
  findAll(
    @Query('skip') skip?: string,
    @Query('take') take?: string,
    @Query('city') city?: string,
    @Query('zoneId') zoneId?: string,
  ) {
    return this.districtsService.findAll({
      skip: skip ? parseInt(skip) : undefined,
      take: take ? parseInt(take) : undefined,
      city,
      zoneId: zoneId ? parseInt(zoneId) : undefined,
    });
  }

  @Get('cities')
  @ApiOperation({ summary: 'Get list of all cities' })
  @ApiResponse({ status: 200, description: 'List of cities' })
  getCities() {
    return this.districtsService.getCities();
  }

  @Get('find-by-address')
  @ApiOperation({ summary: 'Find district by address' })
  @ApiQuery({ name: 'address', required: true, type: String })
  @ApiResponse({ status: 200, description: 'District ID or null' })
  findByAddress(@Query('address') address: string) {
    return this.districtsService.findDistrictByAddress(address);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get district by ID' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'District found' })
  @ApiResponse({ status: 404, description: 'District not found' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.districtsService.findOne(id);
  }

  @Get(':id/stats')
  @ApiOperation({ summary: 'Get district statistics' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'District statistics' })
  @ApiResponse({ status: 404, description: 'District not found' })
  getStats(@Param('id', ParseIntPipe) id: number) {
    return this.districtsService.getDistrictStats(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update district' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'District successfully updated' })
  @ApiResponse({ status: 404, description: 'District not found' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDistrictDto: UpdateDistrictDto,
  ) {
    return this.districtsService.update(id, updateDistrictDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete district' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 204, description: 'District successfully deleted' })
  @ApiResponse({ status: 404, description: 'District not found' })
  @ApiResponse({ status: 409, description: 'Cannot delete district with assigned drivers or orders' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.districtsService.remove(id);
  }
}