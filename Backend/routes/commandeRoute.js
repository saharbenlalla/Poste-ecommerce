const express = require('express');
const {creerCommande, validerCommande , validerCommandeAdmin, annulerCommandeAdmin, getAllCommandes, getMesCommandes, annulerCommande} = require('../controllers/commandeController');
const authMiddleware = require('../middlewares/authMiddleware');
const router = express.Router();
router.post('/creer', authMiddleware, creerCommande);
router.post("/valider", authMiddleware, validerCommande)
router.put('/:id/annuler', authMiddleware, async (req, res) => {
  const userId = req.user.id;
  const userRole = req.user.role;
  const commandeId = req.params.id;

  try {
    const result = await annulerCommande(commandeId, userId, userRole);
    res.status(200).json(result);
  } catch (err) {
    res.status(403).json({ message: err.message });
  }
});
router.get('/all',authMiddleware, getAllCommandes);
router.put('/valider/:id', authMiddleware, validerCommandeAdmin);
router.put('/annuler/:id', authMiddleware, annulerCommandeAdmin);
router.get('/mes-commandes', authMiddleware, getMesCommandes);
module.exports = router;
