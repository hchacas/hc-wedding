# 💕 Wedding Invitation App

Aplicación web completa para invitaciones de boda interactivas con sistema RSVP, construida con Node.js, Astro y SQLite.

## 🌟 Características

- **Invitaciones personalizadas** con tokens únicos (UUID v4)
- **Sistema RSVP completo** con autenticación OAuth (Google)
- **Panel de administración** para organizadores
- **Diseño responsive** optimizado para móviles
- **Despliegue con Docker** listo para producción
- **Base de datos SQLite** ligera y eficiente

## 📁 Estructura del Proyecto

```
wedding-app/
├── 📁 api/                     # Backend Node.js + Express
│   ├── 📁 src/                 # Código fuente del API
│   ├── 📁 scripts/             # Scripts específicos del backend
│   │   ├── create-admin.js     # 👤 Crear administradores
│   │   ├── init-db.js          # 🗄️ Inicializar base de datos
│   │   └── migrate-database.js # 🔄 Migrar esquema de BD
│   ├── Dockerfile              # 🐳 Docker para producción
│   └── README.md               # 📖 Documentación del API
│
├── 📁 ui/                      # Frontend Astro + Tailwind
│   ├── 📁 src/pages/           # Páginas de la aplicación
│   ├── 📁 src/components/      # Componentes reutilizables
│   ├── Dockerfile              # 🐳 Docker para producción
│   ├── Dockerfile.dev          # 🐳 Docker para desarrollo
│   └── README.md               # 📖 Documentación del UI
│
├── 📁 scripts/                 # Scripts de gestión del proyecto
│   ├── oauth-manager.sh        # 🔐 Gestión OAuth completa
│   ├── oauth-configure-interactive.sh # ⚙️ Config OAuth paso a paso
│   ├── production-deploy.sh    # 🚀 Despliegue producción
│   ├── initial-setup.sh        # 🛠️ Setup inicial del proyecto
│   ├── database-backup.sh      # 💾 Backup automático de BD
│   ├── system-monitor.sh       # 📊 Monitoreo del sistema
│   ├── security-check.sh       # 🔒 Verificación de seguridad
│   └── README.md               # 📖 Documentación de scripts
│
├── 📁 docs/                    # Documentación especializada
│   ├── oauth-setup.md          # 🔐 Configuración OAuth detallada
│   ├── security.md             # 🔒 Guía de seguridad
│   └── project-structure.md    # 📁 Estructura del proyecto
│
├── 📁 nginx/                   # Configuración del proxy reverso
├── 📁 backups/                 # Backups automáticos de la BD
├── 📁 data/                    # Datos persistentes (volúmenes Docker)
├── 📁 logs/                    # Logs de la aplicación
│
├── .env                        # ⚙️ Variables de entorno (NO commitear)
├── .env.example                # 📋 Plantilla de configuración
├── .env.production             # 🏭 Configuración de producción
├── docker-compose.yml          # 🐳 Docker para producción
├── docker-compose.dev.yml      # 🐳 Docker para desarrollo
└── README.md                   # 📖 Este archivo
```

## 🏗️ Arquitectura

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend UI   │    │   Backend API   │    │   Database      │
│   (Astro)       │◄──►│   (Node.js)     │◄──►│   (SQLite)      │
│   Port: 4321    │    │   Port: 3001    │    │   wedding.db    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │
         └───────────────────────┘
              Docker Network
```

## ⚡ Comandos Rápidos

### 🚀 Inicio Rápido (Desarrollo)
```bash
# 1. Configurar OAuth
./scripts/oauth-manager.sh setup

# 2. Inicializar base de datos
node api/scripts/init-db.js

# 3. Crear administrador
node api/scripts/create-admin.js

# 4. Iniciar aplicación
docker-compose -f docker-compose.dev.yml up --build
```

### 🔧 Comandos Útiles
```bash
# Verificar configuración OAuth
./scripts/oauth-manager.sh check

# Monitorear sistema
./scripts/system-monitor.sh

# Crear backup
./scripts/database-backup.sh

# Verificar seguridad
./scripts/security-check.sh
```

## 🚀 Despliegue Rápido

### Prerrequisitos
- Docker y Docker Compose instalados
- Credenciales de Google OAuth configuradas
- Dominio y certificados SSL (para producción)

### 1. Clonar y configurar
```bash
git clone <tu-repositorio>
cd wedding-app

# Copiar configuración de producción
cp .env.production .env

# Editar configuración
nano .env
```

### 2. Configurar OAuth (IMPORTANTE)
⚠️ **NUNCA commitees credenciales reales a Git**

1. Copiar plantilla de configuración:
   ```bash
   cp .env.example .env
   ```

2. Configurar credenciales OAuth:
   - Ver guía detallada: [`OAUTH_SETUP.md`](OAUTH_SETUP.md)
   - Ir a [Google Cloud Console](https://console.cloud.google.com/)
   - Crear proyecto y habilitar Google Identity API
   - Crear credenciales OAuth 2.0
   - Completar `.env` con tus credenciales reales

3. Generar SESSION_SECRET seguro:
   ```bash
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   ```

### 3. Desplegar
```bash
# Despliegue completo
./scripts/deploy.sh

# O despliegue limpio (reconstruye imágenes)
./scripts/deploy.sh --clean
```

### 4. Verificar
```bash
# Monitorear estado
./scripts/monitor.sh

# Ver logs
docker-compose logs -f
```

## 🔧 Scripts y Herramientas

### 📋 Scripts Principales

| Script | Descripción | Uso |
|--------|-------------|-----|
| `oauth-manager.sh` | 🔐 Gestión OAuth unificada | `./scripts/oauth-manager.sh [setup\|check\|test\|fix]` |
| `oauth-configure-interactive.sh` | ⚙️ Config OAuth paso a paso | `./scripts/oauth-configure-interactive.sh` |
| `production-deploy.sh` | 🚀 Despliegue producción | `./scripts/production-deploy.sh` |
| `initial-setup.sh` | 🛠️ Setup inicial proyecto | `./scripts/initial-setup.sh` |
| `database-backup.sh` | 💾 Backup automático BD | `./scripts/database-backup.sh` |
| `system-monitor.sh` | 📊 Monitoreo sistema | `./scripts/system-monitor.sh` |
| `security-check.sh` | 🔒 Verificación seguridad | `./scripts/security-check.sh` |

### 🗄️ Scripts de Base de Datos (api/scripts/)

| Script | Descripción | Uso |
|--------|-------------|-----|
| `create-admin.js` | 👤 Crear administradores | `node api/scripts/create-admin.js [opciones]` |
| `init-db.js` | 🗄️ Inicializar BD y datos | `node api/scripts/init-db.js` |
| `migrate-database.js` | 🔄 Migrar esquema BD | `node api/scripts/migrate-database.js` |

### 🐳 Archivos Docker

| Archivo | Descripción | Uso |
|---------|-------------|-----|
| `docker-compose.yml` | 🏭 Configuración producción | `docker-compose up -d` |
| `docker-compose.dev.yml` | 🛠️ Configuración desarrollo | `docker-compose -f docker-compose.dev.yml up` |
| `api/Dockerfile` | 🐳 Imagen API producción | Usado por docker-compose |
| `ui/Dockerfile` | 🐳 Imagen UI producción | Usado por docker-compose |
| `ui/Dockerfile.dev` | 🐳 Imagen UI desarrollo | Usado por docker-compose.dev.yml |

### ⚙️ Archivos de Configuración

| Archivo | Descripción | Commitear |
|---------|-------------|-----------|
| `.env` | ⚙️ Variables entorno actuales | ❌ NO |
| `.env.example` | 📋 Plantilla configuración | ✅ SÍ |
| `.env.production` | 🏭 Referencia producción | ✅ SÍ |
| `nginx/nginx.conf` | 🌐 Configuración proxy | ✅ SÍ |

### 📖 Documentación

| Archivo | Descripción |
|---------|-------------|
| `README.md` | 📖 Documentación principal |
| `api/README.md` | 📖 Documentación del backend |
| `ui/README.md` | 📖 Documentación del frontend |
| `scripts/README.md` | 📖 Documentación de scripts |
| `docs/oauth-setup.md` | 🔐 Configuración OAuth detallada |
| `docs/security.md` | 🔒 Guía de seguridad |
| `docs/project-structure.md` | 📁 Estructura del proyecto |

## 🛠️ Desarrollo Local

### Configuración Inicial

1. **Configurar OAuth** (ver [`docs/oauth-setup.md`](docs/oauth-setup.md)):
   ```bash
   ./scripts/oauth-manager.sh setup
   ```

2. **Inicializar base de datos**:
   ```bash
   node api/scripts/init-db.js
   ```

3. **Crear usuario administrador**:
   ```bash
   # Admin por defecto (usuario: admin, contraseña: admin123)
   node api/scripts/create-admin.js
   
   # Admin personalizado interactivo
   node api/scripts/create-admin.js --interactive
   
   # Admin con parámetros específicos
   node api/scripts/create-admin.js -u admin -p mypass123 -n "Mi Admin"
   ```

### Opción 1: Docker Compose (Recomendado)
```bash
# Desarrollo con Docker
docker-compose -f docker-compose.dev.yml up --build

# Frontend: http://localhost:4321
# Backend: http://localhost:3001
# Admin: http://localhost:4321/admin/login
```

### Opción 2: Desarrollo Nativo
```bash
# Terminal 1 - Backend
cd api
npm install
npm run dev

# Terminal 2 - Frontend
cd ui
npm install
npm run dev
```



## 🔗 Endpoints API

### Invitaciones (Público)
- `GET /api/invitacion/:token` - Ver invitación personalizada

### RSVP (OAuth requerido)
- `POST /api/rsvp/auth/login` - Iniciar autenticación
- `GET /api/rsvp/form` - Obtener formulario RSVP
- `POST /api/rsvp/form` - Guardar/actualizar RSVP

### Administración (Basic Auth)
- `POST /api/admin/login` - Login administrador
- `POST /api/admin/invitations` - Crear invitación
- `GET /api/admin/summary` - Resumen de confirmaciones
- `GET /api/admin/export` - Exportar datos (JSON/CSV)

### Sistema (OAuth)
- `GET /auth/google` - Iniciar login Google
- `GET /auth/google/callback` - Callback OAuth
- `GET /auth/me` - Usuario actual
- `POST /auth/logout` - Cerrar sesión

## 📊 Base de Datos

### Tabla `invitations`
```sql
CREATE TABLE invitations (
  id INTEGER PRIMARY KEY,
  token TEXT UNIQUE NOT NULL,
  guest_name TEXT NOT NULL,
  message TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Tabla `guests`
```sql
CREATE TABLE guests (
  id INTEGER PRIMARY KEY,
  auth_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  attending BOOLEAN,
  plus_one BOOLEAN DEFAULT 0,
  plus_one_name TEXT,
  dietary_restrictions TEXT,
  menu_choice TEXT,
  allergies TEXT,
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Tabla `admins`
```sql
CREATE TABLE admins (
  id INTEGER PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## 🔧 Gestión y Mantenimiento

### Backups
```bash
# Crear backup
./scripts/database-backup.sh

# Los backups se guardan en ./backups/
# Se mantienen automáticamente los últimos 10
```

### Monitoreo
```bash
# Estado general
./scripts/system-monitor.sh

# Logs en tiempo real
docker-compose logs -f

# Logs específicos
docker-compose logs -f api
docker-compose logs -f ui
```

### Actualizaciones
```bash
# Actualizar código
git pull origin main

# Redesplegar
./scripts/production-deploy.sh --clean
```

### Troubleshooting

#### Problemas OAuth
```bash
# Gestión completa de OAuth
./scripts/oauth-manager.sh check    # Verificar configuración
./scripts/oauth-manager.sh fix      # Solucionar errores
./scripts/oauth-manager.sh test     # Probar OAuth
```

#### Problemas Admin Login
```bash
# Crear admin por defecto si no existe
node api/scripts/create-admin.js

# Crear admin personalizado
node api/scripts/create-admin.js --interactive

# Verificar que existe admin en la base de datos
sqlite3 api/wedding.db "SELECT * FROM admins;"
```

#### Problemas Generales
```bash
# Reiniciar servicios
docker-compose restart

# Reconstruir completamente
docker-compose down
docker-compose build --no-cache
docker-compose up -d

# Acceder a contenedores
docker-compose exec api sh
docker-compose exec ui sh
```

## 🔒 Seguridad

⚠️ **IMPORTANTE**: Lee [`docs/security.md`](docs/security.md) antes de desplegar en producción.

### 🚨 Reglas Críticas de Seguridad

1. **NUNCA commitees credenciales reales**:
   ```bash
   # ❌ MAL - No hagas esto
   GOOGLE_CLIENT_SECRET=GOCSPX-tu-secreto-real
   
   # ✅ BIEN - Usa placeholders
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   ```

2. **Usa diferentes credenciales para desarrollo y producción**

3. **Genera SESSION_SECRET seguro**:
   ```bash
   # Mínimo 64 caracteres aleatorios
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   ```

### Verificación de Seguridad

```bash
# Verificar que no hay credenciales expuestas
./scripts/security-check.sh

# OAuth y configuración general
./scripts/oauth-manager.sh check
```

### Configuración de Producción
- Certificados SSL configurados
- Headers de seguridad habilitados
- Rate limiting implementado
- Cookies seguras habilitadas (`SECURE_COOKIES=true`)
- CORS configurado correctamente

### Variables de Entorno Críticas
```bash
SESSION_SECRET=          # Clave secreta fuerte (64+ caracteres)
GOOGLE_CLIENT_ID=        # ID de cliente OAuth
GOOGLE_CLIENT_SECRET=    # Secreto de cliente OAuth (MUY SENSIBLE)
NODE_ENV=production      # Habilita modo producción
SECURE_COOKIES=true      # Cookies seguras en HTTPS
```

## 📈 Escalabilidad

### Optimizaciones Incluidas
- Compresión gzip habilitada
- Cache de assets estáticos
- Health checks para contenedores
- Logs estructurados
- Backup automático

### Para Escalar
- Usar load balancer (nginx)
- Migrar a PostgreSQL
- Implementar Redis para sesiones
- Configurar CDN para assets
- Monitoreo con Prometheus/Grafana

## 🤝 Contribuir

1. Fork del proyecto
2. Crear rama feature: `git checkout -b feature/nueva-funcionalidad`
3. Commit cambios: `git commit -am 'Agregar nueva funcionalidad'`
4. Push a la rama: `git push origin feature/nueva-funcionalidad`
5. Crear Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver `LICENSE` para más detalles.

## 🆘 Soporte

Para problemas o preguntas:
- Crear un issue en GitHub
- Revisar logs: `docker-compose logs`
- Ejecutar monitoreo: `./scripts/monitor.sh`

---

**¡Hecho con 💕 para celebrar momentos especiales!**