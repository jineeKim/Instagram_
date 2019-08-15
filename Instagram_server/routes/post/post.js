var express = require('express');
var router = express.Router();

const resMessage = require('../../module/utils/responseMessage');
const statusCode = require('../../module/utils/statusCode');
const utils = require('../../module/utils/utils');
const upload = require('../../config/multer');

const pool = require('../../config/dbConfig');
const jwt = require('../../module/jwt');

var moment = require('moment');
require('moment-timezone');
moment.tz.setDefault("Asia/Seoul");

router.get('/', async (req, res) => {
    const user = jwt.verify(req.headers.token);

    if (user === null || !req.headers.token) {
        res.status(200).send(utils.successFalse(statusCode.BAD_REQUEST, resMessage.NULL_VALUE));
    } else {
        try{
            var connection = await pool.getConnection();

            const selectPost = 'SELECT * FROM post WHERE userIdx = ?';
            var allPostResult = await connection.query(selectPost, [user.userIdx]);
        }catch(err){
            console.log(err);
            connection.rollback(()=>{});
            res.status(200).send(utils.successFalse(statusCode.DB_ERROR, resMessage.READ_FAIL));
        }finally{
            let resData = new Array();
            for(let i= allPostResult.length-1; i>=0;i--){
                resData.push(allPostResult[i]);
            }
            pool.releaseConnection(connection);
            res.status(200).send(utils.successTrue(statusCode.OK,resMessage.READ_SUCCESS,resData));
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

router.get('/:idx',async(req,res)=>{
    let idx = req.params.idx;
    console.log("idx:::"+idx);

    try{
        var connection = await pool.getConnection();
        await connection.beginTransaction();

        let selectPost = 'SELECT * FROM post WHERE postIdx= ?';
        let postResult = await connection.query(selectPost,[idx]);
    
        console.log("postResult:::"+JSON.stringify(postResult[0]));

        let time = postResult[0].time;
        let content = postResult[0].content;
        console.log(time)
        await connection.commit();

        let selectPhoto = 'SELECT * FROM photo WHERE postIdx=?';
        photoResult = await connection.query(selectPhoto,[idx]);
        console.log("photoResult:::"+photoResult);

        await connection.commit();

        let selectLike = 'SELECT COUNT(*) cnt, userId FROM instagram.like WHERE postIdx=?';
        likeResult = await connection.query(selectLike,[idx]);
        console.log("count like"+JSON.stringify(likeResult));

        await connection.commit();

        let selectComment = 'SELECT COUNT(*) cnt, userId, comment FROM comment WHERE postIdx=?';
        commentResult = await connection.query(selectComment,[idx]);
        
        await connection.commit();

        var resData = {
            content: content,
            time : time,
            photo : photoResult,
            like: likeResult,
            comment:commentResult
        }
        
    }catch(err){
        console.log(err);
        connection.rollback(()=>{});
        res.status(200).send(utils.successFalse(statusCode.DB_ERROR,resMessage.POST_READ_FAILE));
    }finally{
        pool.releaseConnection(connection);
        res.status(200).send(utils.successTrue(statusCode.OK,resMessage.POST_READ_SUCCESS,resData));
    }

});


module.exports = router;