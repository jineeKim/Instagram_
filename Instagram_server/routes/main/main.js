var express = require('express');
var router = express.Router();

const resMessage = require('../../module/utils/responseMessage');
const statusCode = require('../../module/utils/statusCode');
const utils = require('../../module/utils/utils');
const upload = require('../../config/multer');

const pool = require('../../module/pool');
const jwt = require('../../module/jwt');

var moment = require('moment');
require('moment-timezone');
moment.tz.setDefault("Asia/Seoul");

router.get('/', async (req, res) => {
    const user = jwt.verify(req.headers.token);

    if (user === null || !req.headers.token) {
        res.status(200).send(utils.successFalse(statusCode.BAD_REQUEST, resMessage.NULL_VALUE));
    } else {
        const selectUserPost =
            'SELECT * FROM ' +
            '(SELECT P.*, COUNT (L.likeIdx) likeCnt, COUNT(C.commentIdx) commentCount ' +
            'FROM post AS P ' +
            'LEFT OUTER JOIN instagram.like AS L ON P.postIdx = L.postIdx ' +
            'LEFT OUTER JOIN comment AS C ON P.postIdx = C.postIdx ' +
            'LEFT OUTER JOIN follow AS F ON P.userIdx = F.followingIdx ' +
            'WHERE F.userIdx = ? ' +
            'GROUP BY P.postIdx ' +
            'UNION ' +

            'SELECT P.*, COUNT (L.likeIdx) likeCnt, COUNT(C.commentIdx) commentCount ' +
            'FROM post AS P ' +
            'LEFT OUTER JOIN instagram.like AS L ON P.postIdx = L.postIdx ' +
            'LEFT OUTER JOIN comment AS C ON P.postIdx = C.postIdx ' +
            'WHERE P.userIdx = ? ' +
            'GROUP BY P.postIdx) c ' +
            'ORDER BY postIdx DESC ';

        var postResult = await pool.queryParam_Parse(selectUserPost, [user.userIdx, user.userIdx]);

        if (!postResult) {
            res.status(200).send(utils.successFalse(statusCode.DB_ERROR, resMessage.READ_FAIL));
        } else {
            res.status(200).send(utils.successTrue(statusCode.OK, resMessage.READ_SUCCESS, postResult));
        }


    }
});

module.exports = router;