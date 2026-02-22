import { dbGet, dbRun } from '../config/database.js';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';

export class Admin {
  static async findByUsername(username) {
    return await dbGet('SELECT * FROM admins WHERE username = ?', [username]);
  }

  static async findById(id) {
    return await dbGet('SELECT * FROM admins WHERE id = ?', [id]);
  }

  static async create(adminData) {
    const { username, password, name } = adminData;
    const passwordHash = await this.hashPassword(password);

    const result = await dbRun(`
      INSERT INTO admins (username, password_hash, name, created_at)
      VALUES (?, ?, ?, CURRENT_TIMESTAMP)
    `, [username, passwordHash, name]);

    return await Admin.findById(result.id);
  }

  static async validatePassword(username, password) {
    const admin = await this.findByUsername(username);
    if (!admin) return null;

    // Try bcrypt first (new hashes)
    const bcryptMatch = await bcrypt.compare(password, admin.password_hash).catch(() => false);
    if (bcryptMatch) return admin;

    // Fall back to SHA256 (legacy hashes) and auto-upgrade
    const sha256Hash = crypto.createHash('sha256').update(password).digest('hex');
    if (sha256Hash === admin.password_hash) {
      const newHash = await bcrypt.hash(password, 12);
      await dbRun('UPDATE admins SET password_hash = ? WHERE id = ?', [newHash, admin.id]);
      return admin;
    }

    return null;
  }

  static async hashPassword(password) {
    return await bcrypt.hash(password, 12);
  }
}