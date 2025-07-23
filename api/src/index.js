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

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware básico
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:4321',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configuración de sesiones
app.use(session({
  secret: process.env.SESSION_SECRET || 'wedding-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 24 horas
  }
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