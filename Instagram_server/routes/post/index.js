var express = require('express');
var router = express.Router();

router.use('/', require('./post'));
//router.use('/write', require('./write'));

module.exports = router;
