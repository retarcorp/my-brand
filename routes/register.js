var express = require('express');
var Users = require('../modules/Users');
var router = express.Router();

router.post('/register', (req, res, next) => {

    let parse = "";

    req.on('data', (data) => {
        parse += data;
    });

    req.on('end', () => {
        let data = JSON.parse(parse);

        //console.log(parse);

        let user = {
            password: Users.genSalt()
            ,name: data.name
        }

        Users.create(user, 'users', (data) => {
            res.send('userCreated');
        });
    });

});

module.exports = router;