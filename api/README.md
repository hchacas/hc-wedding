# Wedding API

Backend para aplicación de invitaciones de boda con sistema de RSVP.

## Características

- **Invitaciones personalizadas** con tokens únicos (UUID v4)
- **Sistema RSVP** con autenticación OAuth (Google)
- **Panel de administración** con autenticación básica
- **Base de datos SQLite** con 3 tablas separadas
- **Exportación de datos** en JSON y CSV

## Estructura de Endpoints

### Invitaciones (Público)
- `GET /api/invitacion/:token` - Ver invitación personalizada

### RSVP (Requiere OAuth)
- `POST /api/rsvp/auth/login` - Iniciar autenticación OAuth
- `GET /api/rsvp/form` - Obtener formulario RSVP
- `POST /api/rsvp/form` - Crear/actualizar RSVP

### Administración (Requiere Basic Auth)
- `POST /api/admin/login` - Login de administrador
- `POST /api/admin/invitations` - Crear nueva invitación
- `GET /api/admin/summary` - Resumen de confirmaciones
- `GET /api/admin/export` - Exportar listado (JSON/CSV)

### OAuth (Sistema)
- `GET /auth/google` - Iniciar login con Google
- `GET /auth/google/callback` - Callback OAuth
- `GET /auth/me` - Usuario actual
- `POST /auth/logout` - Cerrar sesión

## Instalación

1. **Instalar dependencias:**
```bash
npm install
```

2. **Configurar variables de entorno:**
```bash
cp .env.example .env
# Editar .env con tus credenciales de Google OAuth
```

3. **Inicializar base de datos:**
```bash
npm run init-db
```

4. **Iniciar servidor de desarrollo:**
```bash
npm run dev
```

## Configuración OAuth

1. Ir a [Google Cloud Console](https://console.cloud.google.com/)
2. Crear un nuevo proyecto o seleccionar uno existente
3. Habilitar la API de Google+
4. Crear credenciales OAuth 2.0:
   - Tipo: Aplicación web
   - URIs de redirección: `http://localhost:3001/auth/google/callback`
5. Copiar Client ID y Client Secret al archivo `.env`

## Variables de Entorno

```env
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:4321
SESSION_SECRET=tu-clave-secreta-super-segura
GOOGLE_CLIENT_ID=tu-google-client-id
GOOGLE_CLIENT_SECRET=tu-google-client-secret
```

## Base de Datos

### Tabla `invitations`
- Almacena invitaciones personalizadas con tokens únicos
- Acceso público solo para visualización

### Tabla `guests`
- Almacena datos RSVP de invitados autenticados
- Vinculada por `auth_id` de OAuth

### Tabla `admins`
- Usuarios administradores con autenticación básica
- Acceso completo al panel de administración

## Uso

### Crear Invitación (Admin)
```bash
curl -X POST http://localhost:3001/api/admin/invitations \
  -H "Authorization: Basic YWRtaW46YWRtaW4xMjM=" \
  -H "Content-Type: application/json" \
  -d '{"guest_name": "Juan Pérez", "message": "Te esperamos!"}'
```

### Ver Invitación (Público)
```bash
curl http://localhost:3001/api/invitacion/[TOKEN]
```

### Obtener Resumen (Admin)
```bash
curl http://localhost:3001/api/admin/summary \
  -H "Authorization: Basic YWRtaW46YWRtaW4xMjM="
```

## Configuración de Administrador

### Crear Usuario Admin

**Script unificado con múltiples opciones:**

```bash
# Admin por defecto (admin/admin123)
node scripts/create-admin.js

# Admin personalizado interactivo
node scripts/create-admin.js --interactive

# Admin con parámetros
node scripts/create-admin.js -u usuario -p contraseña -n "Nombre"

# Ver ayuda
node scripts/create-admin.js --help
```

**Características:**
- ✅ Verifica si el usuario ya existe antes de crear
- ✅ Admin por defecto: `admin` / `admin123`
- ✅ Modo interactivo con contraseña oculta
- ✅ Creación por parámetros para scripts
- ✅ Validación de contraseña (mínimo 6 caracteres)
- ✅ Base64 para Basic Auth: `YWRtaW46YWRtaW4xMjM=`

### Verificar Admin Existente
```bash
# Ver admins en la base de datos
sqlite3 wedding.db "SELECT id, username, name FROM admins;"
```

### Usar Admin en Requests
```bash
# Generar Basic Auth header
echo -n "usuario:contraseña" | base64

# Ejemplo con admin por defecto
curl -H "Authorization: Basic YWRtaW46YWRtaW4xMjM=" http://localhost:3001/api/admin/summary
```

## Scripts

- `npm run dev` - Servidor con auto-reload
- `npm run start` - Servidor de producción
- `npm run init-db` - Inicializar base de datos

## Arquitectura

```
api/
├── src/
│   ├── index.js          # Servidor Express
│   ├── config/
│   │   ├── database.js   # Configuración SQLite
│   │   └── oauth.js      # Configuración OAuth
│   ├── models/
│   │   ├── admin.js      # Modelo Admin
│   │   ├── guest.js      # Modelo Guest (RSVP)
│   │   └── invitation.js # Modelo Invitation
│   ├── routes/
│   │   ├── admin.js      # Rutas administración
│   │   ├── auth.js       # Rutas OAuth
│   │   ├── invitations.js # Rutas invitaciones
│   │   └── rsvp.js       # Rutas RSVP
│   └── middleware/
│       ├── auth.js       # Middleware OAuth
│       └── basicAuth.js  # Middleware Basic Auth
└── scripts/
    └── init-db.js        # Script inicialización
```