var express = require('express');
var router = express.Router();

const resMessage = require('../../module/utils/responseMessage');
const statusCode = require('../../module/utils/statusCode');
const utils = require('../../module/utils/utils');
const upload = require('../../config/multer');

const pool = require('../../config/dbConfig');
const db = require('../../module/pool');
const jwt = require('../../module/jwt');

var moment = require('moment');
require('moment-timezone');
moment.tz.setDefault("Asia/Seoul");

router.get('/', async (req, res) => {
    const user = jwt.verify(req.headers.token);

    if (user === null || !req.headers.token) {
        res.status(200).send(utils.successFalse(statusCode.BAD_REQUEST, resMessage.NULL_VALUE));
    } else {
        try {
            var connection = await pool.getConnection();
            const selectUserPost =
            'SELECT * FROM '+
                '(SELECT P.*, COUNT (L.likeIdx) likeCnt, COUNT(C.commentIdx) commentCount ' +
                'FROM post AS P ' +
                'LEFT OUTER JOIN instagram.like AS L ON P.postIdx = L.postIdx ' +
                'LEFT OUTER JOIN comment AS C ON P.postIdx = C.postIdx ' +
                'LEFT OUTER JOIN follow AS F ON P.userIdx = F.followingIdx ' +
                'WHERE F.userIdx = ? ' +
                'GROUP BY P.postIdx ' +
                //'ORDER BY P.postIdx DESC '+
                'UNION '+

                'SELECT P.*, COUNT (L.likeIdx) likeCnt, COUNT(C.commentIdx) commentCount ' +
                'FROM post AS P ' +
                'LEFT OUTER JOIN instagram.like AS L ON P.postIdx = L.postIdx ' +
                'LEFT OUTER JOIN comment AS C ON P.postIdx = C.postIdx ' +
                //'LEFT OUTER JOIN follow AS F ON P.userIdx = F.followingIdx ' +
                'WHERE P.userIdx = ? ' +
                'GROUP BY P.postIdx) c ' +
                'ORDER BY postIdx DESC '  ;


            // 'SELECT post.* ' +
            // 'FROM post ' +
            // 'INNER JOIN follow ' +
            // 'ON post.userIdx = follow.followingIdx ' +
            // 'WHERE follow.followingIdx = ? ' +
            // 'UNION ' +
            // 'SELECT posts.* ' +
            // 'FROM posts ' +
            // 'WHERE posts.user_id = ? ';

            var postResult = await connection.query(selectUserPost, [user.userIdx, user.userIdx]);
        } catch (err) {
            console.log(err);
            connection.rollback(() => { });
            res.status(200).send(utils.successFalse(statusCode.DB_ERROR, resMessage.READ_FAIL));
        } finally {

            pool.releaseConnection(connection);
            res.status(200).send(utils.successTrue(statusCode.OK, resMessage.READ_SUCCESS, postResult));
        }
    }
});

module.exports = router;