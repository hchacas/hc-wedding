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
  origin: [
    process.env.FRONTEND_URL || 'http://localhost',
    'http://localhost:4321',
    'http://localhost:80',
    'http://localhost'
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
    secure: false, // Deshabilitado para desarrollo local
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 24 horas
    sameSite: 'lax'
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

// Debug endpoints (temporal)
app.get('/debug/oauth', (req, res) => {
  res.json({
    hasClientId: !!process.env.GOOGLE_CLIENT_ID,
    hasClientSecret: !!process.env.GOOGLE_CLIENT_SECRET,
    clientIdPrefix: process.env.GOOGLE_CLIENT_ID?.substring(0, 10) + '...',
    secretPrefix: process.env.GOOGLE_CLIENT_SECRET?.substring(0, 10) + '...'
  });
});

app.get('/debug/session', (req, res) => {
  res.json({
    isAuthenticated: req.isAuthenticated(),
    sessionID: req.sessionID,
    user: req.user ? {
      id: req.user.id,
      name: req.user.name,
      email: req.user.email
    } : null,
    cookies: req.headers.cookie,
    session: req.session
  });
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