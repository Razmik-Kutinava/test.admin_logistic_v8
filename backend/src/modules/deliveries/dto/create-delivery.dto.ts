import { IsInt, IsNotEmpty, IsOptional, IsString, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DeliveryStatus } from '@prisma/client';

export class CreateDeliveryDto {
  @ApiProperty({ description: 'Order ID', example: 1 })
  @IsNotEmpty()
  @IsInt()
  orderId: number;

  @ApiProperty({ description: 'Driver ID', example: 1 })
  @IsNotEmpty()
  @IsInt()
  driverId: number;

  @ApiPropertyOptional({ enum: DeliveryStatus, default: DeliveryStatus.ASSIGNED })
  @IsOptional()
  @IsEnum(DeliveryStatus)
  status?: DeliveryStatus;

  @ApiPropertyOptional({ description: 'Delivery notes', example: 'Handle with care' })
  @IsOptional()
  @IsString()
  notes?: string;
}