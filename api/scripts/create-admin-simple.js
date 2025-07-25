#!/usr/bin/env node

import { Admin } from '../src/models/admin.js';
import { initDatabase } from '../src/config/database.js';

async function createAdmin() {
  try {
    console.log('🔐 Creando Usuario Administrador - Boda Sheila & Habib\n');
    
    // Inicializar base de datos
    await initDatabase();
    
    // Datos del administrador por defecto
    const adminData = {
      username: 'admin',
      password: 'admin123',
      name: 'Administrador'
    };
    
    // Verificar si ya existe
    const existingAdmin = await Admin.findByUsername(adminData.username);
    if (existingAdmin) {
      console.log('ℹ️  Ya existe un administrador con el usuario "admin"');
      console.log('👤 Usuario: admin');
      console.log('🔑 Contraseña: admin123');
      console.log('🌐 Panel: http://localhost/admin/login');
      process.exit(0);
    }
    
    // Crear administrador
    const admin = await Admin.create(adminData);
    
    console.log('✅ Administrador creado exitosamente!');
    console.log(`👤 Usuario: ${admin.username}`);
    console.log(`🔑 Contraseña: admin123`);
    console.log(`📝 Nombre: ${admin.name}`);
    console.log(`🆔 ID: ${admin.id}`);
    console.log('\n🌐 Puedes acceder al panel en: http://localhost/admin/login');
    
  } catch (error) {
    console.error('❌ Error creando administrador:', error.message);
    process.exit(1);
  }
}

createAdmin();