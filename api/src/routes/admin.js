import express from 'express';
import { Admin } from '../models/admin.js';
import { Invitation } from '../models/invitation.js';
import { Guest } from '../models/guest.js';
import { requireBasicAuth } from '../middleware/basicAuth.js';

const router = express.Router();

// POST /api/admin/login - Autenticación tipo básica para el administrador
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Usuario y contraseña requeridos'
      });
    }

    const admin = await Admin.validatePassword(username, password);
    
    if (admin) {
      res.json({
        success: true,
        message: 'Autenticación exitosa',
        admin: {
          id: admin.id,
          username: admin.username,
          name: admin.name
        }
      });
    } else {
      res.status(401).json({
        success: false,
        message: 'Credenciales inválidas'
      });
    }
  } catch (error) {
    console.error('Error in admin login:', error);
    res.status(500).json({
      success: false,
      message: 'Error del servidor'
    });
  }
});

// POST /api/admin/invitations - Crear nueva invitación personalizada
router.post('/invitations', requireBasicAuth, async (req, res) => {
  try {
    const { guest_name, message } = req.body;
    
    if (!guest_name) {
      return res.status(400).json({
        success: false,
        message: 'Nombre del invitado requerido'
      });
    }

    const invitation = await Invitation.create({
      guest_name,
      message: message || ''
    });

    res.status(201).json({
      success: true,
      message: 'Invitación creada correctamente',
      invitation: {
        id: invitation.id,
        token: invitation.token,
        guest_name: invitation.guest_name,
        message: invitation.message,
        created_at: invitation.created_at
      }
    });
  } catch (error) {
    console.error('Error creating invitation:', error);
    res.status(500).json({
      success: false,
      message: 'Error del servidor'
    });
  }
});

// GET /api/admin/summary - Consultar resumen de confirmaciones
router.get('/summary', requireBasicAuth, async (req, res) => {
  try {
    const summary = await Guest.getSummary();
    const recentGuests = await Guest.getAll();
    
    res.json({
      success: true,
      summary: {
        statistics: summary,
        recent_responses: recentGuests.slice(0, 10) // Últimas 10 respuestas
      }
    });
  } catch (error) {
    console.error('Error fetching summary:', error);
    res.status(500).json({
      success: false,
      message: 'Error del servidor'
    });
  }
});

// GET /api/admin/export - Exportar listado completo
router.get('/export', requireBasicAuth, async (req, res) => {
  try {
    const format = req.query.format || 'json';
    const guests = await Guest.getAll();
    
    if (format === 'csv') {
      // Generar CSV
      const csvHeader = 'ID,Nombre,Email,Teléfono,Asiste,Acompañante,Nombre Acompañante,Restricciones,Menú,Alergias,Notas,Fecha Creación\n';
      const csvRows = guests.map(guest => {
        const escapeCsv = (str) => str ? `"${str.replace(/"/g, '""')}"` : '""';
        const attending = guest.attending === true ? 'Sí' : guest.attending === false ? 'No' : 'Pendiente';
        const plusOne = guest.plus_one ? 'Sí' : 'No';
        
        return [
          guest.id,
          escapeCsv(guest.name),
          escapeCsv(guest.email || ''),
          escapeCsv(guest.phone || ''),
          attending,
          plusOne,
          escapeCsv(guest.plus_one_name || ''),
          escapeCsv(guest.dietary_restrictions || ''),
          escapeCsv(guest.menu_choice || ''),
          escapeCsv(guest.allergies || ''),
          escapeCsv(guest.notes || ''),
          escapeCsv(guest.created_at || '')
        ].join(',');
      }).join('\n');
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="invitados.csv"');
      res.send(csvHeader + csvRows);
    } else {
      // Formato JSON por defecto
      res.json({
        success: true,
        guests,
        total: guests.length,
        exported_at: new Date().toISOString()
      });
    }
  } catch (error) {
    console.error('Error exporting guests:', error);
    res.status(500).json({
      success: false,
      message: 'Error del servidor'
    });
  }
});

export default router;