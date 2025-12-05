import { IsNotEmpty, IsOptional, IsString, IsInt, IsArray, IsObject } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateDistrictDto {
  @ApiProperty({ description: 'District name', example: 'Downtown' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ description: 'City name', example: 'New York' })
  @IsNotEmpty()
  @IsString()
  city: string;

  @ApiProperty({ description: 'Country name', example: 'USA' })
  @IsNotEmpty()
  @IsString()
  country: string;

  @ApiPropertyOptional({ description: 'District boundaries GeoJSON' })
  @IsOptional()
  @IsObject()
  boundaries?: any;

  @ApiPropertyOptional({
    description: 'List of streets in the district',
    type: [String],
    example: ['Main St', 'First Ave', 'Second Ave']
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  streets?: string[];

  @ApiPropertyOptional({ description: 'Zone ID', example: 1 })
  @IsOptional()
  @IsInt()
  zoneId?: number;
}