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

  static async getStatistics() {
    const totalInvitations = await dbGet('SELECT COUNT(*) as count FROM invitations');
    
    // Invitaciones con respuesta (que tienen un guest asociado)
    const respondedInvitations = await dbGet(`
      SELECT COUNT(DISTINCT i.id) as count 
      FROM invitations i 
      INNER JOIN guests g ON g.name = i.guest_name
    `);

    // Invitaciones pendientes (sin respuesta)
    const pendingInvitations = await dbGet(`
      SELECT COUNT(*) as count 
      FROM invitations i 
      WHERE NOT EXISTS (
        SELECT 1 FROM guests g WHERE g.name = i.guest_name
      )
    `);

    // Invitaciones por mes de creación
    const invitationsByMonth = await dbAll(`
      SELECT 
        strftime('%Y-%m', created_at) as month,
        COUNT(*) as count
      FROM invitations 
      GROUP BY strftime('%Y-%m', created_at)
      ORDER BY month DESC
      LIMIT 12
    `);

    return {
      total: totalInvitations.count,
      responded: respondedInvitations.count,
      pending: pendingInvitations.count,
      byMonth: invitationsByMonth
    };
  }
}