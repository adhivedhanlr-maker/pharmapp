import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsDateString, IsInt, IsOptional, IsString, Min, ValidateNested } from 'class-validator';

class SyncRecordDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  sku?: string;

  @ApiProperty({ example: 'Paracetamol 500mg' })
  @IsString()
  productName: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  genericName?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  batchNumber?: string;

  @ApiProperty({ example: 42 })
  @IsInt()
  @Min(0)
  quantity: number;

  @ApiProperty({ required: false, example: '2026-12-31' })
  @IsOptional()
  @IsDateString()
  expiry?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  distributorName?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  distributorContact?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  distributorLocation?: string;
}

export class SyncConnectorDto {
  @ApiProperty({ type: [SyncRecordDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SyncRecordDto)
  records: SyncRecordDto[];
}

export type SyncRecordInput = SyncRecordDto;
