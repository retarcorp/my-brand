var express = require('express');
var Mongo = require('./Mongo');
var md5 = require('md5');

var router = express.Router();

let Users = {
	init() {
		console.log('Users initialized');
	}

	,find(user, callback) {
		Mongo.select({ name: user.name }, 'users', callback);
	}

	,create(user, callback) {
		let salt = md5(this.genSalt()),
			name = user.name,
			password = md5(salt + user.password + salt),

			User = {
				name: name
				,password: password
				,salt: salt
			}

		this.find( { name: name }, (data) => {
			if (!data.length) {
				Mongo.insert(User, 'users', callback);
			} else {
				callback("User already exist");
			}
		});
	}

	,createSession(req, res, next, user, callback) {
		let session = req.session,
			cookies = req.cookies.user;

		session.logged = session.logged || true;
		session.user = session.user || user;

		if (!cookies) {
			res.cookie('user', user);
			console.log('setCookie');

		} else {
			cookies.user = user;
		}

		if (callback) callback();
	}

	,checkCredentials(check, User) {
		return check.password == md5(check.salt + User.password + check.salt);
	}

	,genSalt() {
		return 123456;
	}

	// ,checkCredentials(user) {
	// 	this.find(user.name)
	// }
}

module.exports = Users;