# Dockerfile para el backend API
FROM node:18-alpine

# Instalar dependencias del sistema necesarias para SQLite3 y health checks
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    sqlite \
    wget

# Crear directorio de trabajo
WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias (esto compilará SQLite3 para Linux)
RUN npm ci --omit=dev

# Copiar código fuente (excluyendo node_modules local)
COPY src/ ./src/
COPY scripts/ ./scripts/

# Crear directorio para la base de datos
RUN mkdir -p /app/data

# Copiar script de inicio (must be before USER switch so chmod runs as root)
COPY docker-entrypoint.sh ./
RUN chmod +x docker-entrypoint.sh

# Run as non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
RUN chown -R appuser:appgroup /app
USER appuser

# Exponer puerto
EXPOSE 3001

# Variables de entorno por defecto
ENV NODE_ENV=production
ENV PORT=3001

# Comando de inicio
CMD ["./docker-entrypoint.sh"]