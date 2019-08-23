var express = require('express');
var router = express.Router();

const resMessage = require('../../module/utils/responseMessage');
const statusCode = require('../../module/utils/statusCode');
const utils = require('../../module/utils/utils');

const pool = require('../../module/pool');
const jwt = require('../../module/jwt');

var moment = require('moment');
require('moment-timezone');
moment.tz.setDefault("Asia/Seoul");

router.get('/:idx', async (req, res) => {
    const user = jwt.verify(req.headers.token);

    console.log("user:::" + JSON.stringify(user));

    if (user < 0) {
        res.status(200).send(utils.successFalse(statusCode.BAD_REQUEST, resMessage.NULL_VALUE));
    } else {
        const selectFollowerQuery =
            'SELECT U.id, U.userIdx ' +
            'FROM user AS U ' +
            'JOIN follow AS F ON F.followerIdx = U.userIdx ' +
            'WHERE F.userIdx = ? ';

        const followerResult = await pool.queryParam_Parse(selectFollowerQuery, [req.params.idx]);

        if (followerResult) {
            res.status(200).send(utils.successTrue(statusCode.CREATED, resMessage.READ_SUCCESS, followerResult));
        } else {
            res.status(200).send(utils.successFalse(statusCode.DB_ERROR, resMessage.READ_FAIL));
        }
    }
});

module.exports = router;