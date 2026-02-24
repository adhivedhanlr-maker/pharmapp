import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsObject, IsOptional, IsString, Max, Min } from 'class-validator';

export class CreateConnectorDto {
  @ApiProperty({ example: 'Main Store Sync' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'MARG' })
  @IsString()
  @IsNotEmpty()
  softwareType: string;

  @ApiProperty({ required: false, default: 15, minimum: 5, maximum: 240 })
  @IsOptional()
  @IsInt()
  @Min(5)
  @Max(240)
  syncIntervalMinutes?: number;

  @ApiProperty({ type: Object, example: { endpoint: 'https://vendor-api', apiKey: '***' } })
  @IsObject()
  config: Record<string, unknown>;
}
