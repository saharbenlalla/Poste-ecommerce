const express = require('express');
const { addProduit, retirerProduit , getPanier, modifierQuantiteProduit, viderPanier, calculerTotal} = require('../controllers/panierController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/add', authMiddleware, async (req, res) => {
  const userId = req.user.id;
  const { produitId, quantite } = req.body;

  if (!produitId || !quantite) {
    return res.status(400).json({ message: 'Produit et quantité requis.' });
  }

  try {
    const result = await addProduit(userId, produitId, quantite);
    res.status(200).json({ message: 'Produit ajouté au panier.', panier: result.panier, ligne: result.ligne });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});
router.get('/', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const panier = await getPanier(userId);

    res.status(200).json({
      success: true,
      panier,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});
router.delete("/remove/:produitId", authMiddleware, retirerProduit);
router.delete('/vider', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const result = await viderPanier(userId);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});
router.get('/total', authMiddleware, async (req, res) => {
  const userId = req.user.id;

  try {
    const result = await calculerTotal(userId);
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ message: err.message || 'Erreur serveur' });
  }
});

router.get("/", authMiddleware, async (req, res) => {
  try {
    const cartItems = await Panier.find({ userId: req.userId });
    res.json(cartItems);
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur" });
  }
});
router.put("/:id", authMiddleware, async (req, res) => {
  const { quantity } = req.body;
  if (quantity < 1) return res.status(400).json({ message: "Quantité invalide" });

  try {
    const item = await Panier.findOne({ _id: req.params.id, userId: req.userId });
    if (!item) return res.status(404).json({ message: "Produit non trouvé" });

    item.quantity = quantity;
    await item.save();
    res.json(item);
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur" });
  }
});
router.put("/modifier/:produitId", authMiddleware , modifierQuantiteProduit);
module.exports = router;
