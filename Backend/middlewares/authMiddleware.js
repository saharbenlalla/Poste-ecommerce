// middlewares/authMiddleware.js
const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Accès refusé. Token manquant.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // console.log('Decoded JWT:', decoded);
    req.user = decoded; 
    next(); 
  } catch (err) {
    res.status(401).json({ message: 'Token invalide ou expiré.' });
  }
};

module.exports = authMiddleware;
