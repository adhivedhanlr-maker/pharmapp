/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function copyIfExists(from, to) {
  if (!fs.existsSync(from)) {
    throw new Error(`Required file not found: ${from}`);
  }
  fs.copyFileSync(from, to);
}

function main() {
  const backendRoot = path.resolve(__dirname, '..');
  const distDir = path.join(backendRoot, 'dist');
  const packageDir = path.join(distDir, 'connector-package');
  const exePath = path.join(distDir, 'PharmaConnector.exe');
  const configTemplate = path.join(__dirname, 'pilot-config.example.json');
  const packageConfig = path.join(packageDir, 'pilot-config.json');
  const packageExe = path.join(packageDir, 'PharmaConnector.exe');
  const runFile = path.join(packageDir, 'README-Run.txt');

  ensureDir(packageDir);
  copyIfExists(exePath, packageExe);
  copyIfExists(configTemplate, packageConfig);

  fs.writeFileSync(
    runFile,
    [
      'Pharma Connector Pilot Package',
      '',
      '1. Edit pilot-config.json',
      '2. Fill pharmacy DB details and retailer login',
      '3. Double-click PharmaConnector.exe',
      '',
      'The connector will keep syncing on the configured interval.',
      '',
    ].join('\r\n'),
    'utf8',
  );

  console.log(`[package] ready: ${packageDir}`);
}

main();
