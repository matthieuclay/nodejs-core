const fileHelper = require('../utils/file');

const { validationResult } = require('express-validator');

const Product = require('../models/product');

exports.getProducts = (req, res, next) => {
	Product.find({ userId: req.user._id })
		// .select('title price -_id')
		// .populate('userId', 'username')
		.then((products) => {
			res.render('admin/products', {
				products,
				pageTitle: 'Admin products',
				path: '/admin/products',
			});
		})
		.catch((err) => {
			const error = new Error(err);
			error.httpStatusCode = 500;
			return next(error);
		});
};

exports.getAddProduct = (req, res, next) => {
	res.render('admin/edit-product', {
		pageTitle: 'Add product',
		path: '/admin/add-product',
		editing: false,
		hasError: false,
		errorMessage: null,
		validationErrors: [],
	});
};

exports.postAddProduct = (req, res, next) => {
	const title = req.body.title;
	const image = req.file;
	const price = req.body.price;
	const description = req.body.description;
	if (!image) {
		return res.status(422).render('admin/edit-product', {
			pageTitle: 'Add product',
			path: '/admin/add-product',
			editing: false,
			hasError: true,
			product: {
				title,
				price,
				description,
			},
			errorMessage: 'Attached file is not an image.',
			validationErrors: [],
		});
	}

	const errors = validationResult(req);

	if (!errors.isEmpty()) {
		return res.status(422).render('admin/edit-product', {
			pageTitle: 'Add product',
			path: '/admin/add-product',
			editing: false,
			hasError: true,
			product: {
				title,
				price,
				description,
			},
			errorMessage: errors.array()[0].msg,
			validationErrors: errors.array(),
		});
	}

	const imageUrl = image.path;

	const product = new Product({
		title,
		imageUrl,
		price,
		description,
		userId: req.user,
	});

	product
		.save()
		.then(() => res.redirect('/admin/products'))
		.catch((err) => {
			console.log(err);
			// return res.status(500).render('admin/edit-product', {
			// 	pageTitle: 'Add product',
			// 	path: '/admin/add-product',
			// 	editing: false,
			// 	hasError: true,
			// 	product: {
			// 		title,
			// 		imageUrl,
			// 		price,
			// 		description,
			// 	},
			// 	errorMessage: 'Database operation failed, please try again.',
			// 	validationErrors: [],
			// });
			// res.redirect('/500');
			const error = new Error(err);
			error.httpStatusCode = 500;
			return next(error);
		});
};

exports.getEditProduct = (req, res, next) => {
	const editMode = req.query.edit;
	if (!editMode) {
		return res.redirect('/');
	}
	const productId = req.params.productId;
	Product.findById(productId)
		.then((product) => {
			if (!product) {
				return res.redirect('/');
			}
			res.render('admin/edit-product', {
				pageTitle: 'Edit product',
				path: '/admin/edit-product',
				editing: editMode,
				hasError: false,
				errorMessage: null,
				validationErrors: [],
				product,
			});
		})
		.catch((err) => {
			const error = new Error(err);
			error.httpStatusCode = 500;
			return next(error);
		});
};

exports.postEditProduct = (req, res, next) => {
	const productId = req.body.productId;
	const updatedTitle = req.body.title;
	const updatedPrice = req.body.price;
	const updatedDescription = req.body.description;
	const image = req.file;

	const errors = validationResult(req);

	if (!errors.isEmpty()) {
		return res.status(422).render('admin/edit-product', {
			pageTitle: 'Edit product',
			path: '/admin/edit-product',
			editing: true,
			hasError: true,
			product: {
				title: updatedTitle,
				price: updatedPrice,
				description: updatedDescription,
				_id: productId,
			},
			errorMessage: errors.array()[0].msg,
			validationErrors: errors.array(),
		});
	}

	Product.findById(productId)
		.then((product) => {
			if (product.userId.toString() !== req.user._id.toString()) {
				return res.redirect('/');
			}
			product.title = updatedTitle;
			if (image) {
				fileHelper.deleteFile(product.imageUrl);
				product.imageUrl = image.path;
			}
			product.price = updatedPrice;
			product.description = updatedDescription;
			return product.save().then(() => res.redirect('/admin/products'));
		})
		.catch((err) => {
			const error = new Error(err);
			error.httpStatusCode = 500;
			return next(error);
		});
};

exports.deleteProduct = (req, res, next) => {
	const productId = req.params.productId;
	Product.findById(productId)
		.then((product) => {
			if (!product) {
				return next(new Error('Product not found.'));
			}
			fileHelper.deleteFile(product.imageUrl);
			return Product.deleteOne({ _id: productId, userId: req.user._id });
		})
		.then(() => res.status(200).json({ message: 'Success!' }))
		.catch((err) => {
			res.status(500).json({ message: 'Deleting product failed.' });
		});
};
