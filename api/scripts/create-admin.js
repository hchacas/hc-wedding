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

function showHelp() {
  console.log('🔐 Crear Usuario Administrador - Boda Sheila & Habib');
  console.log('==================================================');
  console.log('');
  console.log('Uso:');
  console.log('  node create-admin.js                    # Crear admin por defecto (admin/admin123)');
  console.log('  node create-admin.js --interactive      # Crear admin personalizado');
  console.log('  node create-admin.js -u user -p pass    # Crear admin con parámetros');
  console.log('  node create-admin.js --help             # Mostrar esta ayuda');
  console.log('');
  console.log('Opciones:');
  console.log('  -u, --username <user>    Nombre de usuario');
  console.log('  -p, --password <pass>    Contraseña');
  console.log('  -n, --name <name>        Nombre completo');
  console.log('  -i, --interactive        Modo interactivo');
  console.log('  -h, --help              Mostrar ayuda');
  console.log('');
  console.log('Ejemplos:');
  console.log('  node create-admin.js');
  console.log('  node create-admin.js --interactive');
  console.log('  node create-admin.js -u admin -p mypass123 -n "Mi Admin"');
}

function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    username: null,
    password: null,
    name: null,
    interactive: false,
    help: false
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    switch (arg) {
      case '-h':
      case '--help':
        options.help = true;
        break;
      case '-i':
      case '--interactive':
        options.interactive = true;
        break;
      case '-u':
      case '--username':
        options.username = args[++i];
        break;
      case '-p':
      case '--password':
        options.password = args[++i];
        break;
      case '-n':
      case '--name':
        options.name = args[++i];
        break;
      default:
        console.log(`❌ Opción desconocida: ${arg}`);
        console.log('Usa --help para ver las opciones disponibles');
        process.exit(1);
    }
  }

  return options;
}

async function createAdminDefault() {
  const adminData = {
    username: 'admin',
    password: 'admin123',
    name: 'Administrador'
  };

  // Verificar si ya existe
  const existingAdmin = await Admin.findByUsername(adminData.username);
  if (existingAdmin) {
    console.log('✅ El administrador por defecto ya existe:');
    console.log(`👤 Usuario: ${existingAdmin.username}`);
    console.log(`📝 Nombre: ${existingAdmin.name}`);
    console.log(`🆔 ID: ${existingAdmin.id}`);
    console.log(`📅 Creado: ${new Date(existingAdmin.created_at).toLocaleString('es-ES')}`);
    console.log('\n🔑 Credenciales de acceso:');
    console.log('   Usuario: admin');
    console.log('   Contraseña: admin123');
    console.log('\n🌐 Panel: http://localhost:4321/admin/login');
    return;
  }

  // Crear administrador por defecto
  console.log('🔨 Creando administrador por defecto...');
  const admin = await Admin.create(adminData);
  
  console.log('\n✅ Administrador creado exitosamente!');
  console.log(`👤 Usuario: ${admin.username}`);
  console.log(`📝 Nombre: ${admin.name}`);
  console.log(`🆔 ID: ${admin.id}`);
  console.log('\n🔑 Credenciales de acceso:');
  console.log('   Usuario: admin');
  console.log('   Contraseña: admin123');
  console.log('\n🌐 Panel: http://localhost:4321/admin/login');
}

async function createAdminWithParams(username, password, name) {
  // Verificar parámetros requeridos
  if (!username || !password) {
    console.log('❌ Usuario y contraseña son requeridos');
    console.log('Uso: node create-admin.js -u usuario -p contraseña [-n "Nombre"]');
    process.exit(1);
  }

  if (password.length < 6) {
    console.log('❌ La contraseña debe tener al menos 6 caracteres');
    process.exit(1);
  }

  // Verificar si ya existe
  const existingAdmin = await Admin.findByUsername(username);
  if (existingAdmin) {
    console.log(`⚠️  Ya existe un administrador con el usuario "${username}"`);
    console.log(`👤 Usuario: ${existingAdmin.username}`);
    console.log(`📝 Nombre: ${existingAdmin.name}`);
    console.log(`🆔 ID: ${existingAdmin.id}`);
    console.log(`📅 Creado: ${new Date(existingAdmin.created_at).toLocaleString('es-ES')}`);
    console.log('\n💡 Usa un nombre de usuario diferente o elimina el admin existente');
    process.exit(1);
  }

  // Crear administrador
  const adminData = {
    username: username.trim(),
    password: password,
    name: name || username
  };

  console.log(`🔨 Creando administrador "${username}"...`);
  const admin = await Admin.create(adminData);
  
  console.log('\n✅ Administrador creado exitosamente!');
  console.log(`👤 Usuario: ${admin.username}`);
  console.log(`📝 Nombre: ${admin.name}`);
  console.log(`🆔 ID: ${admin.id}`);
  console.log('\n🌐 Panel: http://localhost:4321/admin/login');
}

async function createAdminInteractive() {
  console.log('📝 Creación interactiva de administrador\n');
  
  // Solicitar datos
  const username = await question('Nombre de usuario: ');
  if (!username.trim()) {
    console.log('❌ El nombre de usuario es requerido');
    process.exit(1);
  }
  
  // Verificar si ya existe
  const existingAdmin = await Admin.findByUsername(username);
  if (existingAdmin) {
    console.log(`\n⚠️  Ya existe un administrador con el usuario "${username}"`);
    console.log(`👤 Usuario: ${existingAdmin.username}`);
    console.log(`📝 Nombre: ${existingAdmin.name}`);
    console.log(`🆔 ID: ${existingAdmin.id}`);
    console.log(`📅 Creado: ${new Date(existingAdmin.created_at).toLocaleString('es-ES')}`);
    console.log('\n💡 Usa un nombre de usuario diferente');
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
  const adminData = {
    username: username.trim(),
    password: password,
    name: name.trim()
  };
  
  console.log(`\n🔨 Creando administrador "${username}"...`);
  const admin = await Admin.create(adminData);
  
  console.log('\n✅ Administrador creado exitosamente!');
  console.log(`👤 Usuario: ${admin.username}`);
  console.log(`📝 Nombre: ${admin.name}`);
  console.log(`🆔 ID: ${admin.id}`);
  console.log('\n🌐 Panel: http://localhost:4321/admin/login');
}

async function main() {
  try {
    const options = parseArgs();
    
    if (options.help) {
      showHelp();
      process.exit(0);
    }
    
    console.log('🔐 Configuración Usuario Administrador - Boda Sheila & Habib\n');
    
    // Inicializar base de datos
    await initDatabase();
    
    if (options.interactive) {
      await createAdminInteractive();
    } else if (options.username || options.password) {
      await createAdminWithParams(options.username, options.password, options.name);
    } else {
      await createAdminDefault();
    }
    
  } catch (error) {
    console.error('❌ Error configurando administrador:', error.message);
    console.log('\n💡 Posibles soluciones:');
    console.log('   - Verifica que la base de datos esté inicializada');
    console.log('   - Verifica permisos de escritura en el directorio');
    console.log('   - Ejecuta: npm run init-db');
    process.exit(1);
  } finally {
    rl.close();
  }
}

main();