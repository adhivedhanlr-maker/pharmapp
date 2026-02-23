import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AnalyticsService {
    constructor(private prisma: PrismaService) { }

    async getGlobalStats() {
        const [orders, revenue, retailers, distributors] = await Promise.all([
            this.prisma.order.count(),
            this.prisma.order.aggregate({ _sum: { totalAmount: true } }),
            this.prisma.retailer.count(),
            this.prisma.distributor.count(),
        ]);

        return {
            totalOrders: orders,
            totalRevenue: revenue._sum.totalAmount || 0,
            totalRetailers: retailers,
            totalDistributors: distributors,
        };
    }

    async getDistrictHeatmap() {
        // Group orders by retailer district
        const districts = await this.prisma.retailer.groupBy({
            by: ['district'],
            _count: { id: true },
        });

        const revenueByDistrict = await this.prisma.order.findMany({
            include: { retailer: true },
        });

        const stats = districts.map(d => {
            const rev = revenueByDistrict
                .filter(o => o.retailer.district === d.district)
                .reduce((sum, o) => sum + o.totalAmount, 0);
            return {
                district: d.district,
                retailerCount: d._count.id,
                revenue: rev,
            };
        });

        return stats;
    }

    async getSearchTrends() {
        return this.prisma.searchLog.groupBy({
            by: ['query'],
            _count: { id: true },
            orderBy: { _count: { id: 'desc' } },
            take: 10,
        });
    }
}
