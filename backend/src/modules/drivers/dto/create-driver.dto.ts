import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DriverStatus } from '@prisma/client';

export class CreateDriverDto {
  @ApiProperty({ description: 'Driver full name', example: 'John Doe' })
  @IsNotEmpty()
  @IsString()
  @MinLength(2)
  name: string;

  @ApiProperty({ description: 'Driver phone number', example: '+1234567890' })
  @IsNotEmpty()
  @IsString()
  phone: string;

  @ApiPropertyOptional({ description: 'Driver email address', example: 'driver@example.com' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ description: 'Driver license number', example: 'DL-123456' })
  @IsOptional()
  @IsString()
  licenseNumber?: string;

  @ApiPropertyOptional({ description: 'Vehicle type', example: 'Van' })
  @IsOptional()
  @IsString()
  vehicleType?: string;

  @ApiPropertyOptional({ enum: DriverStatus, default: DriverStatus.ACTIVE })
  @IsOptional()
  @IsEnum(DriverStatus)
  status?: DriverStatus;

  @ApiPropertyOptional({ description: 'District ID', example: 1 })
  @IsOptional()
  districtId?: number;
}