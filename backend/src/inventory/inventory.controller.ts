import { Body, Controller, Get, Param, Post, Query, Request, UseGuards } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { UpsertDistributorInventoryDto } from './dto/upsert-distributor-inventory.dto';

@ApiTags('inventory')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
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

    @Post('distributor/upsert')
    @Roles('DISTRIBUTOR')
    @ApiOperation({ summary: 'Create or update distributor stock availability for a product' })
    async upsertDistributorInventory(@Request() req: any, @Body() dto: UpsertDistributorInventoryDto) {
        return this.inventoryService.updateStock(req.user.distributor.id, dto.productId, {
            stock: dto.stock,
            ptr: dto.ptr,
            mrp: dto.mrp,
            expiry: new Date(dto.expiry),
            batchNumber: dto.batchNumber,
        });
    }
}
