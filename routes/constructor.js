var express = require('express');
var router = express.Router();

router.get('/constructor', (req, res, next) => {
    res.sendFile('index.html', { root: 'public/' });
});

module.exports = router;