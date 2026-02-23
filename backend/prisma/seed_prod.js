const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
    try {
        console.log('🚀 Seeding PostgreSQL database on Render (FORCED UPDATE)...');

        // 1. Tenant
        const tenant = await prisma.tenant.upsert({
            where: { domain: 'market.pharmaapp.in' },
            update: { name: 'South India Pharma Market' },
            create: { name: 'South India Pharma Market', domain: 'market.pharmaapp.in' },
        });
        console.log(`✅ Tenant: ${tenant.name}`);

        // 2. Admin
        const adminPwd = await bcrypt.hash('admin123', 10);
        await prisma.user.upsert({
            where: { email: 'admin@pharma.com' },
            update: { password: adminPwd, status: 'ACTIVE' },
            create: { email: 'admin@pharma.com', password: adminPwd, role: 'ADMIN', name: 'Super Admin', status: 'ACTIVE', tenantId: tenant.id },
        });
        console.log('✅ Admin user created/updated (admin@pharma.com / admin123)');

        // 4. Distributor
        const distPwd = await bcrypt.hash('distributor123', 10);
        const distUser = await prisma.user.upsert({
            where: { email: 'dist@pharma.com' },
            update: { password: distPwd, status: 'ACTIVE' },
            create: { email: 'dist@pharma.com', password: distPwd, role: 'DISTRIBUTOR', name: 'Kerala Medicos', status: 'ACTIVE', tenantId: tenant.id },
        });
        await prisma.distributor.upsert({
            where: { userId: distUser.id },
            update: { companyName: 'Kerala Medicos Ernakulam' },
            create: { userId: distUser.id, companyName: 'Kerala Medicos Ernakulam', address: 'MG Road', district: 'Ernakulam', gstNumber: '32DIST00001Z', minOrderValue: 2000, tenantId: tenant.id },
        });
        console.log('✅ Distributor created/updated (dist@pharma.com / distributor123)');

        // 5. Retailer
        const retPwd = await bcrypt.hash('retailer123', 10);
        const retUser = await prisma.user.upsert({
            where: { email: 'retailer@pharma.com' },
            update: { password: retPwd, status: 'ACTIVE' },
            create: { email: 'retailer@pharma.com', password: retPwd, role: 'RETAILER', name: 'City Medical Store', status: 'ACTIVE', tenantId: tenant.id },
        });
        await prisma.retailer.upsert({
            where: { userId: retUser.id },
            update: { shopName: 'City Medical Store' },
            create: { userId: retUser.id, shopName: 'City Medical Store', address: 'Hospital Road', district: 'Ernakulam', pincode: '682001', creditLimit: 50000, tenantId: tenant.id },
        });
        console.log('✅ Retailer created/updated (retailer@pharma.com / retailer123)');

        console.log('\n🎉 Seeding complete! Try logging in now.');
    } catch (e) {
        console.error('❌ Seeding failed:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
