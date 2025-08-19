const { PrismaClient } = require('@prisma/client');
const dotenv = require('dotenv');

dotenv.config();

/**
 * Compose DATABASE_URL for Prisma from provided MySQL env variables.
 * We avoid hardcoding DB credentials and rely on .env values.
 */
function buildDatabaseUrl() {
  const host = process.env.MYSQL_URL;
  const user = process.env.MYSQL_USER;
  const pass = process.env.MYSQL_PASSWORD;
  const db = process.env.MYSQL_DB;
  const port = process.env.MYSQL_PORT || '3306';

  if (!host || !user || !pass || !db) {
    throw new Error(
      'Missing MySQL environment variables. Please set MYSQL_URL, MYSQL_USER, MYSQL_PASSWORD, MYSQL_DB, MYSQL_PORT.'
    );
  }
  // Encode username/password to be safe with special characters
  const encUser = encodeURIComponent(user);
  const encPass = encodeURIComponent(pass);

  return `mysql://${encUser}:${encPass}@${host}:${port}/${db}`;
}

// Ensure DATABASE_URL is present for Prisma
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = buildDatabaseUrl();
}

let prisma;
if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient();
} else {
  // Avoid creating multiple instances during dev hot-reload
  if (!global.prisma) {
    global.prisma = new PrismaClient();
  }
  prisma = global.prisma;
}

module.exports = prisma;
