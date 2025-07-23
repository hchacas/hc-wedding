import express from 'express';
import passport from 'passport';
import { Guest } from '../models/guest.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// POST /api/rsvp/auth/login - Gestiona la autenticación de invitados mediante OAuth
router.post('/auth/login', (req, res, next) => {
  // Redirigir a Google OAuth
  res.json({
    success: true,
    authUrl: '/auth/google'
  });
});

// GET /api/rsvp/form - Devuelve los datos del RSVP del usuario autenticado
router.get('/form', requireAuth, async (req, res) => {
  try {
    const guest = await Guest.findById(req.user.id);
    
    if (!guest) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }
    
    res.json({
      success: true,
      form: {
        id: guest.id,
        name: guest.name,
        email: guest.email,
        phone: guest.phone,
        attending: guest.attending,
        plus_one: guest.plus_one,
        plus_one_name: guest.plus_one_name,
        dietary_restrictions: guest.dietary_restrictions,
        menu_choice: guest.menu_choice,
        allergies: guest.allergies,
        notes: guest.notes
      }
    });
  } catch (error) {
    console.error('Error fetching RSVP form:', error);
    res.status(500).json({
      success: false,
      message: 'Error del servidor'
    });
  }
});

// POST /api/rsvp/form - Permite crear o actualizar la confirmación de asistencia
router.post('/form', requireAuth, async (req, res) => {
  try {
    const rsvpData = req.body;
    const updatedGuest = await Guest.updateRSVP(req.user.id, rsvpData);
    
    res.json({
      success: true,
      message: 'RSVP actualizado correctamente',
      form: {
        id: updatedGuest.id,
        name: updatedGuest.name,
        attending: updatedGuest.attending,
        plus_one: updatedGuest.plus_one,
        plus_one_name: updatedGuest.plus_one_name,
        dietary_restrictions: updatedGuest.dietary_restrictions,
        menu_choice: updatedGuest.menu_choice,
        allergies: updatedGuest.allergies,
        notes: updatedGuest.notes
      }
    });
  } catch (error) {
    console.error('Error updating RSVP form:', error);
    res.status(500).json({
      success: false,
      message: 'Error del servidor'
    });
  }
});

export default router;