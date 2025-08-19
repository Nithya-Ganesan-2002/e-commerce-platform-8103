#!/usr/bin/env node
/**
 * Initializes the database schema using Prisma.
 *
 * PUBLIC_INTERFACE
 * This script ensures that:
 * - DATABASE_URL is available for Prisma CLI by reading from process.env or composing it from MYSQL_* vars.
 * - If no migrations exist, it will run `prisma migrate dev --name init` to create and apply the initial migration.
 * - If migrations exist, it will run `prisma migrate deploy` to apply them.
 *
 * Usage:
 *   node prisma/init.js
 *
 * Environment variables required:
 * - DATABASE_URL (preferred for Prisma CLI)
 *   or all of:
 *     - MYSQL_URL, MYSQL_USER, MYSQL_PASSWORD, MYSQL_DB, MYSQL_PORT
 */

const { spawnSync } = require('child_process');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

function ensureDatabaseUrl() {
  // If DATABASE_URL is explicitly provided, use it.
  if (process.env.DATABASE_URL && process.env.DATABASE_URL.trim() !== '') {
    return process.env.DATABASE_URL.trim();
  }

  // Fallback to MYSQL_* variables to compose DATABASE_URL.
  let host = process.env.MYSQL_URL;
  const user = process.env.MYSQL_USER;
  const pass = process.env.MYSQL_PASSWORD;
  const db = process.env.MYSQL_DB;
  const port = String(process.env.MYSQL_PORT || '3306');

  if (!host || !user || !pass || !db) {
    throw new Error(
      'Missing database configuration. Provide DATABASE_URL or MYSQL_URL, MYSQL_USER, MYSQL_PASSWORD, MYSQL_DB, MYSQL_PORT.'
    );
  }

  // If host accidentally contains a full URL (e.g., mysql://localhost:5000/mydb),
  // parse and extract host/db/port to avoid malformed URLs.
  try {
    if (/^mysql:\/\//i.test(host)) {
      const u = new URL(host);
      // Only take host and port from the URL if present
      host = u.hostname;
      // If DB name missing from MYSQL_DB, try to infer from URL pathname
      if (!db && u.pathname && u.pathname.length > 1) {
        process.env.MYSQL_DB = u.pathname.replace(/^\//, '');
      }
      if (!process.env.MYSQL_PORT && u.port) {
        process.env.MYSQL_PORT = u.port;
      }
    }
  } catch (_e) {
    // If URL parsing fails, proceed with the original host; Prisma will error if invalid.
  }

  const encUser = encodeURIComponent(user);
  const encPass = encodeURIComponent(pass);
  const finalHost = host;
  const finalPort = String(process.env.MYSQL_PORT || port);
  const finalDb = process.env.MYSQL_DB || db;

  const url = `mysql://${encUser}:${encPass}@${finalHost}:${finalPort}/${finalDb}`;
  process.env.DATABASE_URL = url;
  return url;
}

function runPrisma(args) {
  const cmd = process.platform === 'win32' ? 'npx.cmd' : 'npx';
  const result = spawnSync(cmd, ['--yes', 'prisma', ...args], {
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

function safeMaskUrl(url) {
  try {
    const u = new URL(url);
    // mask username/password if present
    const maskedAuth =
      u.username || u.password ? `${u.username ? '***' : ''}${u.password ? ':***' : ''}@` : '';
    return `${u.protocol}//${maskedAuth}${u.host}${u.pathname}`;
  } catch {
    return String(url).replace(/:\S+@/, ':******@');
  }
}

function main() {
  try {
    const url = ensureDatabaseUrl();
    console.log(`[prisma/init] Using DATABASE_URL=${safeMaskUrl(url)}`);

    const migrationsDir = path.resolve(__dirname, 'migrations');
    const hasMigrations =
      fs.existsSync(migrationsDir) &&
      fs.readdirSync(migrationsDir).some((name) => !name.startsWith('.'));

    if (hasMigrations) {
      console.log('[prisma/init] Detected existing migrations. Running `prisma migrate deploy`...');
      runPrisma(['migrate', 'deploy']);
    } else {
      console.log('[prisma/init] No migrations found. Generating and applying initial migration...');
      // Generate and apply initial migration from schema
      try {
        runPrisma(['migrate', 'dev', '--name', 'init']);
      } catch (e) {
        // If migrate dev fails due to shadow DB or permissions, fallback to db push to at least create tables.
        console.warn(
          '[prisma/init] `prisma migrate dev` failed. Falling back to `prisma db push` to synchronize schema without migrations.'
        );
        runPrisma(['db', 'push', '--accept-data-loss']);
      }
    }

    console.log('[prisma/init] Done.');
  } catch (err) {
    console.error('[prisma/init] Error:', err.message || err);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}
