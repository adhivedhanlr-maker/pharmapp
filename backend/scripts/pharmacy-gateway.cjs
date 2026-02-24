/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');

async function loadDriver(kind) {
  if (kind === 'postgres') return require('pg');
  if (kind === 'mysql') return require('mysql2/promise');
  if (kind === 'sqlserver') return require('mssql');
  throw new Error(`Unsupported dbKind: ${kind}`);
}

async function pullRows(source) {
  const dbKind = (source.dbKind || '').toLowerCase();
  const query = source.query;
  if (!query) throw new Error('source.query is required');

  if (dbKind === 'postgres') {
    const { Client } = await loadDriver(dbKind);
    const client = new Client({
      host: source.host,
      port: source.port || 5432,
      database: source.database,
      user: source.username,
      password: source.password,
      ssl: source.ssl ? { rejectUnauthorized: false } : undefined,
    });
    await client.connect();
    try {
      const result = await client.query(query);
      return result.rows || [];
    } finally {
      await client.end();
    }
  }

  if (dbKind === 'mysql') {
    const mysql = await loadDriver(dbKind);
    const connection = await mysql.createConnection({
      host: source.host,
      port: source.port || 3306,
      database: source.database,
      user: source.username,
      password: source.password,
      ssl: source.ssl ? {} : undefined,
    });
    try {
      const [rows] = await connection.execute(query);
      return rows || [];
    } finally {
      await connection.end();
    }
  }

  if (dbKind === 'sqlserver') {
    const sql = await loadDriver(dbKind);
    const pool = await sql.connect({
      server: source.host,
      port: source.port || 1433,
      database: source.database,
      user: source.username,
      password: source.password,
      options: {
        encrypt: true,
        trustServerCertificate: true,
      },
    });
    try {
      const result = await pool.request().query(query);
      return result.recordset || [];
    } finally {
      await pool.close();
    }
  }

  throw new Error(`Unsupported dbKind: ${dbKind}`);
}

async function pushRows(config, rows) {
  const url = `${config.backendBaseUrl.replace(/\/$/, '')}/intelligence/connectors/${config.connectorId}/sync/raw`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${config.retailerJwt}`,
    },
    body: JSON.stringify({ rows }),
  });

  if (!res.ok) {
    const message = await res.text();
    throw new Error(`Backend sync failed (${res.status}): ${message}`);
  }
  return res.json();
}

async function runOnce(config) {
  const rows = await pullRows(config.source);
  const result = await pushRows(config, rows);
  console.log(`[gateway] synced rows=${rows.length} upserted=${result.recordsUpserted || 0} alerts=${result.alertsGenerated || 0}`);
}

function loadConfig() {
  const argPath = process.argv[2];
  const defaultPath = path.join(__dirname, 'gateway-config.json');
  const filePath = argPath ? path.resolve(argPath) : defaultPath;
  if (!fs.existsSync(filePath)) {
    throw new Error(`Config file not found: ${filePath}`);
  }
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

async function main() {
  const config = loadConfig();
  const minutes = Number(config.scheduleMinutes || 0);
  await runOnce(config);

  if (minutes > 0) {
    const intervalMs = minutes * 60 * 1000;
    console.log(`[gateway] schedule enabled: every ${minutes} minute(s)`);
    setInterval(() => {
      runOnce(config).catch((error) => console.error('[gateway] sync error:', error.message));
    }, intervalMs);
  }
}

main().catch((error) => {
  console.error('[gateway] fatal:', error.message);
  process.exit(1);
});
