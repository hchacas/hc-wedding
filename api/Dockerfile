# Dockerfile para el backend API
FROM node:18-alpine

# Instalar dependencias del sistema necesarias para SQLite3 y health checks
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    sqlite \
    wget \
    su-exec

# Crear directorio de trabajo
WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias (esto compilará SQLite3 para Linux)
RUN npm ci --omit=dev

# Copiar código fuente (excluyendo node_modules local)
COPY src/ ./src/
COPY scripts/ ./scripts/
COPY migrations/ ./migrations/

# Crear directorio para la base de datos
RUN mkdir -p /app/data

# Copiar script de inicio (must be before USER switch so chmod runs as root)
COPY docker-entrypoint.sh ./
RUN chmod +x docker-entrypoint.sh

# Create non-root user (container starts as root; entrypoint drops privileges via su-exec)
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
RUN chown -R appuser:appgroup /app

# Exponer puerto
EXPOSE 3001

# Variables de entorno por defecto
ENV NODE_ENV=production
ENV PORT=3001

# Comando de inicio
CMD ["./docker-entrypoint.sh"]