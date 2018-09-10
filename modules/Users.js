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
		console.log(user, "CREATE SESSION");
        delete user.salt;

	    let session = req.session;
		session.user = user;

		res.cookie('user', user);

		if (callback) callback();
	}

	,createGuestSession(req, res) {
        //('create guest session');

        const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress,
			guest = { name : md5(ip) };

		req.session.guest = req.session.guest || guest;
		res.cookie('guest', guest);

		return guest;
	}

	,closeSession(req, res, callback) {
        req.session.destroy(callback);
	}

	,checkUserInDB(_user, cb) {

		Mongo.select({ name: _user.name}, 'users', (response_db) => {
            console.log("IN DBCHECK");
			const users = response_db;
			console.log(_user);

			if (cb) cb(!!users.find(user => this.checkCredentials(user, _user)));
		});
	}

	,checkCredentials(check, user) {
		//console.log(md5(check.salt + User.password + check.salt));
		//console.log(check.password, user.password);
		return check.password == user.password;
	}

	,checkHash(data1, data2) {
		return !Object.keys(data1).find( key => {
            //console.log('KEY: '+key, md5(JSON.stringify(data1[key])) == md5(JSON.stringify(data2[key])));

            if (md5(JSON.stringify(data1[key])) != md5(JSON.stringify(data2[key]))) {
				return true;
            }
		});
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

	,checkGuestSession(req, res) {
		if (!req.cookies.guest || !req.session.guest) {
            this.createGuestSession(req, res);

			return req.session.guest;
		}

		return this.createGuestSession(req, res);
	}

	,genSalt(mss = 6) {
		let salt = "",
			code = 0;

		for (let i = 0; i < mss; i++) {
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