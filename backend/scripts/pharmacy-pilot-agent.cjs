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

function loadConfig() {
  const argPath = process.argv[2];
  const defaultPath = path.join(__dirname, 'pilot-config.json');
  const filePath = argPath ? path.resolve(argPath) : defaultPath;
  if (!fs.existsSync(filePath)) {
    throw new Error(`Config file not found: ${filePath}`);
  }
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

async function login(baseUrl, email, password) {
  const res = await fetch(`${baseUrl}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw new Error(`Login failed (${res.status})`);
  const body = await res.json();
  return body.access_token;
}

async function getBlueprint(baseUrl, token, softwareType) {
  const res = await fetch(`${baseUrl}/intelligence/connector-blueprints`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`Blueprint fetch failed (${res.status})`);
  const body = await res.json();
  if (softwareType === 'MARG_DIRECT_DB') return body.margDirectDbPreset;
  return body.universalDirectDb;
}

async function findOrCreateConnector(baseUrl, token, cfg, source) {
  const listRes = await fetch(`${baseUrl}/intelligence/connectors`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!listRes.ok) throw new Error(`Connector list failed (${listRes.status})`);
  const list = await listRes.json();
  const existing = list.find((c) => c.name === cfg.name);
  if (existing) return existing;

  const blueprint = await getBlueprint(baseUrl, token, cfg.softwareType);
  const payload = {
    name: cfg.name,
    softwareType: cfg.softwareType,
    syncIntervalMinutes: cfg.syncIntervalMinutes || 10,
    config: {
      ...(blueprint?.configTemplate || {}),
      source: {
        ...(blueprint?.configTemplate?.source || {}),
        ...source,
        type: 'direct_db',
      },
    },
  };

  const createRes = await fetch(`${baseUrl}/intelligence/connectors`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  });
  if (!createRes.ok) {
    const txt = await createRes.text();
    throw new Error(`Connector create failed (${createRes.status}): ${txt}`);
  }
  return createRes.json();
}

async function pushRawRows(baseUrl, token, connectorId, rows) {
  const res = await fetch(`${baseUrl}/intelligence/connectors/${connectorId}/sync/raw`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ rows }),
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Raw sync failed (${res.status}): ${txt}`);
  }
  return res.json();
}

async function runOnce(config, connectorId, token) {
  const rows = await pullRows(config.source);
  const result = await pushRawRows(config.backendBaseUrl, token, connectorId, rows);
  console.log(
    `[pilot] ${new Date().toISOString()} rows=${rows.length} upserted=${result.recordsUpserted || 0} alerts=${result.alertsGenerated || 0}`,
  );
}

async function main() {
  const config = loadConfig();
  const token = await login(
    config.backendBaseUrl,
    config.retailerLogin?.email,
    config.retailerLogin?.password,
  );

  const connector = await findOrCreateConnector(
    config.backendBaseUrl,
    token,
    config.connector || {},
    config.source || {},
  );

  console.log(`[pilot] using connector: ${connector.name} (${connector.id})`);
  await runOnce(config, connector.id, token);

  const minutes = Number(config.connector?.syncIntervalMinutes || 10);
  const intervalMs = Math.max(1, minutes) * 60 * 1000;
  console.log(`[pilot] schedule started: every ${minutes} minute(s)`);

  setInterval(() => {
    runOnce(config, connector.id, token).catch((error) =>
      console.error(`[pilot] sync error: ${error.message}`),
    );
  }, intervalMs);
}

main().catch((error) => {
  console.error(`[pilot] fatal: ${error.message}`);
  process.exit(1);
});
