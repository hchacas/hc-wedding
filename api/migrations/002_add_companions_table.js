// Migration 002: Add normalized companions table
// Date: 2026-02-23
// Description: Add companions table and migrate existing plus_one data

export const migration = {
  id: '002_add_companions_table',
  description: 'Add normalized companions table and migrate existing plus_one data',
  date: '2026-02-23',

  up: [
    {
      name: 'Create companions table',
      sql: `CREATE TABLE IF NOT EXISTS companions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        guest_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        menu_choice TEXT,
        dietary_restrictions TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (guest_id) REFERENCES guests(id) ON DELETE CASCADE
      )`
    },
    {
      name: 'Create index on guest_id',
      sql: `CREATE INDEX IF NOT EXISTS idx_companions_guest_id ON companions(guest_id)`
    }
  ],

  down: [],

  postMigration: async (dbRun, dbGet, dbAll) => {
    const guests = await dbAll(
      `SELECT id, plus_one_name, plus_one_menu_choice, plus_one_dietary_restrictions
       FROM guests WHERE plus_one = 1 AND plus_one_name IS NOT NULL AND plus_one_name != ''`
    );
    let migrated = 0;
    for (const guest of guests) {
      const existing = await dbGet('SELECT id FROM companions WHERE guest_id = ?', [guest.id]);
      if (!existing) {
        await dbRun(
          `INSERT INTO companions (guest_id, name, menu_choice, dietary_restrictions) VALUES (?, ?, ?, ?)`,
          [guest.id, guest.plus_one_name, guest.plus_one_menu_choice || null, guest.plus_one_dietary_restrictions || null]
        );
        migrated++;
      }
    }
    console.log(`   Migrated ${migrated} existing plus_one records to companions table`);
  }
};
