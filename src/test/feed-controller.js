require('dotenv').config();
const expect = require('chai').expect;
const sinon = require('sinon');
const mongoose = require('mongoose');

const User = require('../models/user');
const feedController = require('../controllers/feed');

describe('feed-controller.js', function () {
	before(function (done) {
		mongoose
			.connect(process.env.MONGODB_TEST_CONNECT)
			.then(() => {
				const user = new User({
					email: 'test@test.com',
					password: 'test123',
					name: 'test',
					posts: [],
					_id: '5c0f66b979af55031b34728a',
				});
				return user.save();
			})
			.then(() => {
				done();
			});
	});

	after(function (done) {
		User.deleteMany({})
			.then(() => {
				return mongoose.disconnect();
			})
			.then(() => {
				done();
			});
	});

	it('should add a created post to the posts of the creator', function (done) {
		const req = {
			body: {
				title: 'test post',
				content: 'a test post',
			},
			file: {
				path: 'abc',
			},
			userId: '5c0f66b979af55031b34728a',
		};
		const res = {
			status: function () {
				return this;
			},
			json: function () {},
		};

		feedController
			.createPost(req, res, () => {})
			.then((savedUser) => {
				expect(savedUser).to.have.property('posts');
				expect(savedUser.posts).to.have.length(1);
				done();
			});
	});
});
