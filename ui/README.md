# Wedding UI - Frontend

Frontend de la aplicación de invitaciones de boda construido con Astro, Tailwind CSS y React.

## Características

- **Página principal** con información completa del evento
- **Invitaciones personalizadas** accesibles por token único
- **Sistema RSVP** con autenticación OAuth
- **Dashboard personal** para gestionar confirmación
- **Diseño responsive** optimizado para móviles
- **Cuenta atrás** en tiempo real hasta la boda

## Estructura de Páginas

### Páginas Principales
- `/` - Página de información general del evento
- `/invitacion/[token]` - Invitación personalizada por token
- `/rsvp/login` - Página de login OAuth
- `/rsvp/form` - Formulario de confirmación RSVP
- `/guest-dashboard` - Dashboard personal del usuario

### Componentes
- `Hero.astro` - Sección principal con nombres y fecha
- `Countdown.astro` - Cuenta atrás hasta la boda
- `EventDetails.astro` - Detalles completos del evento
- `Location.astro` - Ubicación y cómo llegar
- `RSVPSection.astro` - Sección de confirmación
- `RSVPForm.astro` - Formulario completo de RSVP

## Instalación

1. **Instalar dependencias:**
```bash
npm install
```

2. **Configurar variables de entorno:**
```bash
cp .env.example .env
# Editar .env si es necesario
```

3. **Iniciar servidor de desarrollo:**
```bash
npm run dev
```

4. **Acceder a la aplicación:**
```
http://localhost:4321
```

## Scripts Disponibles

- `npm run dev` - Servidor de desarrollo con hot reload
- `npm run build` - Build de producción
- `npm run preview` - Preview del build de producción

## Flujo de Usuario

### Invitado Regular
1. Accede a `/` → Ve información del evento
2. Hace clic en "Confirmar Asistencia" → `/rsvp/login`
3. Se autentica con Google → Redirigido a `/guest-dashboard`
4. Completa formulario RSVP → `/rsvp/form`
5. Puede descargar resumen del evento

### Invitado con Token Personal
1. Accede a `/invitacion/[token]` → Ve invitación personalizada
2. Hace clic en "Confirmar Asistencia" → `/rsvp/login`
3. Continúa con el flujo normal de RSVP

## Integración con Backend

El frontend se comunica con el backend API en `http://localhost:3001`:

### Endpoints Utilizados
- `GET /api/invitacion/:token` - Obtener invitación personalizada
- `GET /auth/me` - Verificar autenticación
- `GET /api/rsvp/form` - Obtener datos RSVP del usuario
- `POST /api/rsvp/form` - Guardar/actualizar RSVP
- `POST /auth/logout` - Cerrar sesión
- `GET /auth/google` - Iniciar OAuth con Google

### Autenticación
- Utiliza cookies de sesión para mantener estado
- Redirige automáticamente a login si no está autenticado
- Maneja errores de autenticación graciosamente

## Personalización

### Datos del Evento
Para personalizar la información del evento, edita:
- `src/components/Hero.astro` - Nombres y fecha principal
- `src/components/EventDetails.astro` - Detalles de ceremonia y celebración
- `src/components/Location.astro` - Ubicaciones y direcciones
- `src/components/Countdown.astro` - Fecha objetivo para cuenta atrás

### Estilos
- Utiliza Tailwind CSS para todos los estilos
- Colores principales: rose, pink, purple
- Gradientes y efectos de hover incluidos
- Completamente responsive

### Componentes Interactivos
- Cuenta atrás en tiempo real con JavaScript
- Formulario RSVP con validación
- Navegación condicional basada en autenticación
- Efectos de carga y estados de error

## Estructura de Archivos

```
ui/
├── src/
│   ├── layouts/
│   │   └── BaseLayout.astro     # Layout base
│   ├── pages/
│   │   ├── index.astro          # Página principal
│   │   ├── guest-dashboard.astro # Dashboard usuario
│   │   ├── invitacion/
│   │   │   └── [token].astro    # Invitación personalizada
│   │   └── rsvp/
│   │       ├── login.astro      # Login OAuth
│   │       └── form.astro       # Formulario RSVP
│   └── components/
│       ├── Hero.astro           # Sección principal
│       ├── Countdown.astro      # Cuenta atrás
│       ├── EventDetails.astro   # Detalles evento
│       ├── Location.astro       # Ubicación
│       ├── RSVPSection.astro    # Sección RSVP
│       └── RSVPForm.astro       # Formulario RSVP
├── public/
│   └── favicon.svg              # Favicon
└── astro.config.mjs             # Configuración Astro
```

## Tecnologías

- **Astro** - Framework principal
- **Tailwind CSS** - Estilos y diseño
- **React** - Componentes interactivos
- **TypeScript** - Tipado estático
- **Vite** - Build tool y dev server

## Próximas Funcionalidades

- [ ] Generación de resumen descargable (PDF/imagen)
- [ ] Integración con mapas reales (Google Maps)
- [ ] Galería de fotos de los novios
- [ ] Sistema de notificaciones
- [ ] Modo offline básico
- [ ] Optimizaciones SEO adicionales

## Desarrollo

Para contribuir al proyecto:

1. Fork del repositorio
2. Crear rama feature: `git checkout -b feature/nueva-funcionalidad`
3. Commit cambios: `git commit -am 'Agregar nueva funcionalidad'`
4. Push a la rama: `git push origin feature/nueva-funcionalidad`
5. Crear Pull Request

## Soporte

Para dudas o problemas:
- Revisar la documentación de [Astro](https://docs.astro.build)
- Consultar la documentación de [Tailwind CSS](https://tailwindcss.com/docs)
- Crear un issue en el repositorio