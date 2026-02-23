// CommonJS seed script — works with Node 24 directly (node prisma/seed.cjs)
const path = require('path');

async function main() {
    // Dynamic requires for Prisma 7 with SQLite adapter
    const { PrismaClient } = require('@prisma/client');
    const { PrismaBetterSQLite3 } = require('@prisma/adapter-better-sqlite3');
    const Database = require('better-sqlite3');
    const bcrypt = require('bcrypt');

    const dbPath = path.join(__dirname, 'dev.db');
    console.log(`📁 Opening DB at: ${dbPath}`);

    const db = new Database(dbPath);
    const adapter = new PrismaBetterSQLite3(db);
    const prisma = new PrismaClient({ adapter });

    try {
        console.log('🚀 Seeding PharmaApp database...');

        // 1. Tenant
        const tenant = await prisma.tenant.upsert({
            where: { domain: 'market.pharmaapp.in' },
            update: {},
            create: { name: 'South India Pharma Market', domain: 'market.pharmaapp.in' },
        });
        console.log(`✅ Tenant: ${tenant.name}`);

        // 2. Admin
        const adminPwd = await bcrypt.hash('admin123', 10);
        await prisma.user.upsert({
            where: { email: 'admin@pharma.com' },
            update: {},
            create: { email: 'admin@pharma.com', password: adminPwd, role: 'ADMIN', name: 'Super Admin', status: 'ACTIVE', tenantId: tenant.id },
        });
        console.log('✅ Admin user created');

        // 3. Products (20 common Kerala pharma items)
        const productData = [
            { id: 'paracetamol_500mg', name: 'Paracetamol 500mg', genericName: 'Paracetamol', company: 'Sun Pharma', form: 'Tablet', gstPercentage: 12 },
            { id: 'amoxicillin_250mg', name: 'Amoxicillin 250mg', genericName: 'Amoxicillin', company: 'Cipla', form: 'Capsule', gstPercentage: 12 },
            { id: 'azithromycin_500mg', name: 'Azithromycin 500mg', genericName: 'Azithromycin', company: 'Lupin', form: 'Tablet', gstPercentage: 12 },
            { id: 'metformin_500mg', name: 'Metformin 500mg', genericName: 'Metformin', company: 'Mankind', form: 'Tablet', gstPercentage: 5 },
            { id: 'omeprazole_20mg', name: 'Omeprazole 20mg', genericName: 'Omeprazole', company: 'Dr. Reddy', form: 'Capsule', gstPercentage: 12 },
            { id: 'atorvastatin_10mg', name: 'Atorvastatin 10mg', genericName: 'Atorvastatin', company: 'Alkem', form: 'Tablet', gstPercentage: 12 },
            { id: 'cetirizine_10mg', name: 'Cetirizine 10mg', genericName: 'Cetirizine', company: 'Torrent', form: 'Tablet', gstPercentage: 5 },
            { id: 'pantoprazole_40mg', name: 'Pantoprazole 40mg', genericName: 'Pantoprazole', company: 'Zydus', form: 'Tablet', gstPercentage: 12 },
            { id: 'amlodipine_5mg', name: 'Amlodipine 5mg', genericName: 'Amlodipine', company: 'Abbott', form: 'Tablet', gstPercentage: 12 },
            { id: 'telmisartan_40mg', name: 'Telmisartan 40mg', genericName: 'Telmisartan', company: 'Glenmark', form: 'Tablet', gstPercentage: 12 },
            { id: 'dolo_650mg', name: 'Dolo 650mg', genericName: 'Paracetamol', company: 'Micro Labs', form: 'Tablet', gstPercentage: 12 },
            { id: 'augmentin_625mg', name: 'Augmentin 625mg', genericName: 'Amoxicillin Clavulanate', company: 'GSK', form: 'Tablet', gstPercentage: 12 },
            { id: 'montair_lc', name: 'Montair LC', genericName: 'Montelukast Levocetirizine', company: 'Cipla', form: 'Tablet', gstPercentage: 12 },
            { id: 'combiflam', name: 'Combiflam', genericName: 'Ibuprofen Paracetamol', company: 'Sanofi', form: 'Tablet', gstPercentage: 12 },
            { id: 'allegra_180mg', name: 'Allegra 180mg', genericName: 'Fexofenadine', company: 'Sanofi', form: 'Tablet', gstPercentage: 12 },
            { id: 'nexium_40mg', name: 'Nexium 40mg', genericName: 'Esomeprazole', company: 'AstraZeneca', form: 'Tablet', gstPercentage: 12 },
            { id: 'glycomet_500mg', name: 'Glycomet 500mg', genericName: 'Metformin', company: 'USV', form: 'Tablet', gstPercentage: 5 },
            { id: 'telma_40mg', name: 'Telma 40mg', genericName: 'Telmisartan', company: 'Glenmark', form: 'Tablet', gstPercentage: 12 },
            { id: 'zifi_200mg', name: 'Zifi 200mg', genericName: 'Cefixime', company: 'FDC', form: 'Tablet', gstPercentage: 12 },
            { id: 'crocin_advance', name: 'Crocin Advance', genericName: 'Paracetamol', company: 'GSK', form: 'Tablet', gstPercentage: 12 },
        ];

        const products = [];
        for (const p of productData) {
            const prod = await prisma.productMaster.upsert({ where: { id: p.id }, update: {}, create: p });
            products.push(prod);
        }
        console.log(`✅ ${products.length} Products created`);

        // 4. Distributors
        const districts = ['Ernakulam', 'Kozhikode', 'Trivandrum', 'Thrissur', 'Kannur'];
        const distPwd = await bcrypt.hash('distributor123', 10);
        const distributors = [];

        for (let i = 0; i < 5; i++) {
            const user = await prisma.user.upsert({
                where: { email: `dist${i}@pharma.com` },
                update: {},
                create: { email: `dist${i}@pharma.com`, password: distPwd, role: 'DISTRIBUTOR', name: `Distributor ${i + 1}`, status: 'ACTIVE', tenantId: tenant.id },
            });
            const dist = await prisma.distributor.upsert({
                where: { userId: user.id },
                update: {},
                create: { userId: user.id, companyName: `Kerala Medicos ${districts[i]}`, address: `${i + 10} MG Road`, district: districts[i], gstNumber: `32DIST${String(i).padStart(5, '0')}Z`, minOrderValue: 2000, tenantId: tenant.id },
            });
            distributors.push(dist);
        }
        console.log(`✅ ${distributors.length} Distributors created`);

        // 5. Retailers
        const retPwd = await bcrypt.hash('retailer123', 10);
        const retailers = [];
        for (let i = 0; i < 10; i++) {
            const user = await prisma.user.upsert({
                where: { email: `retailer${i}@pharma.com` },
                update: {},
                create: { email: `retailer${i}@pharma.com`, password: retPwd, role: 'RETAILER', name: `Retailer ${i + 1}`, status: 'ACTIVE', tenantId: tenant.id },
            });
            const ret = await prisma.retailer.upsert({
                where: { userId: user.id },
                update: {},
                create: { userId: user.id, shopName: `City Medical Store ${i + 1}`, address: `${i + 1} Hospital Road`, district: districts[i % 5], pincode: `68${String(1000 + i).padStart(4, '0')}`, creditLimit: 50000, tenantId: tenant.id },
            });
            retailers.push(ret);
        }
        console.log(`✅ ${retailers.length} Retailers created`);

        // 6. Inventory
        const expiries = [
            new Date(2027, 5, 1), new Date(2027, 8, 1),
            new Date(2026, 11, 1), new Date(2028, 2, 1), new Date(2027, 2, 1)
        ];
        let invCount = 0;
        for (const dist of distributors) {
            for (let pi = 0; pi < 10; pi++) {
                const prod = products[pi];
                const basePtr = 50 + pi * 20;
                await prisma.distributorInventory.upsert({
                    where: { distributorId_productId: { distributorId: dist.id, productId: prod.id } },
                    update: {},
                    create: {
                        distributorId: dist.id, productId: prod.id,
                        ptr: basePtr, mrp: Math.round(basePtr * 1.3),
                        stock: 200 + pi * 50, expiry: expiries[pi % 5],
                        batchNumber: `BT${dist.district.slice(0, 3).toUpperCase()}${pi}`,
                    },
                });
                invCount++;
            }
        }
        console.log(`✅ ${invCount} Inventory entries created`);

        console.log('\n🎉 Seeding complete!');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('Demo logins:');
        console.log('  Admin       → admin@pharma.com    / admin123');
        console.log('  Distributor → dist0@pharma.com    / distributor123');
        console.log('  Retailer    → retailer0@pharma.com / retailer123');

    } finally {
        await prisma.$disconnect();
    }
}

main().catch((e) => { console.error(e); process.exit(1); });
