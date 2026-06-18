/**
 * Cardnect — one-time Appwrite database setup
 *
 * Creates database "cardnect" and 6 collections matching the PostgreSQL schema.
 * Safe to re-run: skips resources that already exist.
 *
 * Prerequisites:
 *   1. Appwrite Cloud project with an API key scoped for databases.read + databases.write
 *   2. Copy .env.example → .env and fill in your values (never commit .env)
 *
 * Usage:
 *   cd scripts/appwrite-setup
 *   npm install
 *   npm run setup
 */

import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Client, Databases, DatabasesIndexType } from 'node-appwrite';

const __dirname = dirname(fileURLToPath(import.meta.url));

function loadEnvFile() {
  const envPath = resolve(__dirname, '.env');
  if (!existsSync(envPath)) return;

  for (const line of readFileSync(envPath, 'utf8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim();
    if (!process.env[key]) process.env[key] = value;
  }
}

loadEnvFile();

const ENDPOINT = process.env.APPWRITE_ENDPOINT ?? 'https://sgp.cloud.appwrite.io/v1';
const PROJECT_ID = process.env.APPWRITE_PROJECT_ID;
const API_KEY = process.env.APPWRITE_API_KEY;
const DATABASE_ID = process.env.APPWRITE_DATABASE_ID ?? 'cardnect';

if (!PROJECT_ID || !API_KEY) {
  console.error(
    'Missing APPWRITE_PROJECT_ID or APPWRITE_API_KEY.\n' +
      'Copy .env.example to .env in scripts/appwrite-setup/ and fill in your values.'
  );
  process.exit(1);
}

const client = new Client().setEndpoint(ENDPOINT).setProject(PROJECT_ID).setKey(API_KEY);
const databases = new Databases(client);

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function isAlreadyExists(error) {
  return error?.code === 409 || error?.type === 'collection_already_exists' || error?.type === 'database_already_exists';
}

async function ensureDatabase() {
  try {
    await databases.get({ databaseId: DATABASE_ID });
    console.log(`✓ Database "${DATABASE_ID}" already exists`);
  } catch {
    await databases.create({ databaseId: DATABASE_ID, name: 'Cardnect' });
    console.log(`✓ Created database "${DATABASE_ID}"`);
  }
}

async function ensureCollection(collectionId, name) {
  try {
    await databases.getCollection(DATABASE_ID, collectionId);
    console.log(`  ✓ Collection "${collectionId}" already exists`);
  } catch {
    await databases.createCollection(DATABASE_ID, collectionId, name, [], false, true);
    console.log(`  ✓ Created collection "${collectionId}"`);
  }
}

async function attributeExists(collectionId, key) {
  try {
    const attr = await databases.getAttribute(DATABASE_ID, collectionId, key);
    return attr.status === 'available';
  } catch {
    return false;
  }
}

async function waitForAttribute(collectionId, key, maxAttempts = 60) {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const attr = await databases.getAttribute(DATABASE_ID, collectionId, key);
    if (attr.status === 'available') return;
    if (attr.status === 'failed') {
      throw new Error(`Attribute "${key}" failed to build in "${collectionId}"`);
    }
    await sleep(1000);
  }
  throw new Error(`Timed out waiting for attribute "${key}" in "${collectionId}"`);
}

async function ensureStringAttribute(collectionId, key, size, required) {
  if (await attributeExists(collectionId, key)) {
    console.log(`    · attribute "${key}" (string) exists`);
    return;
  }
  await databases.createStringAttribute(DATABASE_ID, collectionId, key, size, required);
  await waitForAttribute(collectionId, key);
  console.log(`    ✓ attribute "${key}" (string)`);
}

async function ensureTextAttribute(collectionId, key, required) {
  if (await attributeExists(collectionId, key)) {
    console.log(`    · attribute "${key}" (text) exists`);
    return;
  }
  await databases.createTextAttribute(DATABASE_ID, collectionId, key, required);
  await waitForAttribute(collectionId, key);
  console.log(`    ✓ attribute "${key}" (text)`);
}

async function ensureBooleanAttribute(collectionId, key, required) {
  if (await attributeExists(collectionId, key)) {
    console.log(`    · attribute "${key}" (boolean) exists`);
    return;
  }
  await databases.createBooleanAttribute(DATABASE_ID, collectionId, key, required);
  await waitForAttribute(collectionId, key);
  console.log(`    ✓ attribute "${key}" (boolean)`);
}

async function ensureIntegerAttribute(collectionId, key, required) {
  if (await attributeExists(collectionId, key)) {
    console.log(`    · attribute "${key}" (integer) exists`);
    return;
  }
  await databases.createIntegerAttribute(DATABASE_ID, collectionId, key, required);
  await waitForAttribute(collectionId, key);
  console.log(`    ✓ attribute "${key}" (integer)`);
}

async function ensureFloatAttribute(collectionId, key, required) {
  if (await attributeExists(collectionId, key)) {
    console.log(`    · attribute "${key}" (float) exists`);
    return;
  }
  await databases.createFloatAttribute(DATABASE_ID, collectionId, key, required);
  await waitForAttribute(collectionId, key);
  console.log(`    ✓ attribute "${key}" (float)`);
}

async function ensureDatetimeAttribute(collectionId, key, required) {
  if (await attributeExists(collectionId, key)) {
    console.log(`    · attribute "${key}" (datetime) exists`);
    return;
  }
  await databases.createDatetimeAttribute(DATABASE_ID, collectionId, key, required);
  await waitForAttribute(collectionId, key);
  console.log(`    ✓ attribute "${key}" (datetime)`);
}

async function ensureEnumAttribute(collectionId, key, elements, required) {
  if (await attributeExists(collectionId, key)) {
    console.log(`    · attribute "${key}" (enum) exists`);
    return;
  }
  await databases.createEnumAttribute(DATABASE_ID, collectionId, key, elements, required);
  await waitForAttribute(collectionId, key);
  console.log(`    ✓ attribute "${key}" (enum)`);
}

async function ensureIndex(collectionId, key, type, attributes) {
  try {
    await databases.getIndex(DATABASE_ID, collectionId, key);
    console.log(`    · index "${key}" exists`);
  } catch {
    await databases.createIndex(DATABASE_ID, collectionId, key, type, attributes);
    console.log(`    ✓ index "${key}"`);
  }
}

const REQUEST_STATUS_VALUES = ['PENDING', 'ACCEPTED', 'REJECTED', 'COMPLETED'];

const COLLECTIONS = [
  {
    id: 'users',
    name: 'Users',
    setup: async (id) => {
      await ensureStringAttribute(id, 'email', 255, true);
      await ensureStringAttribute(id, 'name', 255, false);
      await ensureStringAttribute(id, 'phone', 20, false);
      await ensureStringAttribute(id, 'passwordHash', 72, false);
      await ensureBooleanAttribute(id, 'phoneVerified', true);
      await ensureBooleanAttribute(id, 'emailVerified', true);
      await ensureBooleanAttribute(id, 'verifiedUser', true);
      await ensureDatetimeAttribute(id, 'createdAt', true);
      await ensureDatetimeAttribute(id, 'updatedAt', true);
      await ensureIndex(id, 'idx_email', DatabasesIndexType.Unique, ['email']);
    },
  },
  {
    id: 'otp_codes',
    name: 'OTP Codes',
    setup: async (id) => {
      await ensureStringAttribute(id, 'email', 255, true);
      await ensureStringAttribute(id, 'otpCode', 6, true);
      await ensureDatetimeAttribute(id, 'expiresAt', true);
      await ensureDatetimeAttribute(id, 'createdAt', true);
      await ensureIndex(id, 'idx_email', DatabasesIndexType.Key, ['email']);
    },
  },
  {
    id: 'phone_otps',
    name: 'Phone OTPs',
    setup: async (id) => {
      await ensureStringAttribute(id, 'phone', 20, true);
      await ensureStringAttribute(id, 'otpCode', 10, true);
      await ensureIntegerAttribute(id, 'attempts', true);
      await ensureDatetimeAttribute(id, 'createdAt', true);
      await ensureDatetimeAttribute(id, 'expiresAt', true);
      await ensureIndex(id, 'idx_phone', DatabasesIndexType.Unique, ['phone']);
    },
  },
  {
    id: 'card_listings',
    name: 'Card Listings',
    setup: async (id) => {
      await ensureStringAttribute(id, 'userId', 36, true);
      await ensureStringAttribute(id, 'bankName', 100, true);
      await ensureStringAttribute(id, 'cardName', 100, false);
      await ensureStringAttribute(id, 'cardNetwork', 50, true);
      await ensureStringAttribute(id, 'cardType', 50, true);
      await ensureStringAttribute(id, 'maskedNumber', 4, true);
      await ensureFloatAttribute(id, 'commissionPercentage', true);
      await ensureBooleanAttribute(id, 'isActive', true);
      await ensureDatetimeAttribute(id, 'createdAt', true);
      await ensureDatetimeAttribute(id, 'updatedAt', true);
      await ensureIndex(id, 'idx_user_id', DatabasesIndexType.Key, ['userId']);
      await ensureIndex(id, 'idx_is_active', DatabasesIndexType.Key, ['isActive']);
    },
  },
  {
    id: 'card_requests',
    name: 'Card Requests',
    setup: async (id) => {
      await ensureStringAttribute(id, 'listingId', 36, true);
      await ensureStringAttribute(id, 'requesterId', 36, true);
      await ensureEnumAttribute(id, 'status', REQUEST_STATUS_VALUES, true);
      await ensureTextAttribute(id, 'offerDetails', true);
      await ensureDatetimeAttribute(id, 'createdAt', true);
      await ensureDatetimeAttribute(id, 'updatedAt', true);
      await ensureIndex(id, 'idx_listing_id', DatabasesIndexType.Key, ['listingId']);
      await ensureIndex(id, 'idx_requester_id', DatabasesIndexType.Key, ['requesterId']);
      await ensureIndex(id, 'idx_status', DatabasesIndexType.Key, ['status']);
    },
  },
  {
    id: 'notifications',
    name: 'Notifications',
    setup: async (id) => {
      await ensureStringAttribute(id, 'userId', 36, true);
      await ensureStringAttribute(id, 'requestId', 36, false);
      await ensureTextAttribute(id, 'message', true);
      await ensureBooleanAttribute(id, 'isRead', true);
      await ensureDatetimeAttribute(id, 'createdAt', true);
      await ensureIndex(id, 'idx_user_id', DatabasesIndexType.Key, ['userId']);
      await ensureIndex(id, 'idx_is_read', DatabasesIndexType.Key, ['isRead']);
    },
  },
];

async function main() {
  console.log('Cardnect Appwrite setup');
  console.log(`Endpoint : ${ENDPOINT}`);
  console.log(`Project  : ${PROJECT_ID}`);
  console.log(`Database : ${DATABASE_ID}`);
  console.log('');

  await ensureDatabase();
  console.log('');

  for (const collection of COLLECTIONS) {
    console.log(`Collection: ${collection.id}`);
    await ensureCollection(collection.id, collection.name);
    await collection.setup(collection.id);
    console.log('');
  }

  console.log('Done. Appwrite database is ready for Cardnect.');
  console.log('');
  console.log('Save these values for Step 3 (Spring Boot config):');
  console.log(`  APPWRITE_ENDPOINT=${ENDPOINT}`);
  console.log(`  APPWRITE_PROJECT_ID=${PROJECT_ID}`);
  console.log(`  APPWRITE_DATABASE_ID=${DATABASE_ID}`);
  console.log('  APPWRITE_API_KEY=<keep secret in .env only>');
}

main().catch((error) => {
  if (isAlreadyExists(error)) {
    console.error('Resource conflict:', error.message);
  } else {
    console.error('Setup failed:', error.message ?? error);
  }
  process.exit(1);
});
