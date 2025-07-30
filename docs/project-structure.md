# 📁 Estructura del Proyecto - Boda Sheila & Habib

## 🗂️ Estructura Reorganizada

```
wedding-app/
├── 📁 api/                     # Backend Node.js
│   ├── 📁 src/                 # Código fuente
│   ├── 📁 scripts/             # Scripts específicos del API
│   │   ├── create-admin.js     # Crear administradores (unificado)
│   │   ├── init-db.js          # Inicializar base de datos
│   │   └── migrate-database.js # Migrar base de datos
│   ├── Dockerfile              # Docker para producción
│   ├── package.json            # Dependencias del API
│   └── README.md               # Documentación del API
│
├── 📁 ui/                      # Frontend Astro
│   ├── 📁 src/                 # Código fuente
│   ├── 📁 public/              # Assets públicos
│   ├── Dockerfile              # Docker para producción
│   ├── Dockerfile.dev          # Docker para desarrollo
│   ├── package.json            # Dependencias del UI
│   └── README.md               # Documentación del UI
│
├── 📁 scripts/                 # Scripts de gestión del proyecto
│   ├── oauth-manager.sh        # 🔐 Gestión OAuth unificada
│   ├── oauth-configure-interactive.sh # Configuración OAuth paso a paso
│   ├── production-deploy.sh    # 🚀 Despliegue para producción
│   ├── initial-setup.sh        # ⚙️ Configuración inicial
│   ├── database-backup.sh      # 💾 Backup de base de datos
│   ├── system-monitor.sh       # 📊 Monitoreo del sistema
│   ├── security-check.sh       # 🔒 Verificación de seguridad
│   └── README.md               # Documentación de scripts
│
├── 📁 docs/                    # Documentación
│   ├── oauth-setup.md          # Configuración OAuth detallada
│   ├── security.md             # Guía de seguridad
│   └── project-structure.md    # Este archivo
│
├── 📁 nginx/                   # Configuración proxy
├── 📁 backups/                 # Backups automáticos
├── 📁 data/                    # Datos persistentes
├── 📁 logs/                    # Logs de la aplicación
│
├── .env                        # Variables de entorno (NO commitear)
├── .env.example                # Plantilla de configuración
├── .env.production             # Configuración de producción
├── docker-compose.yml          # Configuración Docker unificada
├── .gitignore                  # Archivos ignorados por Git
└── README.md                   # Documentación principal
```

## 🔧 Scripts Principales

### OAuth y Autenticación
```bash
# Script unificado para OAuth (recomendado)
./scripts/oauth-manager.sh [setup|check|test|fix|urls]

# Configuración interactiva paso a paso
./scripts/oauth-configure-interactive.sh
```

### Administración
```bash
# Crear administrador (unificado)
node api/scripts/create-admin.js [--interactive|-u user -p pass]

# Inicializar base de datos
node api/scripts/init-db.js
```

### Despliegue y Gestión
```bash
# Despliegue completo
./scripts/production-deploy.sh

# Configuración inicial
./scripts/initial-setup.sh

# Backup de datos
./scripts/database-backup.sh

# Monitoreo del sistema
./scripts/system-monitor.sh

# Verificación de seguridad
./scripts/security-check.sh
```

## 📄 Archivos de Configuración

### Variables de Entorno
- `.env.example` - Plantilla con todas las variables necesarias
- `.env` - Configuración local (NO commitear)
- `.env.production` - Referencia para producción

### Docker
- `docker-compose.yml` - Configuración unificada para desarrollo y producción

## 📚 Documentación

### Principal
- `README.md` - Documentación principal del proyecto
- `api/README.md` - Documentación específica del backend
- `ui/README.md` - Documentación específica del frontend
- `scripts/README.md` - Documentación de scripts

### Especializada
- `docs/oauth-setup.md` - Configuración OAuth detallada
- `docs/security.md` - Guía de seguridad
- `docs/project-structure.md` - Estructura del proyecto (este archivo)

## 🗑️ Archivos Eliminados

### Duplicados OAuth
- ❌ `scripts/fix-oauth-redirect.sh` → ✅ `scripts/oauth-manager.sh fix`
- ❌ `scripts/setup-oauth-dev.sh` → ✅ `scripts/oauth-manager.sh setup`
- ❌ `scripts/check-oauth-config.sh` → ✅ `scripts/oauth-manager.sh check`
- ❌ `scripts/test-oauth.sh` → ✅ `scripts/oauth-manager.sh test`

### Duplicados de Configuración
- ❌ `api/.env.example` → ✅ `.env.example` (unificado)
- ❌ `ui/.env.example` → ✅ `.env.example` (unificado)
- ❌ `SETUP.md` → ✅ Información integrada en `README.md`

### Duplicados de Admin
- ❌ `api/scripts/create-admin-simple.js` → ✅ `api/scripts/create-admin.js`
- ❌ `api/scripts/create-admin.js` (viejo) → ✅ `api/scripts/create-admin.js` (unificado)

### Archivos de Base de Datos Duplicados
- ❌ `api/wedding.db` (duplicado)
- ❌ `wedding.db` (duplicado)

## 🔄 Archivos Renombrados

### Scripts con Nombres Más Específicos
- `configure-oauth.sh` → `oauth-configure-interactive.sh`
- `deploy.sh` → `production-deploy.sh`
- `backup.sh` → `database-backup.sh`
- `monitor.sh` → `system-monitor.sh`
- `check-security.sh` → `security-check.sh`
- `setup.sh` → `initial-setup.sh`

### Documentación Reorganizada
- `OAUTH_SETUP.md` → `docs/oauth-setup.md`
- `SECURITY.md` → `docs/security.md`

## 🎯 Beneficios de la Reorganización

### ✅ Menos Confusión
- Un solo script para OAuth (`oauth-manager.sh`)
- Un solo script para crear admin (`create-admin.js`)
- Nombres de archivos más descriptivos

### ✅ Mejor Organización
- Documentación en carpeta `docs/`
- Scripts con nombres específicos
- Configuración unificada en `.env.example`

### ✅ Menos Duplicación
- Eliminados 8 archivos duplicados
- Funcionalidad consolidada
- Mantenimiento más fácil

### ✅ Más Claridad
- Estructura de carpetas lógica
- Nombres de archivos descriptivos
- Documentación actualizada

## 🚀 Próximos Pasos

1. **Probar la nueva estructura:**
   ```bash
   ./scripts/oauth-manager.sh check
   node api/scripts/create-admin.js
   ```

2. **Actualizar scripts de CI/CD** si los tienes

3. **Informar al equipo** sobre los cambios

4. **Actualizar documentación** si hay cambios adicionales