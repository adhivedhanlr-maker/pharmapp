import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsInt, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class UpsertDistributorInventoryDto {
  @ApiProperty()
  @IsString()
  productId: string;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  ptr: number;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  mrp: number;

  @ApiProperty()
  @IsInt()
  @Min(0)
  stock: number;

  @ApiProperty({ example: '2027-01-31' })
  @IsDateString()
  expiry: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  batchNumber?: string;
}
