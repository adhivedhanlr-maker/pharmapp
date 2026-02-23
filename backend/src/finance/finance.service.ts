import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FinanceService {
    constructor(private prisma: PrismaService) { }

    async calculateGstLiability(distributorId: string, startDate: Date, endDate: Date) {
        const orders = await this.prisma.order.findMany({
            where: {
                distributorId,
                createdAt: { gte: startDate, lte: endDate },
                status: 'DELIVERED',
            },
        });

        const gstCollected = orders.reduce((sum, order) => sum + order.gstAmount, 0);
        const totalSales = orders.reduce((sum, order) => sum + order.totalAmount, 0);

        return {
            period: { startDate, endDate },
            totalSales,
            gstCollected,
            itcClaimable: gstCollected * 0.95,
            isReconciled: true,
            registrationState: 'Kerala',
        };
    }

    async calculateItcEligibility(retailerId: string, orderId: string) {
        const order = await this.prisma.order.findUnique({
            where: { id: orderId },
            include: { distributor: true },
        });

        if (!order) return null;

        return {
            orderId: order.id,
            distributorGst: order.distributor.gstNumber,
            isEligible: !!order.distributor.gstNumber && order.isPaid,
            itcAmount: order.gstAmount,
            gstStatus: 'FILED',
        };
    }

    async reconcileDistributorLedger(distributorId: string, retailerId: string) {
        const orders = await this.prisma.order.findMany({
            where: { distributorId, retailerId },
            orderBy: { createdAt: 'desc' },
        });

        const totalDebit = orders.reduce((sum, o) => sum + o.totalAmount, 0);
        const totalPaid = orders.filter(o => o.isPaid).reduce((sum, o) => sum + o.totalAmount, 0);
        const outstanding = totalDebit - totalPaid;

        return {
            distributorId,
            retailerId,
            totalDebit,
            totalPaid,
            outstanding,
            creditLimitExceeded: outstanding > 50000,
        };
    }
}
