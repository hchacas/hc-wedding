# 🚀 Guía de Configuración Inicial

## 📋 Configuración Paso a Paso

### 1. Clonar el Repositorio

```bash
git clone <tu-repositorio>
cd wedding-app
```

### 2. Configurar Variables de Entorno

```bash
# Copiar plantilla
cp .env.example .env

# Editar configuración
nano .env  # o tu editor preferido
```

### 3. Configurar Google OAuth

#### 3.1 Crear Proyecto en Google Cloud Console

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto:
   - Nombre: "Wedding App - Sheila & Habib"
   - ID del proyecto: `wedding-app-sheila-habib`

#### 3.2 Habilitar APIs

1. Ve a "APIs & Services" → "Library"
2. Busca y habilita: **"Google Identity"**

#### 3.3 Crear Credenciales OAuth

1. Ve a "APIs & Services" → "Credentials"
2. Clic en "+ CREATE CREDENTIALS" → "OAuth 2.0 Client IDs"
3. Configura la pantalla de consentimiento OAuth:
   - Tipo de usuario: **Externo**
   - Nombre de la aplicación: **"Boda Sheila & Habib"**
   - Email de soporte: tu-email@gmail.com
   - Dominios autorizados: tu-dominio.com (para producción)

4. Crear Client ID:
   - Tipo de aplicación: **Aplicación web**
   - Nombre: **"Wedding App"**
   
   **Orígenes de JavaScript autorizados:**
   ```
   http://localhost:3001
   http://localhost:4321
   http://localhost
   https://tu-dominio.com
   ```
   
   **URIs de redirección autorizados:**
   ```
   http://localhost:3001/auth/google/callback
   https://tu-dominio.com/auth/google/callback
   ```

#### 3.4 Configurar Credenciales en .env

```bash
# Generar SESSION_SECRET seguro
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Editar .env con tus credenciales reales
GOOGLE_CLIENT_ID=tu-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-tu-client-secret
SESSION_SECRET=tu-session-secret-de-64-caracteres
```

### 4. Verificar Configuración de Seguridad

```bash
# Verificar que no hay credenciales expuestas
./scripts/check-security.sh
```

### 5. Inicializar Base de Datos

```bash
# Con Docker (recomendado)
docker-compose up -d
docker-compose exec api npm run init-db

# O sin Docker
cd api
npm install
npm run init-db
```

### 6. Crear Usuario Administrador

```bash
# Acceder al contenedor API
docker-compose exec api sh

# Crear admin
npm run create-admin
# Seguir las instrucciones para crear usuario/contraseña
```

### 7. Probar la Aplicación

```bash
# Desarrollo
docker-compose -f docker-compose.dev.yml up --build

# Producción
docker-compose up -d

# Verificar que funciona
curl http://localhost:3001/health
curl http://localhost/
```

### 8. Configurar Dominio (Producción)

#### 8.1 DNS
```bash
# Configurar registros DNS
A     tu-dominio.com        → IP-DEL-SERVIDOR
CNAME api.tu-dominio.com    → tu-dominio.com
```

#### 8.2 SSL/TLS
```bash
# Con Let's Encrypt (recomendado)
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d tu-dominio.com -d api.tu-dominio.com
```

#### 8.3 Variables de Producción
```bash
# Actualizar .env para producción
NODE_ENV=production
FRONTEND_URL=https://tu-dominio.com
API_URL=https://api.tu-dominio.com
SECURE_COOKIES=true
CORS_ORIGIN=https://tu-dominio.com
```

#### 8.4 Actualizar OAuth
1. Ve a Google Cloud Console
2. Actualiza las URIs autorizadas:
   ```
   https://tu-dominio.com
   https://api.tu-dominio.com
   ```
3. Actualiza las URIs de redirección:
   ```
   https://api.tu-dominio.com/auth/google/callback
   ```

## 🔧 Scripts Útiles

```bash
# Verificación de seguridad
./scripts/check-security.sh

# Configuración interactiva de OAuth
./scripts/configure-oauth.sh

# Backup de datos
./scripts/backup.sh

# Monitoreo del sistema
./scripts/monitor.sh

# Despliegue completo
./scripts/deploy.sh
```

## 🐛 Troubleshooting

### Error: "redirect_uri_mismatch"
```bash
# Verificar que las URIs coincidan exactamente
# En Google Cloud Console y en tu configuración
```

### Error: "invalid_client"
```bash
# Verificar credenciales en .env
grep GOOGLE_ .env

# Regenerar credenciales si es necesario
```

### Error: "Cannot connect to database"
```bash
# Verificar que el contenedor de API esté corriendo
docker-compose ps

# Reinicializar base de datos
docker-compose exec api npm run init-db
```

### Error: "CORS policy"
```bash
# Verificar configuración CORS en .env
grep CORS_ORIGIN .env

# Debe coincidir con el dominio del frontend
```

## 📞 Soporte

Si tienes problemas:

1. **Verificar logs:**
   ```bash
   docker-compose logs -f api
   docker-compose logs -f ui
   ```

2. **Ejecutar diagnósticos:**
   ```bash
   ./scripts/monitor.sh
   ./scripts/check-security.sh
   ```

3. **Revisar documentación:**
   - [`README.md`](README.md) - Información general
   - [`SECURITY.md`](SECURITY.md) - Guía de seguridad
   - [`OAUTH_SETUP.md`](OAUTH_SETUP.md) - Configuración OAuth detallada

4. **Crear issue en GitHub** con:
   - Descripción del problema
   - Logs relevantes
   - Pasos para reproducir
   - Configuración (sin credenciales)

---

¡Listo! Tu aplicación de boda debería estar funcionando correctamente. 🎉