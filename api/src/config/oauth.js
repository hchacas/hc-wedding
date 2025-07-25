import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Guest } from '../models/guest.js';

export function configureOAuth() {
  // Configuración de Google OAuth
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/auth/google/callback"
  },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const authId = profile.id;
        const email = profile.emails?.[0]?.value;
        const name = profile.displayName;

        // Buscar si ya existe un guest con este auth_id
        let guest = await Guest.findByAuthId(authId);

        if (!guest) {
          // Si no existe, crear nuevo guest
          guest = await Guest.create({
            auth_id: authId,
            name: name,
            email: email,
            phone: null
          });
        }

        return done(null, guest);
      } catch (error) {
        console.error('OAuth error:', error);
        return done(error, null);
      }
    }));

  // Serialización de usuario para sesiones
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const user = await Guest.findById(id);
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  });
}