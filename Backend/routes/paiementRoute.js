const express = require('express');
const { createPaiement, getPaiementByCommande,effectuerPaiement, getAllPaiements, updateStatutPaiement, getMesPaiements } = require('../controllers/paiementController');
const authMiddleware = require('../middlewares/authMiddleware');
const router = express.Router();

router.post('/', authMiddleware, createPaiement);
router.get('/mes-paiements', authMiddleware, getMesPaiements);
router.get('/:commandeId', authMiddleware, getPaiementByCommande);
router.get('/', authMiddleware, getAllPaiements);
router.put('/statut/:paiementId', authMiddleware, updateStatutPaiement);
router.post("/payer", authMiddleware, effectuerPaiement);
module.exports = router;
