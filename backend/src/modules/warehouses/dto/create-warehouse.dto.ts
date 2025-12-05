import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateWarehouseDto {
  @ApiProperty({ description: 'Warehouse name', example: 'Main Warehouse' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ description: 'Warehouse address', example: '123 Industrial Park' })
  @IsNotEmpty()
  @IsString()
  address: string;

  @ApiProperty({ description: 'City', example: 'New York' })
  @IsNotEmpty()
  @IsString()
  city: string;

  @ApiProperty({ description: 'Country', example: 'USA' })
  @IsNotEmpty()
  @IsString()
  country: string;

  @ApiPropertyOptional({ description: 'Warehouse type', example: 'Distribution Center' })
  @IsOptional()
  @IsString()
  type?: string;
}