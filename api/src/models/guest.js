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
      gender,
      phone,
      children,
      children_count,
      children_names,
      children_menu_choice,
      children_dietary_restrictions,
      menu_choice,
      dietary_restrictions,
      shuttle_bus,
      notes
    } = rsvpData;

    // Convertir valores del formulario a tipos correctos (SQLite usa 1/0 para boolean)
    const normalizedData = {
      attending: (attending === true || attending === 1 || attending === "true") ? 1 : 0,
      gender: gender || null,
      phone: phone || null,
      children: (children === true || children === 1 || children === "on") ? 1 : 0,
      children_count: parseInt(children_count) || 0,
      children_names: children_names || null,
      children_menu_choice: (children === true || children === 1 || children === "on") ? (children_menu_choice || 'ninos') : null,
      children_dietary_restrictions: children_dietary_restrictions || null,
      menu_choice: menu_choice || null,
      dietary_restrictions: dietary_restrictions || null,
      needs_transport: (shuttle_bus === "on" || shuttle_bus === true || shuttle_bus === 1) ? 1 : 0,
      notes: notes || null
    };

    await dbRun(`
      UPDATE guests SET
        attending = ?,
        gender = ?,
        phone = ?,
        children = ?,
        children_count = ?,
        children_names = ?,
        children_menu_choice = ?,
        children_dietary_restrictions = ?,
        menu_choice = ?,
        dietary_restrictions = ?,
        needs_transport = ?,
        notes = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [
      normalizedData.attending,
      normalizedData.gender,
      normalizedData.phone,
      normalizedData.children,
      normalizedData.children_count,
      normalizedData.children_names,
      normalizedData.children_menu_choice,
      normalizedData.children_dietary_restrictions,
      normalizedData.menu_choice,
      normalizedData.dietary_restrictions,
      normalizedData.needs_transport,
      normalizedData.notes,
      guestId
    ]);

    return await Guest.findById(guestId);
  }

  static async getCompanions(guestId) {
    return await dbAll('SELECT * FROM companions WHERE guest_id = ? ORDER BY id ASC', [guestId]);
  }

  static async setCompanions(guestId, companions) {
    await dbRun('DELETE FROM companions WHERE guest_id = ?', [guestId]);
    for (const c of companions) {
      const name = (c.name || '').trim();
      if (!name) continue;
      await dbRun(
        `INSERT INTO companions (guest_id, name, menu_choice, dietary_restrictions, gender) VALUES (?, ?, ?, ?, ?)`,
        [guestId, name, c.menu_choice || null, c.dietary_restrictions || null, c.gender || null]
      );
    }
  }

  static async getAllWithCompanions() {
    const guests = await dbAll('SELECT * FROM guests ORDER BY created_at DESC');
    for (const guest of guests) {
      guest.companions = await dbAll(
        'SELECT id, name, menu_choice, dietary_restrictions, gender FROM companions WHERE guest_id = ? ORDER BY id ASC',
        [guest.id]
      );
    }
    return guests;
  }

  static async getAll() {
    return await dbAll('SELECT * FROM guests ORDER BY created_at DESC');
  }

  static async getAttending() {
    return await dbAll('SELECT * FROM guests WHERE attending = 1 ORDER BY name');
  }

  static async getSummary() {
    // Estadísticas básicas de asistencia
    const total = await dbGet('SELECT COUNT(*) as count FROM guests');
    const attending = await dbGet('SELECT COUNT(*) as count FROM guests WHERE attending = 1');
    const notAttending = await dbGet('SELECT COUNT(*) as count FROM guests WHERE attending = 0');
    const pending = await dbGet('SELECT COUNT(*) as count FROM guests WHERE attending IS NULL');

    // Estadísticas de acompañantes y niños
    const withCompanions = await dbGet(`
      SELECT COUNT(DISTINCT c.guest_id) as count
      FROM companions c
      INNER JOIN guests g ON c.guest_id = g.id
      WHERE g.attending = 1
    `);
    const totalCompanions = await dbGet(`
      SELECT COUNT(*) as count
      FROM companions c
      INNER JOIN guests g ON c.guest_id = g.id
      WHERE g.attending = 1
    `);
    const withChildren = await dbGet('SELECT COUNT(*) as count FROM guests WHERE attending = 1 AND children = 1');
    const totalChildren = await dbGet(`
      SELECT COALESCE(SUM(children_count), 0) as total
      FROM guests WHERE attending = 1 AND children = 1
    `);

    // Total de personas (invitados + acompañantes + niños)
    const totalPeople = await dbGet(`
      SELECT
        (SELECT COUNT(*) FROM guests WHERE attending = 1) +
        (SELECT COUNT(*) FROM companions c INNER JOIN guests g ON c.guest_id = g.id WHERE g.attending = 1) +
        (SELECT COALESCE(SUM(children_count), 0) FROM guests WHERE attending = 1 AND children = 1) as total
    `);

    // Estadísticas por género (invitados principales + acompañantes)
    const genderStats = await dbAll(`
      SELECT gender, COUNT(*) as count FROM (
        SELECT COALESCE(g.gender, 'No especificado') as gender
        FROM guests g WHERE g.attending = 1
        UNION ALL
        SELECT c.gender
        FROM companions c INNER JOIN guests g ON c.guest_id = g.id
        WHERE g.attending = 1 AND c.gender IS NOT NULL
      ) GROUP BY gender ORDER BY count DESC
    `);

    // Estadísticas de menú consolidadas (para catering)
    const allMenuChoices = await dbAll(`
      SELECT menu_type, menu_choice, COUNT(*) as count FROM (
        SELECT 'Principal' as menu_type, menu_choice
        FROM guests WHERE attending = 1 AND menu_choice IS NOT NULL AND menu_choice != ''
        UNION ALL
        SELECT 'Acompañante' as menu_type, c.menu_choice as menu_choice
        FROM companions c INNER JOIN guests g ON c.guest_id = g.id
        WHERE g.attending = 1 AND c.menu_choice IS NOT NULL AND c.menu_choice != ''
        UNION ALL
        SELECT 'Niños' as menu_type, children_menu_choice as menu_choice
        FROM guests WHERE attending = 1 AND children = 1 AND children_menu_choice IS NOT NULL AND children_menu_choice != ''
      ) GROUP BY menu_choice ORDER BY count DESC
    `);

    // Restricciones dietéticas consolidadas (crítico para catering)
    const allDietaryRestrictions = await dbAll(`
      SELECT restriction, GROUP_CONCAT(person_name, ', ') as people, COUNT(*) as count FROM (
        SELECT dietary_restrictions as restriction, name as person_name
        FROM guests WHERE attending = 1 AND dietary_restrictions IS NOT NULL AND dietary_restrictions != ''
        UNION ALL
        SELECT c.dietary_restrictions as restriction, c.name as person_name
        FROM companions c INNER JOIN guests g ON c.guest_id = g.id
        WHERE g.attending = 1 AND c.dietary_restrictions IS NOT NULL AND c.dietary_restrictions != ''
        UNION ALL
        SELECT children_dietary_restrictions as restriction, name || ' (niños)' as person_name
        FROM guests WHERE attending = 1 AND children = 1 AND children_dietary_restrictions IS NOT NULL AND children_dietary_restrictions != ''
      ) GROUP BY restriction ORDER BY count DESC
    `);

    // Estadísticas de transporte (crítico para logística)
    const transportNeeded = await dbGet('SELECT COUNT(*) as count FROM guests WHERE attending = 1 AND needs_transport = 1');

    // Desglose detallado de niños por familia
    const childrenBreakdown = await dbAll(`
      SELECT
        children_count as count,
        COUNT(*) as families
      FROM guests
      WHERE attending = 1 AND children = 1 AND children_count > 0
      GROUP BY children_count
      ORDER BY children_count
    `);

    // Lista de teléfonos para contacto
    const phoneNumbers = await dbAll(`
      SELECT name, phone
      FROM guests
      WHERE attending = 1 AND phone IS NOT NULL AND phone != ""
      ORDER BY name
    `);

    return {
      // Estadísticas básicas
      basic: {
        total: total.count,
        attending: attending.count,
        notAttending: notAttending.count,
        pending: pending.count,
        totalPeople: totalPeople.total
      },

      // Composición de invitados
      composition: {
        soloGuests: attending.count - withCompanions.count - withChildren.count,
        withCompanions: withCompanions.count,
        totalCompanions: totalCompanions.count,
        withChildren: withChildren.count,
        totalChildren: totalChildren.total,
        childrenBreakdown: childrenBreakdown
      },

      // Demografía (útil para organización)
      demographics: {
        mainGuests: genderStats
      },

      // Catering (crítico para planificación)
      catering: {
        menuChoices: allMenuChoices,
        dietaryRestrictions: allDietaryRestrictions,
        totalMealsNeeded: totalPeople.total
      },

      // Logística (crítico para organización)
      logistics: {
        needsTransport: transportNeeded.count > 0,
        transportCount: transportNeeded.count,
        phoneNumbers: phoneNumbers
      }
    };
  }
}
