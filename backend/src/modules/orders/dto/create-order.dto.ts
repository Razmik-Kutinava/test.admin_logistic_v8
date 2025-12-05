import { IsEnum, IsNotEmpty, IsOptional, IsString, IsInt } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { OrderPriority } from '@prisma/client';

export class CreateOrderDto {
  @ApiProperty({ description: 'Order number', example: 'ORD-2024-001' })
  @IsNotEmpty()
  @IsString()
  orderNumber: string;

  @ApiProperty({ description: 'Delivery address', example: '123 Main St, City' })
  @IsNotEmpty()
  @IsString()
  address: string;

  @ApiProperty({ description: 'Recipient phone number', example: '+1234567890' })
  @IsNotEmpty()
  @IsString()
  recipientPhone: string;

  @ApiPropertyOptional({ description: 'Order description', example: 'Fragile items' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ enum: OrderPriority, default: OrderPriority.NORMAL })
  @IsOptional()
  @IsEnum(OrderPriority)
  priority?: OrderPriority;

  @ApiProperty({ description: 'Warehouse ID', example: 1 })
  @IsNotEmpty()
  @IsInt()
  warehouseId: number;

  @ApiPropertyOptional({ description: 'District ID (auto-determined if not provided)', example: 1 })
  @IsOptional()
  @IsInt()
  districtId?: number;
}