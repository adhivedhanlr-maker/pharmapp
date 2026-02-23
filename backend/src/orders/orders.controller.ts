import { Controller, Get, Post, Body, Param, Patch, UseGuards, Request } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { IsArray, IsString, IsInt, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class OrderItemDto {
    @IsString() distributorProductId: string;
    @IsInt() quantity: number;
}

class CreateOrderDto {
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => OrderItemDto)
    items: OrderItemDto[];
}

@ApiTags('orders')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('orders')
export class OrdersController {
    constructor(private readonly ordersService: OrdersService) { }

    @Post()
    @Roles('RETAILER')
    @ApiOperation({ summary: 'Place an order (auto-splits by distributor)' })
    async createOrder(@Request() req: any, @Body() dto: CreateOrderDto) {
        return this.ordersService.createOrder(req.user.retailer.id, dto.items);
    }

    @Get('retailer')
    @Roles('RETAILER')
    @ApiOperation({ summary: 'Get all orders for the logged-in retailer' })
    async getMyOrders(@Request() req: any) {
        return this.ordersService.getRetailerOrders(req.user.retailer.id);
    }

    @Get('distributor')
    @Roles('DISTRIBUTOR')
    @ApiOperation({ summary: 'Get all incoming orders for the distributor' })
    async getDistributorOrders(@Request() req: any) {
        return this.ordersService.getDistributorOrders(req.user.distributor.id);
    }

    @Get('salesman')
    @Roles('SALESMAN')
    @ApiOperation({ summary: 'Get all assigned orders for the salesman' })
    async getSalesmanOrders(@Request() req: any) {
        return this.ordersService.getSalesmanOrders(req.user.salesman.id);
    }

    @Patch(':id/status')
    @Roles('DISTRIBUTOR', 'ADMIN')
    @ApiOperation({ summary: 'Update order status (Distributor/Admin)' })
    async updateStatus(@Param('id') id: string, @Body('status') status: any) {
        return this.ordersService.updateOrderStatus(id, status);
    }
}
