const express = require('express');
const { createProduit, updateProduit, getProduitByID, updateStock , getAllProducts, deleteProduit} = require('../controllers/produitController');
const authMiddleware = require('../middlewares/authMiddleware');
const upload = require('../middlewares/upload');
const router = express.Router();

router.post('/add', upload.single('image'), createProduit);
router.put('/:id', upload.single('image'), updateProduit);
router.put('/:id', authMiddleware, updateStock);
router.get("/", getAllProducts);
router.get('/:id',authMiddleware ,getProduitByID);
router.delete("/delete/:id", authMiddleware, deleteProduit);
module.exports = router;
