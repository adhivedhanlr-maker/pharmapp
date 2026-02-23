import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

@ApiTags('inventory')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('inventory')
export class InventoryController {
    constructor(private readonly inventoryService: InventoryService) { }

    @Get('products')
    @ApiOperation({ summary: 'Search products (DB-based)' })
    async searchProducts(@Query('q') query: string) {
        return this.inventoryService.findAllProducts(query || '');
    }

    @Get('distributor/:id')
    @ApiOperation({ summary: 'Get a distributor inventory list' })
    async getDistributorInventory(@Param('id') id: string) {
        return this.inventoryService.getDistributorInventory(id);
    }

    @Get('search/marketplace')
    @ApiOperation({ summary: 'Search across all distributor inventories' })
    async searchMarketplace(
        @Query('query') query: string,
        @Query('district') district?: string,
    ) {
        return this.inventoryService.searchMarketplace(query || '', district);
    }
}
