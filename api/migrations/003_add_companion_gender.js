// Migration 003: Add gender column to companions table
// Date: 2026-02-23
// Description: Add gender field to companions for demographics tracking

export const migration = {
  id: '003_add_companion_gender',
  description: 'Add gender column to companions table',
  date: '2026-02-23',

  up: [
    {
      name: 'Add gender column to companions',
      sql: `ALTER TABLE companions ADD COLUMN gender TEXT`
    }
  ],

  down: []
};
