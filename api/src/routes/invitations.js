import express from 'express';
import { Invitation } from '../models/invitation.js';

const router = express.Router();

// GET /api/invitacion/:token - Visualizar invitación personalizada (sin login)
router.get('/:token', async (req, res) => {
  try {
    const { token } = req.params;
    const invitation = await Invitation.findByToken(token);
    
    if (!invitation) {
      return res.status(404).json({
        success: false,
        message: 'Invitación no encontrada'
      });
    }

    res.json({
      success: true,
      invitation: {
        guest_name: invitation.guest_name,
        message: invitation.message,
        token: invitation.token
      }
    });
  } catch (error) {
    console.error('Error fetching invitation:', error);
    res.status(500).json({
      success: false,
      message: 'Error del servidor'
    });
  }
});

export default router;