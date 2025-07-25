#!/usr/bin/env node

import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dbPath = join(__dirname, '..', 'wedding.db');

console.log('🔄 Starting database migration...');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Error opening database:', err);
    process.exit(1);
  }
  console.log('✅ Connected to SQLite database');
});

// Migration queries to add new columns
const migrations = [
  // Add new columns to guests table
  `ALTER TABLE guests ADD COLUMN plus_one_gender TEXT`,
  `ALTER TABLE guests ADD COLUMN plus_one_age_group TEXT`,
  `ALTER TABLE guests ADD COLUMN gender TEXT`,
  `ALTER TABLE guests ADD COLUMN age_group TEXT`,
  `ALTER TABLE guests ADD COLUMN needs_transport BOOLEAN DEFAULT 0`,
  `ALTER TABLE guests ADD COLUMN transport_location TEXT`,
  `ALTER TABLE guests ADD COLUMN accommodation_needed BOOLEAN DEFAULT 0`,
  `ALTER TABLE guests ADD COLUMN special_requests TEXT`
];

// Function to check if column exists
function columnExists(tableName, columnName) {
  return new Promise((resolve, reject) => {
    db.all(`PRAGMA table_info(${tableName})`, (err, rows) => {
      if (err) {
        reject(err);
        return;
      }
      const exists = rows.some(row => row.name === columnName);
      resolve(exists);
    });
  });
}

// Function to run migration
async function runMigration() {
  try {
    for (const migration of migrations) {
      // Extract column name from ALTER TABLE statement
      const match = migration.match(/ADD COLUMN (\w+)/);
      if (match) {
        const columnName = match[1];
        const exists = await columnExists('guests', columnName);
        
        if (!exists) {
          await new Promise((resolve, reject) => {
            db.run(migration, (err) => {
              if (err) {
                reject(err);
              } else {
                console.log(`✅ Added column: ${columnName}`);
                resolve();
              }
            });
          });
        } else {
          console.log(`⏭️  Column already exists: ${columnName}`);
        }
      }
    }
    
    console.log('🎉 Database migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    db.close((err) => {
      if (err) {
        console.error('❌ Error closing database:', err);
      } else {
        console.log('✅ Database connection closed');
      }
      process.exit(0);
    });
  }
}

runMigration();