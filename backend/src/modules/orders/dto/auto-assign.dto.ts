import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AutoAssignOrderDto {
  @ApiProperty({ description: 'Order ID to assign', example: 1 })
  @IsNotEmpty()
  @IsInt()
  orderId: number;

  @ApiPropertyOptional({ description: 'Preferred driver ID', example: 1 })
  @IsOptional()
  @IsInt()
  preferredDriverId?: number;

  @ApiPropertyOptional({ description: 'Assignment notes', example: 'Urgent delivery' })
  @IsOptional()
  @IsString()
  notes?: string;
}