const path = require('path');

const express = require('express');
const { body } = require('express-validator');

const adminController = require('../controllers/admin');
const isAuth = require('../middleware/is-auth');

const router = express.Router();

// /admin/add-product => GET
router.get('/add-product', isAuth, adminController.getAddProduct);

// /admin/edit-product => GET
router.get('/edit-product/:productId', isAuth, adminController.getEditProduct);

// /admin/products => GET
router.get('/products', isAuth, adminController.getProducts);

// /admin/add-product => POST
router.post(
	'/add-product',
	isAuth,
	[
		body('title').isString().isLength({ min: 3 }).trim(),
		body('price').isFloat(),
		body('description').isLength({ min: 20, max: 400 }).trim(),
	],
	adminController.postAddProduct,
);

// /admin/edit-product => POST
router.post(
	'/edit-product',
	isAuth,
	[
		body('title').isString().isLength({ min: 3 }).trim(),
		body('price').isFloat(),
		body('description').isLength({ min: 20, max: 400 }).trim(),
	],
	adminController.postEditProduct,
);

// /admin/product/:productId => POST
router.delete('/product/:productId', isAuth, adminController.deleteProduct);

module.exports = router;
