require('dotenv').config();
const expect = require('chai').expect;
const sinon = require('sinon');
const mongoose = require('mongoose');

const User = require('../models/user');
const authController = require('../controllers/auth');

describe('auth-controller.js', function () {
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

	it('should throw an error with code 500 if accessing the database fails', function (done) {
		sinon.stub(User, 'findOne');
		User.findOne.throws();

		const req = {
			body: {
				email: 'test@test.com',
				password: 'test123',
			},
		};
		authController
			.login(req, {}, () => {})
			.then((result) => {
				expect(result).to.be.an('error');
				expect(result).to.have.property('statusCode', 500);
				done();
			});

		User.findOne.restore();
	});

	it('should send a response with a valid user status for an existing user', function (done) {
		const req = { userId: '5c0f66b979af55031b34728a' };
		const res = {
			statusCode: 500,
			userStatus: null,
			status: function (code) {
				this.statusCode = code;
				return this;
			},
			json: function (data) {
				this.userStatus = data.status;
			},
		};
		authController
			.getUserStatus(req, res, () => {})
			.then(() => {
				expect(res.statusCode).to.be.equal(200);
				expect(res.userStatus).to.be.equal('I am new!');
				done();
			});
	});
});
