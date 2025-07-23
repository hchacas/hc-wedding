import { dbGet, dbAll, dbRun } from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';

export class Invitation {
  static async findByToken(token) {
    return await dbGet('SELECT * FROM invitations WHERE token = ?', [token]);
  }

  static async findById(id) {
    return await dbGet('SELECT * FROM invitations WHERE id = ?', [id]);
  }

  static async create(invitationData) {
    const token = uuidv4();
    const { guest_name, message = '' } = invitationData;

    const result = await dbRun(`
      INSERT INTO invitations (token, guest_name, message, created_at, updated_at)
      VALUES (?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `, [token, guest_name, message]);

    return await Invitation.findById(result.id);
  }

  static async getAll() {
    return await dbAll('SELECT * FROM invitations ORDER BY created_at DESC');
  }

  static async update(id, invitationData) {
    const { guest_name, message } = invitationData;

    await dbRun(`
      UPDATE invitations SET
        guest_name = ?,
        message = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [guest_name, message, id]);

    return await Invitation.findById(id);
  }

  static async delete(id) {
    const result = await dbRun('DELETE FROM invitations WHERE id = ?', [id]);
    return result.changes > 0;
  }
}