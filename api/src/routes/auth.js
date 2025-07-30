import express from 'express';
import passport from 'passport';

const router = express.Router();

// Iniciar autenticación con Google
router.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

// Callback de Google OAuth
router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: '/rsvp/login' }),
  (req, res) => {
    console.log('=== OAUTH CALLBACK SUCCESS ===');
    console.log('User authenticated:', req.user?.name);
    console.log('Session ID:', req.sessionID);
    console.log('Is authenticated:', req.isAuthenticated());
    console.log('Session data:', req.session);
    console.log('==============================');
    
    // Redirigir al frontend con éxito
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:4321';
    res.redirect(`${frontendUrl}/guest-dashboard`);
  }
);

// Obtener usuario actual
router.get('/me', (req, res) => {
  console.log('=== AUTH CHECK DEBUG ===');
  console.log('Session ID:', req.sessionID);
  console.log('Is authenticated:', req.isAuthenticated());
  console.log('User:', req.user?.name);
  console.log('Cookies received:', req.headers.cookie);
  console.log('Session data:', req.session);
  console.log('Request origin:', req.headers.origin);
  console.log('Request referer:', req.headers.referer);
  console.log('========================');
  
  if (req.isAuthenticated()) {
    res.json({
      success: true,
      user: {
        id: req.user.id,
        name: req.user.name,
        email: req.user.email,
        is_host: req.user.is_host,
        token: req.user.token
      }
    });
  } else {
    res.status(401).json({
      success: false,
      message: 'Not authenticated'
    });
  }
});

// Cerrar sesión
router.post('/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: 'Error logging out'
      });
    }
    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  });
});

export default router;