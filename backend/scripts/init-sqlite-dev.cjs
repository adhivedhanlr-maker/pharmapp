const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'dev.db');
const db = new Database(dbPath);

db.pragma('journal_mode = WAL');

db.exec(`
CREATE TABLE IF NOT EXISTS Tenant (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  domain TEXT UNIQUE,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS User (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'CUSTOMER',
  status TEXT NOT NULL DEFAULT 'PENDING',
  name TEXT,
  phone TEXT UNIQUE,
  tenantId TEXT,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS Distributor (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL UNIQUE,
  tenantId TEXT,
  companyName TEXT NOT NULL,
  address TEXT NOT NULL,
  gstNumber TEXT UNIQUE,
  licenseNumber TEXT,
  district TEXT NOT NULL,
  state TEXT NOT NULL DEFAULT 'Kerala',
  minOrderValue REAL NOT NULL DEFAULT 0,
  autoRejectMin INTEGER
);

CREATE TABLE IF NOT EXISTS Retailer (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL UNIQUE,
  tenantId TEXT,
  shopName TEXT NOT NULL,
  address TEXT NOT NULL,
  district TEXT NOT NULL,
  pincode TEXT NOT NULL,
  preferredSalesman TEXT,
  isB2COnline BOOLEAN NOT NULL DEFAULT 0,
  creditLimit REAL NOT NULL DEFAULT 0,
  currentCredit REAL NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS Salesman (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL UNIQUE,
  distributorId TEXT NOT NULL,
  commissionRate REAL NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS ProductMaster (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  genericName TEXT NOT NULL,
  composition TEXT,
  company TEXT NOT NULL,
  division TEXT,
  strength TEXT,
  form TEXT,
  schedule TEXT,
  hsnCode TEXT,
  gstPercentage REAL NOT NULL DEFAULT 12
);

CREATE TABLE IF NOT EXISTS DistributorInventory (
  id TEXT PRIMARY KEY,
  distributorId TEXT NOT NULL,
  productId TEXT NOT NULL,
  ptr REAL NOT NULL,
  mrp REAL NOT NULL,
  stock INTEGER NOT NULL DEFAULT 0,
  expiry DATETIME NOT NULL,
  batchNumber TEXT
);
CREATE UNIQUE INDEX IF NOT EXISTS DistributorInventory_distributorId_productId_key
  ON DistributorInventory(distributorId, productId);

CREATE TABLE IF NOT EXISTS PharmacyConnector (
  id TEXT PRIMARY KEY,
  retailerId TEXT NOT NULL,
  name TEXT NOT NULL,
  softwareType TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'ACTIVE',
  syncIntervalMinutes INTEGER NOT NULL DEFAULT 15,
  config TEXT NOT NULL DEFAULT '{}',
  lastSyncedAt DATETIME,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ConnectorSyncRun (
  id TEXT PRIMARY KEY,
  connectorId TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'RUNNING',
  recordsReceived INTEGER NOT NULL DEFAULT 0,
  recordsUpserted INTEGER NOT NULL DEFAULT 0,
  errorMessage TEXT,
  startedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  endedAt DATETIME
);

CREATE TABLE IF NOT EXISTS RetailerStock (
  id TEXT PRIMARY KEY,
  retailerId TEXT NOT NULL,
  connectorId TEXT,
  productId TEXT,
  externalSku TEXT,
  productName TEXT NOT NULL,
  genericName TEXT,
  batchNumber TEXT NOT NULL DEFAULT '',
  quantity INTEGER NOT NULL DEFAULT 0,
  expiry DATETIME,
  distributorName TEXT,
  distributorContact TEXT,
  distributorLocation TEXT,
  lastSeenAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX IF NOT EXISTS RetailerStock_retailerId_productName_batchNumber_key
  ON RetailerStock(retailerId, productName, batchNumber);

CREATE TABLE IF NOT EXISTS StockAlert (
  id TEXT PRIMARY KEY,
  retailerId TEXT NOT NULL,
  stockId TEXT NOT NULL,
  type TEXT NOT NULL,
  severity TEXT NOT NULL,
  thresholdValue INTEGER,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'OPEN',
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS StockMatch (
  id TEXT PRIMARY KEY,
  stockId TEXT NOT NULL,
  distributorInventoryId TEXT NOT NULL,
  score REAL NOT NULL,
  reason TEXT,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX IF NOT EXISTS StockMatch_stockId_distributorInventoryId_key
  ON StockMatch(stockId, distributorInventoryId);
`);

const userEmail = 'pilot.retailer@pharmapp.local';
const userExists = db.prepare('SELECT id FROM User WHERE email = ?').get(userEmail);

if (!userExists) {
  const userId = 'pilot-user-1';
  const retailerId = 'pilot-retailer-1';
  db.prepare(
    `INSERT INTO User (id, email, password, role, status, name)
     VALUES (?, ?, ?, 'RETAILER', 'ACTIVE', 'Pilot Retailer')`,
  ).run(userId, userEmail, 'Pilot@1234');

  db.prepare(
    `INSERT INTO Retailer (id, userId, shopName, address, district, pincode)
     VALUES (?, ?, 'Pilot Pharmacy', 'Test Address', 'Test District', '000000')`,
  ).run(retailerId, userId);
}

console.log('SQLite initialized at', dbPath);
db.close();
