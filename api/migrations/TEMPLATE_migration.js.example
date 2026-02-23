// Migration Template
// Copy this file and rename it with the next sequential number
// Example: 002_add_new_feature.js

export const migration = {
  // Unique ID for this migration (should match filename)
  id: '00X_migration_name',
  
  // Human-readable description
  description: 'Description of what this migration does',
  
  // Date when migration was created
  date: '2025-MM-DD',
  
  // Schema changes to apply
  up: [
    {
      name: 'Add new column',
      sql: 'ALTER TABLE table_name ADD COLUMN new_column TEXT'
    },
    {
      name: 'Create new table',
      sql: `CREATE TABLE new_table (
        id INTEGER PRIMARY KEY,
        name TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`
    },
    {
      name: 'Create index',
      sql: 'CREATE INDEX idx_table_column ON table_name(column_name)'
    }
  ],
  
  // Rollback changes (optional - SQLite limitations apply)
  down: [
    // Note: SQLite doesn't support DROP COLUMN
    // For complex rollbacks, you might need to recreate tables
    {
      name: 'Drop table',
      sql: 'DROP TABLE IF EXISTS new_table'
    }
  ],
  
  // Data transformations after schema changes (optional)
  postMigration: async (dbRun, dbGet, dbAll) => {
    // Example: Update existing data
    // await dbRun('UPDATE table_name SET new_column = ? WHERE condition = ?', ['default_value', 'some_condition']);
    
    // Example: Populate new table
    // const existingData = await dbAll('SELECT * FROM old_table');
    // for (const row of existingData) {
    //   await dbRun('INSERT INTO new_table (name) VALUES (?)', [row.name]);
    // }
    
    console.log('   📊 Post-migration data transformation completed');
  }
};

/*
MIGRATION NAMING CONVENTION:
- Use sequential numbers: 001, 002, 003, etc.
- Use descriptive names: add_user_preferences, update_menu_structure
- Format: XXX_descriptive_name.js

EXAMPLES:
- 002_add_user_preferences.js
- 003_update_menu_structure.js
- 004_add_event_settings.js

BEST PRACTICES:
1. Always test migrations in development first
2. Keep migrations small and focused
3. Include rollback steps when possible
4. Use postMigration for data transformations
5. Never modify existing migration files once applied
6. Always backup before running migrations
*/