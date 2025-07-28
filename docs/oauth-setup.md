# Configuración de Google OAuth

## 🔐 Configuración de Credenciales

### 1. Crear Proyecto en Google Cloud Console

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. Habilita la **Google Identity API**:
   - Ve a "APIs & Services" → "Library"
   - Busca "Google Identity" y habilítala

### 2. Crear Credenciales OAuth 2.0

1. Ve a "APIs & Services" → "Credentials"
2. Haz clic en "+ CREATE CREDENTIALS" → "OAuth 2.0 Client IDs"
3. Selecciona "Web application"
4. Configura los siguientes campos:

**Name:** Wedding App - Sheila & Habib

**Authorized JavaScript origins:**
```
http://localhost:3001
http://localhost:4321
http://localhost
https://tu-dominio.com (para producción)
```

**Authorized redirect URIs:**
```
http://localhost:3001/auth/google/callback
https://tu-dominio.com/auth/google/callback (para producción)
```

### 3. Configurar Variables de Entorno

1. Copia el archivo `.env.example` a `.env`:
   ```bash
   cp .env.example .env
   ```

2. Completa las credenciales en `.env`:
   ```env
   GOOGLE_CLIENT_ID=tu-client-id.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=GOCSPX-tu-client-secret
   SESSION_SECRET=genera-una-clave-secreta-segura
   ```

### 4. Generar SESSION_SECRET Seguro

Para generar una clave secreta segura, puedes usar:

```bash
# Opción 1: Node.js
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Opción 2: OpenSSL
openssl rand -hex 64

# Opción 3: Online (solo para desarrollo)
# https://generate-secret.vercel.app/64
```

## 🚀 Configuración para Producción

### Variables de Entorno Adicionales para Producción:

```env
NODE_ENV=production
SESSION_SECRET=tu-clave-super-secreta-de-64-caracteres
SECURE_COOKIES=true
FRONTEND_URL=https://tu-dominio.com
API_URL=https://api.tu-dominio.com
CORS_ORIGIN=https://tu-dominio.com
```

### Configuración de Dominio en Google Cloud:

1. Actualiza las **Authorized JavaScript origins**:
   ```
   https://tu-dominio.com
   https://api.tu-dominio.com
   ```

2. Actualiza las **Authorized redirect URIs**:
   ```
   https://api.tu-dominio.com/auth/google/callback
   ```

## 🔒 Seguridad

### ⚠️ NUNCA hagas esto:
- ❌ Subir archivos `.env` a Git
- ❌ Compartir credenciales en código
- ❌ Usar credenciales de desarrollo en producción

### ✅ Buenas prácticas:
- ✅ Usar diferentes credenciales para desarrollo y producción
- ✅ Rotar credenciales regularmente
- ✅ Usar variables de entorno en el servidor de producción
- ✅ Mantener `.env` en `.gitignore`

## 🛠️ Scripts de Configuración

Puedes usar los scripts incluidos para configurar OAuth:

```bash
# Configuración interactiva
./scripts/configure-oauth.sh

# Configuración rápida para desarrollo
./scripts/setup-oauth-dev.sh
```

## 🐛 Troubleshooting

### Error: "redirect_uri_mismatch"
- Verifica que las URLs de redirección coincidan exactamente
- Asegúrate de incluir el protocolo (http/https)
- No incluyas barras finales en las URLs

### Error: "invalid_client"
- Verifica que el CLIENT_ID y CLIENT_SECRET sean correctos
- Asegúrate de que la API de Google Identity esté habilitada

### Error: "access_denied"
- El usuario canceló la autorización
- Verifica que el dominio esté autorizado en Google Cloud Console