# 💕 Wedding Invitation App

Aplicación web completa para invitaciones de boda interactivas con sistema RSVP, construida con Node.js, Astro y SQLite.

## 🌟 Características

- **Invitaciones personalizadas** con tokens únicos (UUID v4)
- **Sistema RSVP completo** con autenticación OAuth (Google)
- **Panel de administración** para organizadores
- **Diseño responsive** optimizado para móviles
- **Despliegue con Docker** listo para producción
- **Base de datos SQLite** ligera y eficiente

## 🏗️ Arquitectura

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend UI   │    │   Backend API   │    │   Database      │
│   (Astro)       │◄──►│   (Node.js)     │◄──►│   (SQLite)      │
│   Port: 80      │    │   Port: 3001    │    │   wedding.db    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │
         └───────────────────────┘
              Docker Network
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

## 🛠️ Desarrollo Local

### Opción 1: Docker Compose (Recomendado)
```bash
# Desarrollo con Docker
docker-compose -f docker-compose.dev.yml up --build

# Frontend: http://localhost:4321
# Backend: http://localhost:3001
```

### Opción 2: Desarrollo Nativo
```bash
# Terminal 1 - Backend
cd api
npm install
npm run init-db
npm run dev

# Terminal 2 - Frontend
cd ui
npm install
npm run dev
```

## 📁 Estructura del Proyecto

```
wedding-app/
├── api/                    # Backend Node.js
│   ├── src/
│   │   ├── config/        # Configuración DB y OAuth
│   │   ├── models/        # Modelos de datos
│   │   ├── routes/        # Endpoints API
│   │   ├── middleware/    # Middleware de auth
│   │   └── index.js       # Servidor principal
│   ├── scripts/           # Scripts de inicialización
│   ├── Dockerfile         # Docker para producción
│   └── package.json
├── ui/                     # Frontend Astro
│   ├── src/
│   │   ├── components/    # Componentes reutilizables
│   │   ├── layouts/       # Layouts base
│   │   ├── pages/         # Páginas de la app
│   │   └── assets/        # Assets estáticos
│   ├── Dockerfile         # Docker para producción
│   ├── Dockerfile.dev     # Docker para desarrollo
│   └── package.json
├── nginx/                  # Configuración proxy
├── scripts/               # Scripts de gestión
│   ├── deploy.sh          # Script de despliegue
│   ├── backup.sh          # Script de backup
│   └── monitor.sh         # Script de monitoreo
├── docker-compose.yml     # Configuración producción
├── docker-compose.dev.yml # Configuración desarrollo
└── README.md
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
./scripts/backup.sh

# Los backups se guardan en ./backups/
# Se mantienen automáticamente los últimos 10
```

### Monitoreo
```bash
# Estado general
./scripts/monitor.sh

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
./scripts/deploy.sh --clean
```

### Troubleshooting
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

⚠️ **IMPORTANTE**: Lee [`SECURITY.md`](SECURITY.md) antes de desplegar en producción.

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
./scripts/check-security.sh

# Verificar configuración antes de deploy
./scripts/pre-deploy-check.sh
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