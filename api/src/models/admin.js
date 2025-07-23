import { dbGet, dbRun } from '../config/database.js';
import crypto from 'crypto';

export class Admin {
  static async findByUsername(username) {
    return await dbGet('SELECT * FROM admins WHERE username = ?', [username]);
  }

  static async findById(id) {
    return await dbGet('SELECT * FROM admins WHERE id = ?', [id]);
  }

  static async create(adminData) {
    const { username, password, name } = adminData;
    const passwordHash = this.hashPassword(password);

    const result = await dbRun(`
      INSERT INTO admins (username, password_hash, name, created_at)
      VALUES (?, ?, ?, CURRENT_TIMESTAMP)
    `, [username, passwordHash, name]);

    return await Admin.findById(result.id);
  }

  static async validatePassword(username, password) {
    const admin = await this.findByUsername(username);
    if (!admin) return null;

    const passwordHash = this.hashPassword(password);
    if (passwordHash === admin.password_hash) {
      return admin;
    }
    return null;
  }

  static hashPassword(password) {
    return crypto.createHash('sha256').update(password).digest('hex');
  }
}