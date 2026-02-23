const { PrismaClient } = require('@prisma/client');
const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3');
const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'prisma', 'dev.db');
console.log('DB path:', dbPath);

const db = new Database(dbPath);
const adapter = new PrismaBetterSqlite3(db);
const p = new PrismaClient({ adapter });

p.tenant.findMany()
    .then(r => { console.log('DB OK, tenants found:', r.length); return p.$disconnect(); })
    .catch(e => { console.log('ERROR:', e.message); process.exit(1); });
