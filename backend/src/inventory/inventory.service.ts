import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

// Note: SQLite does not support mode:'insensitive'. Use contains without mode for case-sensitive search.
// For case-insensitive behavior on SQLite, use a LOWER() approach or store names lowercased.

@Injectable()
export class InventoryService {
    constructor(private prisma: PrismaService) { }

    async findAllProducts(query: string) {
        return this.prisma.productMaster.findMany({
            where: query
                ? {
                    OR: [
                        { name: { contains: query } },
                        { genericName: { contains: query } },
                        { company: { contains: query } },
                    ],
                }
                : undefined,
            take: 50,
            orderBy: { name: 'asc' },
        });
    }

    async getDistributorInventory(distributorId: string) {
        return this.prisma.distributorInventory.findMany({
            where: { distributorId },
            include: { product: true },
            orderBy: { product: { name: 'asc' } },
        });
    }

    async updateStock(
        distributorId: string,
        productId: string,
        data: { stock: number; ptr: number; mrp: number; expiry: Date; batchNumber?: string },
    ) {
        return this.prisma.distributorInventory.upsert({
            where: { distributorId_productId: { distributorId, productId } },
            update: {
                stock: data.stock,
                ptr: data.ptr,
                mrp: data.mrp,
                expiry: data.expiry,
                batchNumber: data.batchNumber,
            },
            create: {
                distributorId,
                productId,
                stock: data.stock,
                ptr: data.ptr,
                mrp: data.mrp,
                expiry: data.expiry,
                batchNumber: data.batchNumber,
            },
        });
    }

    async searchMarketplace(query: string, district?: string) {
        return this.prisma.distributorInventory.findMany({
            where: {
                ...(query
                    ? {
                        product: {
                            OR: [
                                { name: { contains: query } },
                                { genericName: { contains: query } },
                                { composition: { contains: query } },
                            ],
                        },
                    }
                    : {}),
                ...(district ? { distributor: { district } } : {}),
                stock: { gt: 0 },
            },
            include: {
                product: true,
                distributor: {
                    select: { id: true, companyName: true, district: true, minOrderValue: true },
                },
            },
            orderBy: { stock: 'desc' },
            take: 100,
        });
    }
}
