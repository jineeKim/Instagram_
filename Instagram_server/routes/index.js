var express = require('express');
var router = express.Router();

router.use('/auth', require('./auth/index'));
router.use('/myPage', require('./myPage'));
router.use('/image', require('./image'));

module.exports = router;
