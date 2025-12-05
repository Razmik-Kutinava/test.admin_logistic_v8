import { PartialType } from '@nestjs/swagger';
import { CreateDeliveryDto } from './create-delivery.dto';
import { IsOptional, IsDateString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateDeliveryDto extends PartialType(CreateDeliveryDto) {
  @ApiPropertyOptional({ description: 'Pickup time' })
  @IsOptional()
  @IsDateString()
  pickupTime?: string;

  @ApiPropertyOptional({ description: 'Delivery time' })
  @IsOptional()
  @IsDateString()
  deliveryTime?: string;
}