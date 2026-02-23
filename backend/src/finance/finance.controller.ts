import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { FinanceService } from './finance.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';

@ApiTags('finance')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('finance')
export class FinanceController {
    constructor(private readonly financeService: FinanceService) { }

    @Get('gst-summary')
    @Roles('DISTRIBUTOR', 'ADMIN')
    @ApiOperation({ summary: 'GST liability summary for a distributor' })
    @ApiQuery({ name: 'distributorId', required: true })
    @ApiQuery({ name: 'startDate', required: true })
    @ApiQuery({ name: 'endDate', required: true })
    async getGstSummary(
        @Query('distributorId') distributorId: string,
        @Query('startDate') startDate: string,
        @Query('endDate') endDate: string,
    ) {
        return this.financeService.calculateGstLiability(
            distributorId,
            new Date(startDate),
            new Date(endDate),
        );
    }

    @Get('itc-eligibility')
    @Roles('RETAILER', 'DISTRIBUTOR', 'ADMIN')
    @ApiOperation({ summary: 'Check ITC eligibility for an order' })
    async getItcEligibility(
        @Query('retailerId') retailerId: string,
        @Query('orderId') orderId: string,
    ) {
        return this.financeService.calculateItcEligibility(retailerId, orderId);
    }

    @Get('ledger/reconcile')
    @Roles('DISTRIBUTOR', 'RETAILER', 'ADMIN')
    @ApiOperation({ summary: 'Reconcile outstanding balance between distributor and retailer' })
    async reconcileLedger(
        @Query('distributorId') distributorId: string,
        @Query('retailerId') retailerId: string,
    ) {
        return this.financeService.reconcileDistributorLedger(distributorId, retailerId);
    }
}
