import express from 'express';
import cors from 'cors';
import session from 'express-session';
import passport from 'passport';
import dotenv from 'dotenv';

import { initDatabase } from './config/database.js';
import { configureOAuth } from './config/oauth.js';
import authRoutes from './routes/auth.js';
import rsvpRoutes from './routes/rsvp.js';
import adminRoutes from './routes/admin.js';
import invitationRoutes from './routes/invitations.js';

dotenv.config();

if (process.env.NODE_ENV === 'production' && !process.env.SESSION_SECRET) {
  console.error('FATAL: SESSION_SECRET must be set in production');
  process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware básico
app.use(cors({
  origin: [
    'http://localhost',
    "http://localhost:4321",
    'https://sheilayhabib.com',
    'https://www.sheilayhabib.com'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configuración de sesiones
app.use(session({
  secret: process.env.SESSION_SECRET || 'wedding-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // Always false in development, true only in production with HTTPS
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 24 horas
    sameSite: 'lax'
    // No domain restriction in development
  },
  proxy: process.env.NODE_ENV === 'production' // Trust proxy in production
}));

// Configuración de Passport
app.use(passport.initialize());
app.use(passport.session());
configureOAuth();

// Rutas según especificación
app.use('/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/invitacion', invitationRoutes);
app.use('/api/rsvp', rsvpRoutes);

// Ruta de salud
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});


// Inicializar base de datos y servidor
async function startServer() {
  try {
    await initDatabase();
    app.listen(PORT, () => {
      console.log(`🎉 Wedding API running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Error starting server:', error);
    process.exit(1);
  }
}

startServer();