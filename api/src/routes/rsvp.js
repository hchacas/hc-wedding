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

    const companions = await Guest.getCompanions(guest.id);

    res.json({
      success: true,
      form: {
        id: guest.id,
        name: guest.name,
        email: guest.email,
        phone: guest.phone,
        gender: guest.gender,
        attending: guest.attending,
        companions,
        children: guest.children,
        children_count: guest.children_count,
        children_names: guest.children_names,
        children_menu_choice: guest.children_menu_choice,
        children_dietary_restrictions: guest.children_dietary_restrictions,
        menu_choice: guest.menu_choice,
        dietary_restrictions: guest.dietary_restrictions,
        needs_transport: guest.needs_transport,
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
    const { companions = [], ...rsvpData } = req.body;
    const validCompanions = companions
      .filter(c => c && (c.name || '').trim().length > 0)
      .slice(0, 5);

    const updatedGuest = await Guest.updateRSVP(req.user.id, rsvpData);
    await Guest.setCompanions(req.user.id, validCompanions);
    const companionsResult = await Guest.getCompanions(req.user.id);

    res.json({
      success: true,
      message: 'RSVP actualizado correctamente',
      form: {
        id: updatedGuest.id,
        name: updatedGuest.name,
        phone: updatedGuest.phone,
        gender: updatedGuest.gender,
        attending: updatedGuest.attending,
        companions: companionsResult,
        children: updatedGuest.children,
        children_count: updatedGuest.children_count,
        children_names: updatedGuest.children_names,
        children_menu_choice: updatedGuest.children_menu_choice,
        children_dietary_restrictions: updatedGuest.children_dietary_restrictions,
        menu_choice: updatedGuest.menu_choice,
        dietary_restrictions: updatedGuest.dietary_restrictions,
        needs_transport: updatedGuest.needs_transport,
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
