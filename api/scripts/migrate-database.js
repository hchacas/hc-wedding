import { initDatabase, dbRun, dbGet, dbAll } from '../src/config/database.js';
import { readdir } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

async function checkColumnExists(tableName, columnName) {
  const columns = await dbAll(`PRAGMA table_info(${tableName})`);
  return columns.some(col => col.name === columnName);
}

async function createMigrationsTable() {
  await dbRun(`
    CREATE TABLE IF NOT EXISTS migrations (
      id TEXT PRIMARY KEY,
      description TEXT,
      applied_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

async function getMigrationFiles() {
  const migrationsDir = join(__dirname, '../migrations');
  try {
    const files = await readdir(migrationsDir);
    return files
      .filter(file => file.endsWith('.js'))
      .sort(); // Ensure migrations run in order
  } catch (error) {
    console.log('📁 No migrations directory found, using legacy migration');
    return [];
  }
}

async function isApplied(migrationId) {
  const result = await dbGet('SELECT id FROM migrations WHERE id = ?', [migrationId]);
  return !!result;
}

async function markAsApplied(migrationId, description) {
  await dbRun('INSERT INTO migrations (id, description) VALUES (?, ?)', [migrationId, description]);
}

async function runLegacyMigration() {
  console.log('🔄 Running legacy migration (001_add_extended_rsvp_fields)...');

  const migrations = [
    {
      name: 'Add plus_one_menu_choice',
      column: 'plus_one_menu_choice',
      sql: 'ALTER TABLE guests ADD COLUMN plus_one_menu_choice TEXT'
    },
    {
      name: 'Add plus_one_dietary_restrictions',
      column: 'plus_one_dietary_restrictions',
      sql: 'ALTER TABLE guests ADD COLUMN plus_one_dietary_restrictions TEXT'
    },
    {
      name: 'Add children flag',
      column: 'children',
      sql: 'ALTER TABLE guests ADD COLUMN children BOOLEAN DEFAULT 0'
    },
    {
      name: 'Add children_count',
      column: 'children_count',
      sql: 'ALTER TABLE guests ADD COLUMN children_count INTEGER DEFAULT 0'
    },
    {
      name: 'Add children_names',
      column: 'children_names',
      sql: 'ALTER TABLE guests ADD COLUMN children_names TEXT'
    },
    {
      name: 'Add children_menu_choice',
      column: 'children_menu_choice',
      sql: 'ALTER TABLE guests ADD COLUMN children_menu_choice TEXT'
    },
    {
      name: 'Add children_dietary_restrictions',
      column: 'children_dietary_restrictions',
      sql: 'ALTER TABLE guests ADD COLUMN children_dietary_restrictions TEXT'
    }
  ];

  let appliedCount = 0;

  for (const migration of migrations) {
    try {
      const exists = await checkColumnExists('guests', migration.column);

      if (exists) {
        console.log(`⚠️  ${migration.name}: Column already exists, skipping`);
      } else {
        await dbRun(migration.sql);
        console.log(`✅ ${migration.name}: Applied successfully`);
        appliedCount++;
      }
    } catch (error) {
      console.error(`❌ ${migration.name}: Failed -`, error.message);
      throw error;
    }
  }

  // Mark legacy migration as applied if any changes were made
  if (appliedCount > 0) {
    await markAsApplied('001_add_extended_rsvp_fields', 'Add extended RSVP fields (legacy)');
  }

  return appliedCount;
}

async function migrateDatabase() {
  console.log('🔄 Starting database migration system...');
  console.log('📅 Migration Date:', new Date().toISOString());

  try {
    // Initialize database connection
    await initDatabase();
    console.log('📊 Database connection established');

    // Create migrations tracking table
    await createMigrationsTable();
    console.log('📋 Migrations table ready');

    // Create backup before migration
    console.log('💾 Creating backup...');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    try {
      await dbRun(`VACUUM INTO '/app/data/wedding_backup_${timestamp}.db'`);
      console.log(`✅ Backup created: wedding_backup_${timestamp}.db`);
    } catch (backupError) {
      console.log('⚠️  Backup failed (continuing anyway):', backupError.message);
    }

    // Check for migration files
    const migrationFiles = await getMigrationFiles();
    let totalApplied = 0;

    if (migrationFiles.length === 0) {
      // Run legacy migration
      const legacyApplied = await runLegacyMigration();
      totalApplied += legacyApplied;
    } else {
      // Run file-based migrations
      console.log(`📁 Found ${migrationFiles.length} migration files`);

      for (const file of migrationFiles) {
        const migrationPath = join(__dirname, '../migrations', file);
        const { migration } = await import(migrationPath);

        if (await isApplied(migration.id)) {
          console.log(`⚠️  Migration ${migration.id}: Already applied, skipping`);
          continue;
        }

        console.log(`🔄 Applying migration: ${migration.id}`);
        console.log(`   Description: ${migration.description}`);

        // Apply each migration step
        for (const step of migration.up) {
          try {
            await dbRun(step.sql);
            console.log(`   ✅ ${step.name}: Applied`);
          } catch (error) {
            console.error(`   ❌ ${step.name}: Failed -`, error.message);
            throw error;
          }
        }

        // Run post-migration tasks if any
        if (migration.postMigration) {
          console.log(`   🔄 Running post-migration tasks...`);
          await migration.postMigration(dbRun, dbGet, dbAll);
          console.log(`   ✅ Post-migration tasks completed`);
        }

        // Mark as applied
        await markAsApplied(migration.id, migration.description);
        console.log(`✅ Migration ${migration.id}: Completed successfully`);
        totalApplied++;
      }
    }

    // Verify final structure
    const finalColumns = await dbAll(`PRAGMA table_info(guests)`);
    console.log('📋 Final table structure:');
    finalColumns.forEach(col => {
      console.log(`   - ${col.name}: ${col.type} ${col.dflt_value ? `(default: ${col.dflt_value})` : ''}`);
    });

    // Show applied migrations
    const appliedMigrations = await dbAll('SELECT * FROM migrations ORDER BY applied_at');
    console.log('📜 Applied migrations:');
    appliedMigrations.forEach(m => {
      console.log(`   - ${m.id}: ${m.description} (${m.applied_at})`);
    });

    if (totalApplied > 0) {
      console.log(`✅ Database migration completed! Applied ${totalApplied} migrations.`);
      console.log('🎉 All data preserved and new features available');
    } else {
      console.log('✅ Database is up to date, no migrations needed');
    }

  } catch (error) {
    console.error('❌ Migration failed:', error);
    console.log('💡 Restore from backup if needed: wedding_backup_*.db');
    process.exit(1);
  }

  process.exit(0);
}

// Only run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  migrateDatabase();
}

export { migrateDatabase };