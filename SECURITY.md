# 🔒 Guía de Seguridad - Wedding App

## 📋 Resumen de Seguridad

Esta aplicación maneja información sensible de invitados y utiliza OAuth para autenticación. Es crucial seguir las mejores prácticas de seguridad.

## 🔐 Gestión de Credenciales

### Variables de Entorno Sensibles

Las siguientes variables contienen información sensible y **NUNCA** deben ser commitadas:

```env
SESSION_SECRET=          # Clave para firmar sesiones
GOOGLE_CLIENT_ID=        # ID público de OAuth (menos sensible pero mejor proteger)
GOOGLE_CLIENT_SECRET=    # Secreto de OAuth (MUY SENSIBLE)
```

### ✅ Configuración Correcta

1. **Archivo `.env`**: Contiene credenciales reales (ignorado por Git)
2. **Archivo `.env.example`**: Plantilla sin credenciales reales (commitado)
3. **Documentación**: `OAUTH_SETUP.md` con instrucciones de configuración

### ❌ Qué NO hacer

- ❌ Commitear archivos `.env` con credenciales reales
- ❌ Hardcodear credenciales en el código
- ❌ Compartir credenciales por email/chat
- ❌ Usar las mismas credenciales en desarrollo y producción
- ❌ Subir credenciales a repositorios públicos

## 🛡️ Configuración de Producción

### Variables de Entorno Requeridas

```env
NODE_ENV=production
SESSION_SECRET=clave-super-secreta-de-64-caracteres-minimo
GOOGLE_CLIENT_ID=tu-client-id-de-produccion.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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on
FRONTEND_URL=https://tu-dominio.com
API_URL=https://api.tu-dominio.com
SECURE_COOKIES=true
CORS_ORIGIN=https://tu-dominio.com
```

### Generación de SESSION_SECRET Seguro

```bash
# Generar clave de 64 bytes (512 bits)
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# O usar OpenSSL
openssl rand -hex 64
```

## 🔍 Auditoría de Seguridad

### Checklist Pre-Deploy

- [ ] Todas las credenciales están en variables de entorno
- [ ] `SESSION_SECRET` es único y seguro (mínimo 64 caracteres)
- [ ] Credenciales de producción son diferentes a las de desarrollo
- [ ] HTTPS habilitado en producción (`SECURE_COOKIES=true`)
- [ ] CORS configurado correctamente
- [ ] No hay credenciales hardcodeadas en el código

### Archivos a Revisar

```bash
# Buscar posibles credenciales hardcodeadas
grep -r "GOCSPX-" . --exclude-dir=node_modules
grep -r "apps.googleusercontent.com" . --exclude-dir=node_modules
grep -r "client_secret" . --exclude-dir=node_modules
```

## 🚨 En Caso de Compromiso

### Si las credenciales se exponen:

1. **Inmediatamente**:
   - Rotar credenciales en Google Cloud Console
   - Generar nuevo `SESSION_SECRET`
   - Actualizar variables de entorno en producción

2. **Investigar**:
   - Revisar logs de acceso
   - Verificar actividad sospechosa
   - Notificar a usuarios si es necesario

3. **Prevenir**:
   - Revisar proceso de deploy
   - Actualizar documentación de seguridad
   - Capacitar al equipo

## 📚 Recursos Adicionales

- [Google OAuth 2.0 Security Best Practices](https://developers.google.com/identity/protocols/oauth2/security-best-practices)
- [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)

## 📞 Contacto de Seguridad

Para reportar vulnerabilidades de seguridad:
- Email: security@tu-dominio.com
- Crear issue privado en GitHub
- Contactar directamente a los desarrolladores

---

**Recuerda**: La seguridad es responsabilidad de todos. Cuando tengas dudas, siempre elige la opción más segura.