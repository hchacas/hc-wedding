import { Admin } from '../models/admin.js';

export async function requireBasicAuth(req, res, next) {
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

    const admin = await Admin.validatePassword(username, password);
    if (admin) {
      req.admin = admin;
      return next();
    }
    return res.status(401).json({
      success: false,
      message: 'Credenciales inválidas'
    });
  } catch (error) {
    console.error('Error validating admin:', error);
    return res.status(500).json({
      success: false,
      message: 'Error del servidor'
    });
  }
}