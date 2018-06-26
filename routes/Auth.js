var express = require('express');
var router = express.Router();

var Users = require('../modules/Users');

router.post('/login', (req, res, next) => {
	//console.log(sess, 'hahahaha');
	let parse = "";

	req.on('data', (data) => {
		parse+=data;
	});

	req.on('end', (err) => {
		if (err) throw err;

		let User = JSON.parse(parse);

		Users.find( User , (data) => {
			if (data.length) {
				let user = data[0];

				if (Users.checkCredentials(user, User)) {

					Users.createSession(req, res, next, user, (data) => {
						res.send('Logged');
					});

				} else {
					res.send('Error: Check your login or password!');
				}

			} else {
				res.send('User not found');
			}
		});

	});

	//res.send(JSON.stringify(req.session));
	// res.send('hello');
});

module.exports = router;