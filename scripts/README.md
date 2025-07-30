# Scripts de Desarrollo - Boda Sheila & Habib

Este directorio contiene scripts para facilitar el desarrollo y despliegue de la aplicación.

## 🚀 Scripts Principales

### OAuth y Autenticación
- `oauth-manager.sh` - Script unificado para gestión OAuth (setup, check, test, fix)
- `oauth-configure-interactive.sh` - Configuración OAuth paso a paso

### Despliegue y Gestión
- `production-deploy.sh` - Despliegue completo para producción
- `initial-setup.sh` - Configuración inicial del proyecto
- `database-backup.sh` - Crear backups de la base de datos
- `system-monitor.sh` - Monitorear estado de la aplicación

### Seguridad
- `security-check.sh` - Verificar configuración de seguridad

## 📋 Uso Común

### Gestionar OAuth (todo en uno):
```bash
./scripts/oauth-manager.sh setup    # Configurar OAuth
./scripts/oauth-manager.sh check    # Verificar configuración
./scripts/oauth-manager.sh test     # Probar OAuth
./scripts/oauth-manager.sh fix      # Solucionar errores
```

### Desplegar aplicación:
```bash
./scripts/production-deploy.sh
```

### Crear admin:
```bash
# Admin por defecto (admin/admin123)
node api/scripts/create-admin.js

# Admin personalizado interactivo
node api/scripts/create-admin.js --interactive

# Admin con parámetros
node api/scripts/create-admin.js -u usuario -p contraseña -n "Nombre"
```

### Inicializar base de datos:
```bash
# Crear tablas y datos de ejemplo
node api/scripts/init-db.js
```

## 🔧 Scripts de API (api/scripts/)

Los scripts específicos del backend están en `api/scripts/`:
- `create-admin.js` - Script unificado para crear administradores
- `init-db.js` - Inicializar base de datos
- `migrate-database.js` - Migrar base de datos

## 📝 Notas

- Todos los scripts deben ejecutarse desde la raíz del proyecto
- Asegúrate de tener permisos de ejecución: `chmod +x scripts/*.sh`
- Para desarrollo, usa `docker compose up --build`
- Para producción, usa `./scripts/deploy.sh`