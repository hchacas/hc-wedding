import { dbGet, dbAll, dbRun } from '../config/database.js';

export class Guest {
  static async findByAuthId(authId) {
    return await dbGet('SELECT * FROM guests WHERE auth_id = ?', [authId]);
  }

  static async findById(id) {
    return await dbGet('SELECT * FROM guests WHERE id = ?', [id]);
  }

  static async create(guestData) {
    const {
      auth_id,
      name,
      email,
      phone
    } = guestData;

    const result = await dbRun(`
      INSERT INTO guests (
        auth_id, name, email, phone,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `, [auth_id, name, email, phone]);

    return await Guest.findById(result.id);
  }

  static async updateRSVP(guestId, rsvpData) {
    const {
      attending,
      plus_one,
      plus_one_name,
      dietary_restrictions,
      menu_choice,
      allergies,
      notes
    } = rsvpData;

    await dbRun(`
      UPDATE guests SET
        attending = ?,
        plus_one = ?,
        plus_one_name = ?,
        dietary_restrictions = ?,
        menu_choice = ?,
        allergies = ?,
        notes = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [
      attending,
      plus_one,
      plus_one_name,
      dietary_restrictions,
      menu_choice,
      allergies,
      notes,
      guestId
    ]);

    return await Guest.findById(guestId);
  }

  static async getAll() {
    return await dbAll('SELECT * FROM guests ORDER BY created_at DESC');
  }

  static async getAttending() {
    return await dbAll('SELECT * FROM guests WHERE attending = 1 ORDER BY name');
  }

  static async getSummary() {
    const total = await dbGet('SELECT COUNT(*) as count FROM guests');
    const attending = await dbGet('SELECT COUNT(*) as count FROM guests WHERE attending = 1');
    const notAttending = await dbGet('SELECT COUNT(*) as count FROM guests WHERE attending = 0');
    const pending = await dbGet('SELECT COUNT(*) as count FROM guests WHERE attending IS NULL');
    const plusOnes = await dbGet('SELECT COUNT(*) as count FROM guests WHERE plus_one = 1');

    return {
      total: total.count,
      attending: attending.count,
      notAttending: notAttending.count,
      pending: pending.count,
      plusOnes: plusOnes.count
    };
  }
}