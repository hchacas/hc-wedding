#!/usr/bin/env node

import { Admin } from '../src/models/admin.js';
import { initDatabase } from '../src/config/database.js';
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

function questionHidden(prompt) {
  return new Promise((resolve) => {
    process.stdout.write(prompt);
    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.setEncoding('utf8');
    
    let password = '';
    
    const onData = (char) => {
      if (char === '\u0003') { // Ctrl+C
        process.exit();
      } else if (char === '\r' || char === '\n') {
        process.stdin.setRawMode(false);
        process.stdin.pause();
        process.stdin.removeListener('data', onData);
        process.stdout.write('\n');
        resolve(password);
      } else if (char === '\u007f') { // Backspace
        if (password.length > 0) {
          password = password.slice(0, -1);
          process.stdout.write('\b \b');
        }
      } else {
        password += char;
        process.stdout.write('*');
      }
    };
    
    process.stdin.on('data', onData);
  });
}

async function createAdmin() {
  try {
    console.log('🔐 Crear Usuario Administrador - Boda Sheila & Habib\n');
    
    // Inicializar base de datos
    await initDatabase();
    
    // Solicitar datos del administrador
    const username = await question('Nombre de usuario: ');
    if (!username.trim()) {
      console.log('❌ El nombre de usuario es requerido');
      process.exit(1);
    }
    
    // Verificar si ya existe
    const existingAdmin = await Admin.findByUsername(username);
    if (existingAdmin) {
      console.log('❌ Ya existe un administrador con ese nombre de usuario');
      process.exit(1);
    }
    
    const password = await questionHidden('Contraseña: ');
    if (!password.trim() || password.length < 6) {
      console.log('❌ La contraseña debe tener al menos 6 caracteres');
      process.exit(1);
    }
    
    const confirmPassword = await questionHidden('Confirmar contraseña: ');
    if (password !== confirmPassword) {
      console.log('❌ Las contraseñas no coinciden');
      process.exit(1);
    }
    
    const name = await question('Nombre completo: ');
    if (!name.trim()) {
      console.log('❌ El nombre completo es requerido');
      process.exit(1);
    }
    
    // Crear administrador
    const admin = await Admin.create({
      username: username.trim(),
      password: password,
      name: name.trim()
    });
    
    console.log('\n✅ Administrador creado exitosamente!');
    console.log(`👤 Usuario: ${admin.username}`);
    console.log(`📝 Nombre: ${admin.name}`);
    console.log(`🆔 ID: ${admin.id}`);
    console.log('\n🌐 Puedes acceder al panel en: http://localhost/admin/login');
    
  } catch (error) {
    console.error('❌ Error creando administrador:', error.message);
    process.exit(1);
  } finally {
    rl.close();
    process.exit(0);
  }
}

createAdmin();