const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const register = async (req, res) => {
  const { name, email, password, adresse, telephone, role } = req.body;

  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'Email déjà utilisé' });
    }
    const user = await User.create({
      name,
      email,
      password,
      adresse,
      telephone,
      role: role || 'client' 
    });
    console.log('🛠️ req.body reçu :', req.body);
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: '3d'
    });

    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user)
      return res.status(404).json({ message: 'Utilisateur non trouvé' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: 'Mot de passe incorrect' });

    const token = jwt.sign({ id: user._id,name:user.name, email: user.email, adresse: user.adresse, telephone: user.telephone, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: '3d'
    });

    res.status(200).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
};
const getProfile = async (req, res) => {
  try {
    // req.user.id est injecté par authenticateToken middleware
    const user = await User.findById(req.user.id).select('-password'); // exclure le mdp
    if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé' });

    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

module.exports = {
  register,
  login,
  getProfile
};
