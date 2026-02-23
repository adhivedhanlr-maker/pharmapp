import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

// SQLite-compatible order status strings
type OrderStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';

@Injectable()
export class OrdersService {
    constructor(private prisma: PrismaService) { }

    async createOrder(retailerId: string, items: { distributorProductId: string; quantity: number }[]) {
        const distributorInventories = await this.prisma.distributorInventory.findMany({
            where: { id: { in: items.map(i => i.distributorProductId) } },
            include: { product: true, distributor: true },
        });

        const itemsWithData = items.map(item => {
            const di = distributorInventories.find(d => d.id === item.distributorProductId);
            if (!di) throw new BadRequestException(`Inventory item ${item.distributorProductId} not found`);
            if (di.stock < item.quantity) throw new BadRequestException(`Insufficient stock for ${di.product.name}`);
            return { ...item, di };
        });

        // Group by distributor
        const ordersByDistributor = new Map<string, typeof itemsWithData>();
        itemsWithData.forEach(item => {
            const list = ordersByDistributor.get(item.di.distributorId) || [];
            list.push(item);
            ordersByDistributor.set(item.di.distributorId, list);
        });

        const createdOrders = [];

        for (const [distributorId, distributorItems] of ordersByDistributor.entries()) {
            let subtotal = 0;
            let totalGst = 0;

            distributorItems.forEach(item => {
                const itemTotal = item.di.ptr * item.quantity;
                subtotal += itemTotal;
                totalGst += itemTotal * (item.di.product.gstPercentage / 100);
            });

            const totalAmount = subtotal + totalGst;

            // Check retailer credit limit
            const retailer = await this.prisma.retailer.findUnique({ where: { id: retailerId } });
            if (retailer && retailer.currentCredit + totalAmount > retailer.creditLimit) {
                throw new BadRequestException(`Order exceeds credit limit of ₹${retailer.creditLimit}`);
            }

            const order = await this.prisma.order.create({
                data: {
                    retailerId,
                    distributorId,
                    totalAmount,
                    gstAmount: totalGst,
                    status: 'PENDING',
                    items: {
                        create: distributorItems.map(item => ({
                            inventoryId: item.distributorProductId,
                            quantity: item.quantity,
                            priceAtOrder: item.di.ptr,
                            totalAmount: item.di.ptr * item.quantity,
                        })),
                    },
                },
                include: { items: true },
            });

            // Deduct stock + update credit ledger in one transaction
            await this.prisma.$transaction([
                ...distributorItems.map(item =>
                    this.prisma.distributorInventory.update({
                        where: { id: item.distributorProductId },
                        data: { stock: { decrement: item.quantity } },
                    }),
                ),
                this.prisma.retailer.update({
                    where: { id: retailerId },
                    data: { currentCredit: { increment: totalAmount } },
                }),
                this.prisma.creditLedger.create({
                    data: {
                        distributorId,
                        retailerId,
                        orderId: order.id,
                        amount: totalAmount,
                        type: 'DEBIT',
                        balance: (retailer?.currentCredit ?? 0) + totalAmount,
                    },
                }),
            ]);

            createdOrders.push(order);
        }

        return createdOrders;
    }

    async getRetailerOrders(retailerId: string) {
        return this.prisma.order.findMany({
            where: { retailerId },
            include: {
                distributor: { select: { id: true, companyName: true, district: true } },
                items: { include: { inventory: { include: { product: true } } } },
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    async getDistributorOrders(distributorId: string) {
        return this.prisma.order.findMany({
            where: { distributorId },
            include: {
                retailer: { select: { id: true, shopName: true, district: true } },
                items: { include: { inventory: { include: { product: true } } } },
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    async getSalesmanOrders(salesmanId: string) {
        return this.prisma.order.findMany({
            where: { salesmanId },
            include: {
                distributor: { select: { id: true, companyName: true, district: true } },
                retailer: { select: { id: true, shopName: true, district: true } },
                items: { include: { inventory: { include: { product: true } } } },
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    async updateOrderStatus(orderId: string, status: OrderStatus) {
        return this.prisma.order.update({
            where: { id: orderId },
            data: { status },
        });
    }
}
