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
                'SELECT P.*, COUNT (L.likeIdx) likeCnt, COUNT(C.commentIdx) commentCount ' +
                'FROM post AS P ' +
                'LEFT OUTER JOIN instagram.like AS L ON P.postIdx = L.postIdx ' +
                'LEFT OUTER JOIN comment AS C ON P.postIdx = P.postIdx ' +
                'WHERE P.userIdx = ? ' +
                'GROUP BY P.postIdx ' +
                'ORDER BY P.postIdx DESC ';

            var postResult = await connection.query(selectUserPost, [user.userIdx]);
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

router.post('/', upload.array('photos'), async (req, res) => {
    const user = jwt.verify(req.headers.token);
    const imgs = req.files;

    if (user === null || !req.files) {
        res.status(200).send(utils.successFalse(statusCode.BAD_REQUEST, resMessage.NULL_VALUE));
    } else {
        let insertPost = 'INSERT INTO post (userIdx, thumbnail, content, time) VALUES (?,?,?,?)';

        try {
            var connection = await pool.getConnection();
            await connection.beginTransaction();

            const insertPostResult = await connection.query(insertPost, [
                user.userIdx, imgs[0].location,
                req.body.content,
                moment().format('YYYY-MM-DD HH:mm:ss')
            ]);

            await connection.commit();

            const postIdx = insertPostResult.insertId;
            const insertPhoto = 'INSERT INTO photo (postIdx, photo) VALUES (?, ?)';

            for (idx in imgs) {
                const insertPhotoResult = await connection.query(insertPhoto, [postIdx, imgs[idx].location]);
                await connection.commit();
            }
        } catch (err) {
            console.log(err);
            connection.rollback(() => { });
            res.status(200).send(utils.successFalse(statusCode.DB_ERROR, resMessage.SAVE_FAIL));
        } finally {
            pool.releaseConnection(connection);
            res.status(200).send(utils.successTrue(statusCode.CREATED, resMessage.SAVE_SUCCESS));
        }
    }
});

router.patch('/:idx', async (req, res) => {
    const user = jwt.verify(req.headers.token);

    if (user === null || !req.params.idx) {
        res.status(200).send(utils.successFalse(statusCode.BAD_REQUEST, resMessage.NULL_VALUE));
    } else {
        const updateUserQuery = 'UPDATE post SET content = ? WHERE postIdx = ?';
        const userResult = await db.queryParam_Parse(updateUserQuery, [req.body.content, req.params.idx]);

        if(!userResult)
            res.status(200).send(utils.successTrue(statusCode.CREATED, resMessage.UPDATE_SUCCESS));
        else
            res.status(200).send(utils.successFalse(statusCode.DB_ERROR, resMessage.UPDATE_FAIL));
    }
});

module.exports = router;