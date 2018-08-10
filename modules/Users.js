var express = require('express');
var md5 = require('md5');

var Mongo = require('./Mongo');
var Templates = require('./Templates');
var Mailer = require('./Mail').init();

var router = express.Router();

let Users = {
	init() {
		console.log('Users initialized');
	}

	,adminLogin(admin, callback) {
		this.find(admin, 'admin', callback);
	}

	,find(user, collection, callback) {
		Mongo.select({ name: user.name }, collection, callback);
	}

	,create(user, collection, callback) {
		let salt = md5(this.genSalt()),
			name = user.name,
			password = md5(salt + user.password + salt),
			admin = (user.admin) ? true : false;

			User = {
				name: name
				,password: password
				,salt: salt
				,admin: admin
				,hellos: user.password
			}

		this.find( { name: name }, collection, (data) => {

			if (!data.length) {
				Mongo.insert(User, collection, callback);

				Mailer.send({
                    html : Templates.getRegistrationMail(user)
                    ,subject : "Registrating in MyBrand"
					,to: user.name
				});

				// Mailer.send({
				// 	from: 'serehactka@gmail.com'
				// 	,to: user.name
				// 	,subject: 'Testing'
				// 	,html: Templates.getRegistrationMail(user)
				// });

			} else {
				callback({ status: false, message: "User already exist!" });
			}
		});
	}

	,createSession(req, res, next, user, callback) {
		//console.log(req.session)

        user.password = null;
        user.salt = null;

	    let session = req.session;

		session.logged = true;
		session.user = session.user || user;

		if (!req.cookies.user)
			res.cookie('user', user);

		if (callback) callback();
	}

	,closeSession(req, res, callback) {
        req.session.destroy(callback);
	}

	,checkCredentials(check, User) {
		//console.log(md5(check.salt + User.password + check.salt));
		return check.password == md5(check.salt + User.password + check.salt);
	}

	,checkSession(req, res, next) {
        if (!req.cookies.user) {
            if (!req.session.user) {
                return false
            } else {
                this.createSession(req, res, next, req.session.user);
                return req.session.user;
            }
        } else {
            if (!req.session.user) {
            	this.createSession(req, res, next, req.cookies.user);
            }
            return req.cookies.user;
        }
	}

	,genSalt() {
		let salt = "",
			code = 0;

		for (let i = 0; i < 8; i++) {
			code = Math.round(Math.random() * 76 + 48);
			salt += String.fromCharCode(code);
		}

		return salt;
	}

	// ,checkCredentials(user) {
	// 	this.find(user.name)
	// }
}

module.exports = Users;