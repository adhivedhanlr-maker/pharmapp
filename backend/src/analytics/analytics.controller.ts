import { Controller, Get, UseGuards } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

@ApiTags('analytics')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('analytics')
export class AnalyticsController {
    constructor(private readonly analyticsService: AnalyticsService) { }

    @Get('global')
    @Roles('ADMIN')
    @ApiOperation({ summary: 'Global platform stats' })
    async getGlobal() {
        return this.analyticsService.getGlobalStats();
    }

    @Get('district-heatmap')
    @Roles('ADMIN', 'DISTRIBUTOR')
    @ApiOperation({ summary: 'Revenue heatmap by Kerala district' })
    async getHeatmap() {
        return this.analyticsService.getDistrictHeatmap();
    }

    @Get('search-trends')
    @Roles('ADMIN')
    @ApiOperation({ summary: 'Top 10 search queries' })
    async getTrends() {
        return this.analyticsService.getSearchTrends();
    }
}
