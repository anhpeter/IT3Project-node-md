const express = require('express')
const router = express.Router()

const Response = require('../app/common/response');
const roomModel = require('../app/models/rooms');
const mainModel = require('../app/models/room_status');

router.get('/', async (req, res) => {
    try {
        const io = req.app.get('socketio');
        io.emit('test-data', { username: 'peter' })
        const result = await mainModel.getAll();
        Response.success(res, result);
    } catch (e) { Response.error(res, e); }
})

router.get('/get-last', async (req, res) => {
    try {
        const [lastItem] = await mainModel.getLast(1);
        Response.success(res, lastItem);
    } catch (e) { Response.error(res, e); }
})


// insert
router.post('/', async (req, res) => {
    const io = req.app.get('socketio');
    const item = {
        ...req.body,
        date: new Date().toISOString(),

    };
    try {
        const result = await mainModel.insertOne(item);
        const status = await mainModel.getItemById(result._id).populate('room');
        console.log('\n NEW', status);
        io.emit(`SERVER_EMIT_ROOM_WITH_STATUS_${status.room._id}`, status);
        Response.success(res, status);
    } catch (e) { Response.error(res, e); }

})

// delete 
router.get('/delete-all', async (req, res) => {
    try {
        const result = await mainModel.deleteAll();
        Response.success(res, result);
    } catch (e) { Response.error(res, e); }
})

router.get('/fake', async (req, res) => {
    try {
        const result = await mainModel.insertFakeDocs();
        Response.success(res, {
            n: result.length,
            docs: result,
        });
    } catch (e) { Response.error(res, e); }
})

module.exports = router