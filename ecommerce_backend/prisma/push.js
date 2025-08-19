#!/usr/bin/env node
/**
 * Synchronize Prisma schema to the database without creating migrations.
 * Useful as a fallback when prisma migrate dev fails due to shadow DB permissions.
 *
 * PUBLIC_INTERFACE
 * Usage:
 *   node prisma/push.js
 *
 * Behavior:
 * - Ensures DATABASE_URL is available, composing it from MYSQL_* if necessary.
 * - Parses MYSQL_URL if provided as a full mysql:// URL to extract host/port/db.
 * - Runs `prisma db push --accept-data-loss`.
 *
 * Required environment variables:
 * - DATABASE_URL (preferred), or
 * - MYSQL_URL, MYSQL_USER, MYSQL_PASSWORD, MYSQL_DB, MYSQL_PORT
 */

const { spawnSync } = require('child_process');
const path = require('path');
const dotenv = require('dotenv');
dotenv.config();

function ensureDatabaseUrl() {
  if (process.env.DATABASE_URL && process.env.DATABASE_URL.trim() !== '') {
    return process.env.DATABASE_URL.trim();
  }

  let host = process.env.MYSQL_URL;
  const user = process.env.MYSQL_USER;
  const pass = process.env.MYSQL_PASSWORD;
  let db = process.env.MYSQL_DB;
  let port = String(process.env.MYSQL_PORT || '3306');

  if (!host || !user || !pass) {
    throw new Error(
      'Missing database configuration. Provide DATABASE_URL or MYSQL_URL, MYSQL_USER, MYSQL_PASSWORD, MYSQL_DB, MYSQL_PORT.'
    );
  }

  // If MYSQL_URL is a full URL, parse it to extract host/port/db
  try {
    if (/^mysql:\/\//i.test(host)) {
      const u = new URL(host);
      host = u.hostname;
      if (!db && u.pathname && u.pathname.length > 1) {
        db = u.pathname.replace(/^\//, '');
      }
      if (!process.env.MYSQL_PORT && u.port) {
        port = u.port;
      }
    }
  } catch {
    // proceed; if invalid, Prisma will error later
  }

  if (!db) {
    throw new Error('Missing MYSQL_DB. Provide DATABASE_URL or set MYSQL_DB.');
  }

  const encUser = encodeURIComponent(user);
  const encPass = encodeURIComponent(pass);
  const url = `mysql://${encUser}:${encPass}@${host}:${port}/${db}`;
  process.env.DATABASE_URL = url;
  return url;
}

function safeMaskUrl(url) {
  try {
    const u = new URL(url);
    const maskedAuth =
      u.username || u.password ? `${u.username ? '***' : ''}${u.password ? ':***' : ''}@` : '';
    return `${u.protocol}//${maskedAuth}${u.host}${u.pathname}`;
  } catch {
    return String(url).replace(/:\S+@/, ':******@');
  }
}

function runPrismaDbPush() {
  const cmd = process.platform === 'win32' ? 'npx.cmd' : 'npx';
  const args = ['--yes', 'prisma', 'db', 'push', '--accept-data-loss'];
  const result = spawnSync(cmd, args, {
    stdio: 'inherit',
    env: process.env,
    cwd: path.resolve(__dirname, '..'),
  });
  if (result.error) {
    throw result.error;
  }
  if (result.status !== 0) {
    process.exit(result.status);
  }
}

function main() {
  try {
    const url = ensureDatabaseUrl();
    console.log(`[prisma/push] Using DATABASE_URL=${safeMaskUrl(url)}`);
    console.log('[prisma/push] Running `prisma db push --accept-data-loss`...');
    runPrismaDbPush();
    console.log('[prisma/push] Done.');
  } catch (err) {
    console.error('[prisma/push] Error:', err.message || err);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}
