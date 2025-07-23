import sqlite3 from 'sqlite3';
import { promisify } from 'util';

let db;

export function initDatabase() {
  return new Promise((resolve, reject) => {
    db = new sqlite3.Database('./wedding.db', (err) => {
      if (err) {
        console.error('Error opening database:', err);
        reject(err);
        return;
      }
      
      console.log('📊 Connected to SQLite database');
      
      // Crear tablas según especificación
      const tables = [
        // Tabla Invitations
        `CREATE TABLE IF NOT EXISTS invitations (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          token TEXT UNIQUE NOT NULL,
          guest_name TEXT NOT NULL,
          message TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`,
        
        // Tabla Guests (RSVP)
        `CREATE TABLE IF NOT EXISTS guests (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          auth_id TEXT UNIQUE NOT NULL,
          name TEXT NOT NULL,
          email TEXT NOT NULL,
          phone TEXT,
          attending BOOLEAN,
          plus_one BOOLEAN DEFAULT 0,
          plus_one_name TEXT,
          dietary_restrictions TEXT,
          menu_choice TEXT,
          allergies TEXT,
          notes TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`,
        
        // Tabla Admins
        `CREATE TABLE IF NOT EXISTS admins (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          username TEXT UNIQUE NOT NULL,
          password_hash TEXT NOT NULL,
          name TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`
      ];

      let completed = 0;
      const total = tables.length;

      tables.forEach((sql, index) => {
        db.run(sql, (err) => {
          if (err) {
            console.error(`Error creating table ${index}:`, err);
            reject(err);
            return;
          }
          
          completed++;
          if (completed === total) {
            console.log('✅ All database tables ready');
            resolve();
          }
        });
      });
    });
  });
}

export function getDatabase() {
  if (!db) {
    throw new Error('Database not initialized');
  }
  return db;
}

// Helper para promisificar queries
export function dbGet(query, params = []) {
  const db = getDatabase();
  return new Promise((resolve, reject) => {
    db.get(query, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

export function dbAll(query, params = []) {
  const db = getDatabase();
  return new Promise((resolve, reject) => {
    db.all(query, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

export function dbRun(query, params = []) {
  const db = getDatabase();
  return new Promise((resolve, reject) => {
    db.run(query, params, function(err) {
      if (err) reject(err);
      else resolve({ id: this.lastID, changes: this.changes });
    });
  });
}