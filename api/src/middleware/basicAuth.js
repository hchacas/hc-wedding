import { Admin } from '../models/admin.js';

export function requireBasicAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Basic ')) {
    return res.status(401).json({
      success: false,
      message: 'Autenticación requerida'
    });
  }

  try {
    const base64Credentials = authHeader.split(' ')[1];
    const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
    const [username, password] = credentials.split(':');

    // Validar credenciales
    Admin.validatePassword(username, password)
      .then(admin => {
        if (admin) {
          req.admin = admin;
          next();
        } else {
          res.status(401).json({
            success: false,
            message: 'Credenciales inválidas'
          });
        }
      })
      .catch(error => {
        console.error('Error validating admin:', error);
        res.status(500).json({
          success: false,
          message: 'Error del servidor'
        });
      });
  } catch (error) {
    console.error('Error parsing auth header:', error);
    res.status(401).json({
      success: false,
      message: 'Formato de autenticación inválido'
    });
  }
}