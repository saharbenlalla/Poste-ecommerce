const express = require('express');
const authMiddleware = require('../middlewares/authMiddleware');
const { getDashboardData,editProfile, getProfile, addUser, getUserById, getAllUsers, toggleUserRole, updateUser } = require('../controllers/userController');
const User = require('../models/User')
const router = express.Router();

router.get('/me', authMiddleware, (req, res) => {
  res.json({ user: req.user });
});

router.put('/edit', authMiddleware, editProfile);
router.get('/me', authMiddleware, getProfile);
router.get('/', authMiddleware, getAllUsers); 
router.put('/:id/toggle-role', authMiddleware, toggleUserRole); 
router.put('/edit/:id', authMiddleware, updateUser);
router.get('/:id', getUserById);
router.post('/add', authMiddleware, addUser);
// router.get("/dashboard", authMiddleware, getDashboardData);
router.get("/dashboard", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "ID invalide" });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "Utilisateur non trouvé" });

    res.status(200).json({ message: "Bienvenue sur le dashboard", user });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error });
  }
});

module.exports = router;
