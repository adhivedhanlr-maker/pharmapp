const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const { faker } = require('@faker-js/faker');

const prisma = new PrismaClient();

const PRODUCT_COUNT = Number(process.env.MASS_PRODUCTS || 300);
const DISTRIBUTOR_COUNT = Number(process.env.MASS_DISTRIBUTORS || 40);
const RETAILER_COUNT = Number(process.env.MASS_RETAILERS || 200);
const INVENTORY_PER_DISTRIBUTOR = Number(process.env.MASS_INV_PER_DISTRIBUTOR || 80);
const RESET_DATA = String(process.env.MASS_RESET || 'true').toLowerCase() === 'true';

const DISTRICTS = [
  'Ernakulam',
  'Kozhikode',
  'Trivandrum',
  'Thrissur',
  'Kannur',
  'Kottayam',
  'Palakkad',
  'Malappuram',
];

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

async function resetData() {
  const safeDelete = async (modelName) => {
    try {
      await prisma[modelName].deleteMany();
    } catch (e) {
      const msg = String(e && e.message ? e.message : e);
      if (!msg.includes('does not exist')) throw e;
    }
  };

  await safeDelete('stockMatch');
  await safeDelete('stockAlert');
  await safeDelete('retailerStock');
  await safeDelete('connectorSyncRun');
  await safeDelete('pharmacyConnector');
  await safeDelete('payment');
  await safeDelete('orderItem');
  await safeDelete('creditLedger');
  await safeDelete('order');
  await safeDelete('prescription');
  await safeDelete('searchLog');
  await safeDelete('notification');
  await safeDelete('auditLog');
  await safeDelete('subscription');
  await safeDelete('salesman');
  await safeDelete('distributorInventory');
  await safeDelete('distributor');
  await safeDelete('retailer');
  await safeDelete('productMaster');
  await safeDelete('user');
  await safeDelete('tenant');
  await safeDelete('analyticsDaily');
}

async function run() {
  faker.seed(42);
  console.log('Mass seeding started...');
  console.log(
    `products=${PRODUCT_COUNT}, distributors=${DISTRIBUTOR_COUNT}, retailers=${RETAILER_COUNT}, inventory/distributor=${INVENTORY_PER_DISTRIBUTOR}, reset=${RESET_DATA}`,
  );

  if (RESET_DATA) {
    console.log('Resetting existing data...');
    await resetData();
  }

  const tenant = await prisma.tenant.create({
    data: { name: 'Mass Seed Tenant', domain: `mass-${Date.now()}.pharma.local` },
  });

  const adminHash = await bcrypt.hash('admin123', 10);
  await prisma.user.create({
    data: {
      email: 'admin@pharma.com',
      password: adminHash,
      role: 'ADMIN',
      status: 'ACTIVE',
      name: 'Super Admin',
      tenantId: tenant.id,
    },
  });

  const productIds = [];
  console.log('Creating products...');
  for (let i = 0; i < PRODUCT_COUNT; i++) {
    const generic = faker.commerce.productMaterial();
    const strength = `${faker.number.int({ min: 5, max: 1000 })}mg`;
    const name = `${faker.commerce.productName().slice(0, 18)} ${strength}`;
    const p = await prisma.productMaster.create({
      data: {
        name,
        genericName: generic,
        company: faker.company.name().slice(0, 40),
        form: pick(['Tablet', 'Capsule', 'Syrup', 'Injection', 'Drops']),
        gstPercentage: pick([5, 12]),
        hsnCode: `HSN${100000 + i}`,
      },
    });
    productIds.push(p.id);
  }

  const distributorHash = await bcrypt.hash('distributor123', 10);
  const distributorIds = [];
  console.log('Creating distributors...');
  for (let i = 0; i < DISTRIBUTOR_COUNT; i++) {
    const user = await prisma.user.create({
      data: {
        email: `dist${i}@pharma.com`,
        password: distributorHash,
        role: 'DISTRIBUTOR',
        status: 'ACTIVE',
        name: `Distributor ${i + 1}`,
        phone: `90000${String(i).padStart(5, '0')}`,
        tenantId: tenant.id,
      },
    });

    const distributor = await prisma.distributor.create({
      data: {
        userId: user.id,
        tenantId: tenant.id,
        companyName: `${faker.company.name().slice(0, 24)} MedSupply`,
        address: faker.location.streetAddress().slice(0, 80),
        district: pick(DISTRICTS),
        state: 'Kerala',
        gstNumber: `32DIST${String(i).padStart(5, '0')}Z`,
        minOrderValue: faker.number.int({ min: 500, max: 5000 }),
      },
    });
    distributorIds.push(distributor.id);
  }

  const retailerHash = await bcrypt.hash('retailer123', 10);
  console.log('Creating retailers...');
  for (let i = 0; i < RETAILER_COUNT; i++) {
    const user = await prisma.user.create({
      data: {
        email: `retailer${i}@pharma.com`,
        password: retailerHash,
        role: 'RETAILER',
        status: 'ACTIVE',
        name: `Retailer ${i + 1}`,
        phone: `91000${String(i).padStart(5, '0')}`,
        tenantId: tenant.id,
      },
    });

    await prisma.retailer.create({
      data: {
        userId: user.id,
        tenantId: tenant.id,
        shopName: `${faker.company.name().slice(0, 28)} Pharmacy`,
        address: faker.location.streetAddress().slice(0, 80),
        district: pick(DISTRICTS),
        pincode: `68${String(1000 + (i % 8000)).padStart(4, '0')}`,
        creditLimit: faker.number.int({ min: 10000, max: 250000 }),
      },
    });
  }

  console.log('Creating distributor inventory...');
  let invCount = 0;
  for (let di = 0; di < distributorIds.length; di++) {
    const used = new Set();
    for (let n = 0; n < INVENTORY_PER_DISTRIBUTOR; n++) {
      let pi = faker.number.int({ min: 0, max: productIds.length - 1 });
      while (used.has(pi)) {
        pi = faker.number.int({ min: 0, max: productIds.length - 1 });
      }
      used.add(pi);

      const ptr = faker.number.int({ min: 20, max: 2000 });
      await prisma.distributorInventory.create({
        data: {
          distributorId: distributorIds[di],
          productId: productIds[pi],
          ptr,
          mrp: Math.round(ptr * faker.number.float({ min: 1.08, max: 1.35, fractionDigits: 2 })),
          stock: faker.number.int({ min: 10, max: 1200 }),
          expiry: faker.date.soon({ days: 700 }),
          batchNumber: `B${di}${n}${faker.string.alphanumeric({ length: 4, casing: 'upper' })}`,
        },
      });
      invCount += 1;
    }
  }

  const counts = {
    users: await prisma.user.count(),
    products: await prisma.productMaster.count(),
    distributors: await prisma.distributor.count(),
    retailers: await prisma.retailer.count(),
    inventory: await prisma.distributorInventory.count(),
  };

  console.log('Mass seed complete.');
  console.log(counts);
  console.log('Credentials: admin@pharma.com/admin123, dist0@pharma.com/distributor123, retailer0@pharma.com/retailer123');
  console.log(`Generated inventory rows in this run: ${invCount}`);
}

run()
  .catch((e) => {
    console.error('Mass seed failed:', e.message || e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
