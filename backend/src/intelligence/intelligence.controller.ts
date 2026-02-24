import { Body, Controller, Get, Param, Post, Query, Request, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { IntelligenceService } from './intelligence.service';
import { CreateConnectorDto } from './dto/create-connector.dto';
import { SyncConnectorDto } from './dto/sync-connector.dto';
import { SyncRawConnectorDto } from './dto/sync-raw-connector.dto';

@ApiTags('intelligence')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('intelligence')
export class IntelligenceController {
  constructor(private readonly intelligenceService: IntelligenceService) {}

  @Post('connectors')
  @Roles('RETAILER')
  @ApiOperation({ summary: 'Create a pharmacy software connector for the logged-in retailer' })
  async createConnector(@Request() req: any, @Body() dto: CreateConnectorDto) {
    return this.intelligenceService.createConnector(req.user.retailer.id, dto);
  }

  @Get('connectors')
  @Roles('RETAILER')
  @ApiOperation({ summary: 'List retailer connectors' })
  async listConnectors(@Request() req: any) {
    return this.intelligenceService.listConnectors(req.user.retailer.id);
  }

  @Post('connectors/:id/sync')
  @Roles('RETAILER')
  @ApiOperation({ summary: 'Push synced inventory records from a pharmacy software into PharmaFlow' })
  async syncConnector(@Request() req: any, @Param('id') id: string, @Body() dto: SyncConnectorDto) {
    return this.intelligenceService.syncConnector(req.user.retailer.id, id, dto.records);
  }

  @Post('connectors/:id/sync/raw')
  @Roles('RETAILER')
  @ApiOperation({
    summary:
      'Push raw DB rows from a pharmacy software connector agent; rows are normalized by connector fieldMap config',
  })
  async syncRawConnector(@Request() req: any, @Param('id') id: string, @Body() dto: SyncRawConnectorDto) {
    return this.intelligenceService.syncRawConnector(req.user.retailer.id, id, dto.rows);
  }

  @Get('connectors/:id/sync-runs')
  @Roles('RETAILER')
  @ApiOperation({ summary: 'List recent sync runs for a connector' })
  async getConnectorRuns(@Request() req: any, @Param('id') id: string) {
    return this.intelligenceService.getConnectorRuns(req.user.retailer.id, id);
  }

  @Get('retailer/stocks')
  @Roles('RETAILER')
  @ApiOperation({ summary: 'Retailer stock normalized from external pharmacy software' })
  async listRetailerStocks(@Request() req: any) {
    return this.intelligenceService.listRetailerStocks(req.user.retailer.id);
  }

  @Get('retailer/alerts')
  @Roles('RETAILER')
  @ApiOperation({ summary: 'Low stock and near expiry alerts for retailer' })
  async listRetailerAlerts(@Request() req: any) {
    return this.intelligenceService.listRetailerAlerts(req.user.retailer.id);
  }

  @Get('retailer/matches')
  @Roles('RETAILER')
  @ApiOperation({ summary: 'Best distributor matches for shortage/near-expiry stock' })
  async listRetailerMatches(@Request() req: any, @Query('stockId') stockId?: string) {
    return this.intelligenceService.getRetailerMatches(req.user.retailer.id, stockId);
  }

  @Get('distributor/opportunities')
  @Roles('DISTRIBUTOR')
  @ApiOperation({ summary: 'Pharmacies likely to need your stock based on live retailer alerts' })
  async listDistributorOpportunities(@Request() req: any) {
    return this.intelligenceService.getDistributorOpportunities(req.user.distributor.id);
  }

  @Get('connector-blueprints')
  @Roles('RETAILER')
  @ApiOperation({ summary: 'Get universal connector blueprints and a MARG direct-DB preset' })
  async getConnectorBlueprints() {
    return this.intelligenceService.getConnectorBlueprints();
  }
}
