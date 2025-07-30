// Migration 001: Add extended RSVP fields
// Date: 2025-07-30
// Description: Add support for plus_one menu, children, and detailed preferences

export const migration = {
  id: '001_add_extended_rsvp_fields',
  description: 'Add extended RSVP fields for plus_one menu, children, and detailed preferences',
  date: '2025-07-30',
  
  // Migrations to apply
  up: [
    {
      name: 'Add plus_one_menu_choice',
      sql: 'ALTER TABLE guests ADD COLUMN plus_one_menu_choice TEXT'
    },
    {
      name: 'Add plus_one_dietary_restrictions', 
      sql: 'ALTER TABLE guests ADD COLUMN plus_one_dietary_restrictions TEXT'
    },
    {
      name: 'Add children flag',
      sql: 'ALTER TABLE guests ADD COLUMN children BOOLEAN DEFAULT 0'
    },
    {
      name: 'Add children_count',
      sql: 'ALTER TABLE guests ADD COLUMN children_count INTEGER DEFAULT 0'
    },
    {
      name: 'Add children_names',
      sql: 'ALTER TABLE guests ADD COLUMN children_names TEXT'
    },
    {
      name: 'Add children_menu_choice',
      sql: 'ALTER TABLE guests ADD COLUMN children_menu_choice TEXT'
    },
    {
      name: 'Add children_dietary_restrictions',
      sql: 'ALTER TABLE guests ADD COLUMN children_dietary_restrictions TEXT'
    }
  ],
  
  // Rollback migrations (if needed)
  down: [
    // SQLite doesn't support DROP COLUMN easily, so we leave them
    // In a real scenario, you'd recreate the table without these columns
  ],
  
  // Data transformations after schema changes (optional)
  postMigration: async (dbRun, dbGet, dbAll) => {
    // Example: Set default values or transform existing data
    // await dbRun('UPDATE guests SET children = 0 WHERE children IS NULL');
  }
};