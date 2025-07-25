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
      plus_one_gender,
      plus_one_age_group,
      gender,
      age_group,
      dietary_restrictions,
      menu_choice,
      allergies,
      needs_transport,
      transport_location,
      accommodation_needed,
      special_requests,
      notes
    } = rsvpData;

    await dbRun(`
      UPDATE guests SET
        attending = ?,
        plus_one = ?,
        plus_one_name = ?,
        plus_one_gender = ?,
        plus_one_age_group = ?,
        gender = ?,
        age_group = ?,
        dietary_restrictions = ?,
        menu_choice = ?,
        allergies = ?,
        needs_transport = ?,
        transport_location = ?,
        accommodation_needed = ?,
        special_requests = ?,
        notes = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [
      attending,
      plus_one,
      plus_one_name,
      plus_one_gender,
      plus_one_age_group,
      gender,
      age_group,
      dietary_restrictions,
      menu_choice,
      allergies,
      needs_transport,
      transport_location,
      accommodation_needed,
      special_requests,
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
    // Estadísticas básicas
    const total = await dbGet('SELECT COUNT(*) as count FROM guests');
    const attending = await dbGet('SELECT COUNT(*) as count FROM guests WHERE attending = 1');
    const notAttending = await dbGet('SELECT COUNT(*) as count FROM guests WHERE attending = 0');
    const pending = await dbGet('SELECT COUNT(*) as count FROM guests WHERE attending IS NULL');
    const plusOnes = await dbGet('SELECT COUNT(*) as count FROM guests WHERE plus_one = 1');

    // Estadísticas por género (incluyendo acompañantes)
    const genderStats = await dbAll(`
      SELECT 
        COALESCE(gender, 'No especificado') as gender,
        COUNT(*) as count
      FROM guests 
      WHERE attending = 1
      GROUP BY gender
    `);

    const plusOneGenderStats = await dbAll(`
      SELECT 
        COALESCE(plus_one_gender, 'No especificado') as gender,
        COUNT(*) as count
      FROM guests 
      WHERE attending = 1 AND plus_one = 1
      GROUP BY plus_one_gender
    `);

    // Estadísticas por grupo de edad
    const ageStats = await dbAll(`
      SELECT 
        COALESCE(age_group, 'No especificado') as age_group,
        COUNT(*) as count
      FROM guests 
      WHERE attending = 1
      GROUP BY age_group
    `);

    const plusOneAgeStats = await dbAll(`
      SELECT 
        COALESCE(plus_one_age_group, 'No especificado') as age_group,
        COUNT(*) as count
      FROM guests 
      WHERE attending = 1 AND plus_one = 1
      GROUP BY plus_one_age_group
    `);

    // Estadísticas de menú
    const menuStats = await dbAll(`
      SELECT 
        COALESCE(menu_choice, 'No especificado') as menu,
        COUNT(*) as count
      FROM guests 
      WHERE attending = 1 AND menu_choice IS NOT NULL AND menu_choice != ''
      GROUP BY menu_choice
    `);

    // Estadísticas de restricciones dietéticas
    const dietaryStats = await dbAll(`
      SELECT 
        COALESCE(dietary_restrictions, 'Ninguna') as restriction,
        COUNT(*) as count
      FROM guests 
      WHERE attending = 1 AND dietary_restrictions IS NOT NULL AND dietary_restrictions != ''
      GROUP BY dietary_restrictions
    `);

    // Estadísticas de alergias
    const allergyStats = await dbAll(`
      SELECT 
        COALESCE(allergies, 'Ninguna') as allergy,
        COUNT(*) as count
      FROM guests 
      WHERE attending = 1 AND allergies IS NOT NULL AND allergies != ''
      GROUP BY allergies
    `);

    // Estadísticas de transporte
    const transportNeeded = await dbGet('SELECT COUNT(*) as count FROM guests WHERE attending = 1 AND needs_transport = 1');
    const transportStats = await dbAll(`
      SELECT 
        COALESCE(transport_location, 'No especificado') as location,
        COUNT(*) as count
      FROM guests 
      WHERE attending = 1 AND needs_transport = 1 AND transport_location IS NOT NULL AND transport_location != ''
      GROUP BY transport_location
    `);

    // Estadísticas de alojamiento
    const accommodationNeeded = await dbGet('SELECT COUNT(*) as count FROM guests WHERE attending = 1 AND accommodation_needed = 1');

    // Calcular totales de personas (incluyendo acompañantes)
    const totalPeople = await dbGet(`
      SELECT 
        (SELECT COUNT(*) FROM guests WHERE attending = 1) + 
        (SELECT COUNT(*) FROM guests WHERE attending = 1 AND plus_one = 1) as total
    `);

    return {
      // Estadísticas básicas
      total: total.count,
      attending: attending.count,
      notAttending: notAttending.count,
      pending: pending.count,
      plusOnes: plusOnes.count,
      totalPeople: totalPeople.total,

      // Estadísticas demográficas
      demographics: {
        gender: genderStats,
        plusOneGender: plusOneGenderStats,
        age: ageStats,
        plusOneAge: plusOneAgeStats
      },

      // Estadísticas de catering
      catering: {
        menu: menuStats,
        dietary: dietaryStats,
        allergies: allergyStats
      },

      // Estadísticas de logística
      logistics: {
        transportNeeded: transportNeeded.count,
        transportLocations: transportStats,
        accommodationNeeded: accommodationNeeded.count
      }
    };
  }
}