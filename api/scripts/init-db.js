import dotenv from 'dotenv';
import { initDatabase } from '../src/config/database.js';
import { Admin } from '../src/models/admin.js';
import { Invitation } from '../src/models/invitation.js';

dotenv.config();

async function initializeDatabase() {
  try {
    console.log('🚀 Inicializando base de datos...');

    // Inicializar tablas
    await initDatabase();

    // Verificar si existe administrador
    const adminCount = await Admin.findByUsername('admin');
    if (adminCount) {
      console.log('👤 Administrador ya existe');
    } else {
      console.log('👤 No hay administrador configurado');
      console.log('💡 Ejecuta: node scripts/create-admin.js');
    }

    // Crear algunas invitaciones de ejemplo
    const existingInvitations = await Invitation.getAll();
    if (existingInvitations.length === 0) {
      const sampleInvitations = [
        {
          guest_name: 'María García',
          message: 'Nos encantaría que nos acompañes en este día tan especial'
        },
        {
          guest_name: 'Juan Pérez',
          message: 'Tu presencia haría nuestro día aún más especial'
        },
        {
          guest_name: 'Ana Martínez',
          message: 'Esperamos celebrar contigo este momento único'
        }
      ];

      for (const invitationData of sampleInvitations) {
        const invitation = await Invitation.create(invitationData);
        console.log(`📧 Invitación creada para ${invitation.guest_name} - Token: ${invitation.token}`);
      }
    } else {
      console.log('📧 Ya existen invitaciones en la base de datos');
    }

    console.log('✅ Base de datos inicializada correctamente');
    console.log('\n📋 Resumen:');
    console.log('- Tablas de base de datos creadas');
    console.log('- Invitaciones de ejemplo creadas');
    console.log('- Para crear admin: node scripts/create-admin.js');

  } catch (error) {
    console.error('❌ Error inicializando base de datos:', error);
    process.exit(1);
  }
}

initializeDatabase();