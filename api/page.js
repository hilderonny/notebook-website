var db = require('../utils/db');
var auth = require('../utils/auth');

module.exports = function(router) {

    router.post('/add', auth, async function(request, response) {
        if (!request.body.book) return response.status(400).json({ error: 'book required' });
        var id = Date.now().toString();
        await db.query('insert into page (id, book, user) values (?, ?, ?);', [
            id,
            request.body.book,
            request.user.id
        ]);
        response.status(200).json({ id: id });
    });

    router.post('/get', auth, async function(request, response) {
        if (!request.body.id) return response.status(400).json({ error: 'id required' });
        var pages = await db.query('select id, data from pages where id = ? and user = ?;', [ request.body.id, request.user.id ]);
        if (pages.length < 1) return response.status(400).json({ error: 'page not found' });
        response.status(200).json(pages[0]);
    });

    router.post('/list', auth, async function(request, response) {
        if (!request.body.book) return response.status(400).json({ error: 'book required' });
        var pages = await db.query('select id from pages where book = ? and user = ?;', [ request.body.book, request.user.id ]);
        response.status(200).json(pages);
    });

    router.post('/save', auth, async function(request, response) {
        if (!request.body.id) return response.status(400).json({ error: 'id required' });
        if (!request.body.data) return response.status(400).json({ error: 'blob required' });
        await db.query('update quest set data = ? where id = ? and user = ?;', [
            data,
            rquest.body.id,
            request.user.id
        ]);
        response.status(200).json({});
    });

    return router;
};