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
│   ├── 📁 migrations/          # Scripts de migraciones de BD
│   ├── 📁 src/                 # Código fuente del API
│   ├── 📁 scripts/             # Scripts específicos del backend
│   │   ├── create-admin.js     # 👤 Crear administradores
│   │   ├── init-db.js          # 🗄️ Inicializar base de datos
│   │   └── migrate-database.js # 🔄 Migrar esquema de BD
|   |── docker-entrypoint.sh    # Script inicialización backend
│   ├── Dockerfile              # 🐳 Docker para producción
│   └── README.md               # 📖 Documentación del API
│
├── 📁 ui/                      # Frontend Astro + Tailwind
│   ├── 📁 src/pages/           # Páginas de la aplicación
│   ├── 📁 src/components/      # Componentes reutilizables
│   ├── Dockerfile              # 🐳 Docker para producción
│   └── README.md               # 📖 Documentación del UI
│
├── 📁 scripts/                 # Scripts de gestión del proyecto
│   ├── database-backup.sh      # 💾 Backup automático de BD
│   ├── system-monitor.sh       # 📊 Monitoreo del sistema
│   ├── security-check.sh       # 🔒 Verificación de seguridad
│   ├── deploy-with0migration.sh# Despliegue con migración de BD
│   └── ssl-setup.sh            # Ayuda con la configuración de SSL
│
├── 📁 nginx/                   # Configuración del proxy reverso
├── 📁 backups/                 # Backups de la BD
│
├── .env                        # ⚙️ Variables de entorno (NO commitear)
├── .env.example                # 📋 Plantilla de configuración
├── docker-compose.yml          # 🐳 Docker unificado (dev y prod)
└── README.md                   # 📖 Este archivo
```

## 🏗️ Arquitectura

**Arquitectura Unificada con Nginx Proxy:**
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Nginx Proxy   │    │   Frontend UI   │    │   Backend API   │    │   Database      │
│   Port: 80/443  │◄──►│   (Astro)       │    │   (Node.js)     │◄──►│   (SQLite)      │
│   (Dev & Prod)  │    │   Port: 4321    │    │   Port: 3001    │    │   wedding.db    │
└─────────────────┘    └─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                            Docker Network
```

**Diferencias entre Entornos:**
- **Desarrollo**: `docker compose up --build`
  - Nginx proxy en puerto 80 (HTTP)
  - URL: http://localhost
- **Producción**: `docker compose --profile production up -d --build`
  - Nginx proxy en puerto 80 (HTTP) + puerto 443 (HTTPS con SSL)
  - URL: https://sheilayhabib.com
- **API**: Siempre accesible a través de `/api` y `/auth` routes

**Arquitectura Unificada:**
- ✅ Un solo `docker-compose.yml` para dev y prod
- ✅ Misma configuración, solo cambia el profile
- ✅ Nginx proxy en ambos entornos para consistencia

## ⚡ Comandos Rápidos

### 🚀 Inicio Rápido (Desarrollo)
```bash
# 1. Inicializar base de datos
node api/scripts/init-db.js

# 2. Crear administrador
node api/scripts/create-admin.js

# 3. Iniciar aplicación
docker compose up --build
```

### 🔧 Comandos Útiles
```bash
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
cp .env.example .env

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
   - Ir a [Google Cloud Console](https://console.cloud.google.com/)
   - Crear proyecto y habilitar Google Identity API
   - Crear credenciales OAuth 2.0
   - Completar `.env` con tus credenciales reales

3. Generar SESSION_SECRET seguro:
   ```bash
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   ```

### 3. Desplegar

#### Opciones de Despliegue

**Desarrollo:**
```bash
docker compose up --build
```

**Producción:**
```bash
docker compose --profile production up -d --build
```

### 4. Verificar
```bash
# Monitorear estado
./scripts/monitor.sh
```

## 🔧 Scripts y Herramientas

### 🐳 Archivos Docker

| Archivo | Descripción | Uso |
|---------|-------------|-----|
| `docker-compose.yml` | 🐳 Configuración unificada | `docker compose up --build` |
| `api/Dockerfile` | 🐳 Imagen API | Usado por docker-compose |
| `ui/Dockerfile` | 🐳 Imagen UI | Usado por docker-compose |

### ⚙️ Archivos de Configuración

| Archivo | Descripción | Commitear |
|---------|-------------|-----------|
| `.env` | ⚙️ Variables entorno actuales | ❌ NO |
| `.env.example` | 📋 Plantilla configuración | ✅ SÍ |
| `nginx/nginx.conf` | 🌐 Configuración proxy | ✅ SÍ |

### 📖 Documentación

| Archivo | Descripción |
|---------|-------------|
| `README.md` | 📖 Documentación principal |
| `api/README.md` | 📖 Documentación del backend |
| `ui/README.md` | 📖 Documentación del frontend |

## 🛠️ Desarrollo Local

### Configuración Inicial

1. **Configurar OAuth**

2. **Inicializar base de datos**:
   ```bash
   node api/scripts/init-db.js
   ```

3. **Crear usuario administrador**:
   ```bash
   # Admin por defecto (usuario: admin, contraseña: admin123)
   node api/scripts/create-admin.js
   ```

### Opción 1: Docker Compose (Recomendado)
```bash
# Desarrollo con Docker
docker compose up --build

# Frontend: http://localhost (puerto 80 - nginx proxy)
# Backend: http://localhost:3001
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

### Persistencia y Migraciones
- ✅ **Datos persistentes**: Los datos NO se pierden al reiniciar contenedores
- ✅ **Volumen Docker**: `wedding-data:/app/data` (producción)
- ✅ **Migraciones automáticas**: Con backup y rollback
- ✅ **Backups programados**: Durante cada migración

### Estructura Actual

#### Tabla `guests` (RSVP Completo)
```sql
CREATE TABLE guests (
  -- Información básica del invitado
  id INTEGER PRIMARY KEY,
  auth_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  gender TEXT,
  attending BOOLEAN,
  
  -- Acompañante adulto
  plus_one BOOLEAN DEFAULT 0,
  plus_one_name TEXT,
  plus_one_gender TEXT,
  plus_one_menu_choice TEXT,
  plus_one_dietary_restrictions TEXT,
  
  -- Niños
  children BOOLEAN DEFAULT 0,
  children_count INTEGER DEFAULT 0,
  children_names TEXT,
  children_menu_choice TEXT,
  children_dietary_restrictions TEXT,
  
  -- Preferencias del invitado principal
  menu_choice TEXT,
  dietary_restrictions TEXT,
  
  -- Logística y comentarios
  needs_transport BOOLEAN DEFAULT 0,
  notes TEXT,
  
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

#### Tabla `invitations`
```sql
CREATE TABLE invitations (
  id INTEGER PRIMARY KEY,
  token TEXT UNIQUE NOT NULL,
  guest_name TEXT NOT NULL,
  message TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

#### Tabla `admins`
```sql
CREATE TABLE admins (
  id INTEGER PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Sistema de Migraciones
```bash
# Ejecutar migraciones pendientes (con backup automático)
docker compose exec api node scripts/migrate-database.js

# Despliegue completo con migraciones (desarrollo)
./scripts/deploy-with-migration.sh

# Despliegue en producción
./scripts/deploy-with-migration.sh production

# Ver migraciones aplicadas
docker compose exec api sqlite3 /app/data/wedding.db "SELECT * FROM migrations;"
```

### Crear Nueva Migración
```bash
# 1. Copiar template
cp api/migrations/TEMPLATE_migration.js api/migrations/002_nueva_funcionalidad.js

# 2. Editar el archivo con los cambios necesarios
# 3. Probar en desarrollo
# 4. Aplicar en producción con deploy-with-migration.sh
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
docker compose logs -f

# Logs específicos
docker compose logs -f api
docker compose logs -f ui
```

### Actualizaciones
```bash
# Actualizar código
git pull origin main
```

### Troubleshooting

#### Problemas Admin Login
```bash
# Crear admin por defecto si no existe
node api/scripts/create-admin.js

# Verificar que existe admin en la base de datos
sqlite3 api/wedding.db "SELECT * FROM admins;"
```

#### Problemas Generales
```bash
# Reiniciar servicios
docker compose restart

# Reconstruir completamente
docker compose down
docker compose build --no-cache
docker compose up -d

# Acceder a contenedores
docker compose exec api sh
docker compose exec ui sh
```

## 🔒 Seguridad

⚠️ **IMPORTANTE**

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
- Revisar logs: `docker compose logs`
- Ejecutar monitoreo: `./scripts/monitor.sh`

---

**¡Hecho con 💕 para celebrar momentos especiales!**