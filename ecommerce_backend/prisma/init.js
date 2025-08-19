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
  if (process.env.DATABASE_URL && process.env.DATABASE_URL.trim() !== '') {
    return process.env.DATABASE_URL;
  }
  const host = process.env.MYSQL_URL;
  const user = process.env.MYSQL_USER;
  const pass = process.env.MYSQL_PASSWORD;
  const db = process.env.MYSQL_DB;
  const port = process.env.MYSQL_PORT || '3306';

  if (!host || !user || !pass || !db) {
    throw new Error(
      'Missing database configuration. Provide DATABASE_URL or MYSQL_URL, MYSQL_USER, MYSQL_PASSWORD, MYSQL_DB, MYSQL_PORT.'
    );
  }
  const encUser = encodeURIComponent(user);
  const encPass = encodeURIComponent(pass);
  const url = `mysql://${encUser}:${encPass}@${host}:${port}/${db}`;
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

function main() {
  try {
    const url = ensureDatabaseUrl();
    console.log(`[prisma/init] Using DATABASE_URL=${url.replace(/:\\S+@/, ':******@')}`);

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
      runPrisma(['migrate', 'dev', '--name', 'init']);
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
