import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsObject } from 'class-validator';

export class SyncRawConnectorDto {
  @ApiProperty({
    type: [Object],
    description: 'Raw records as returned by the pharmacy DB query',
  })
  @IsArray()
  @IsObject({ each: true })
  rows: Record<string, unknown>[];
}
