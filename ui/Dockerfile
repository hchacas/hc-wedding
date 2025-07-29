# Dockerfile para el frontend UI (Server-side rendering)
FROM --platform=linux/amd64 node:18-alpine

# Crear directorio de trabajo
WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias y manejar el problema de rollup
RUN npm cache clean --force && \
    npm install --no-optional --force && \
    npm install @rollup/rollup-linux-x64-musl --force || true

# Copiar código fuente
COPY . .

# Set build-time environment variables
ARG API_URL=http://localhost:3001
ARG FRONTEND_URL=http://localhost:4321
ENV API_URL=$API_URL
ENV FRONTEND_URL=$FRONTEND_URL

# Build de la aplicación
RUN npm run build

# Exponer puerto (Astro server runs on 4321 by default)
EXPOSE 4321

# Comando de inicio - ejecutar el servidor Astro
CMD ["node", "./dist/server/entry.mjs"]