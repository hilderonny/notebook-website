var db = require('@levelupsoftware/db');
var auth = require('@levelupsoftware/auth');

module.exports = function(router) {

    router.post('/get', auth, async function(request, response) {
        if (!request.body.id) return response.status(400).json({ error: 'id required' });
        var pages = await db.query('select * from page where id = ? and user = ?;', [ request.body.id, request.user.id ]);
        if (pages.length < 1) return response.status(400).json({ error: 'page not found' });
        response.status(200).json(pages[0]);
    });

    router.post('/list', auth, async function(request, response) {
        var pages = await db.query('select id, lastmodified from page where user = ?;', [ request.user.id ]);
        response.status(200).json(pages);
    });

    router.post('/listforbook', auth, async function(request, response) {
        if (!request.body.book) return response.status(400).json({ error: 'book required' });
        var pages = await db.query('select id from page where book = ? and user = ?;', [ request.body.book, request.user.id ]);
        response.status(200).json(pages);
    });

    router.post('/save', auth, async function(request, response) {
        var existing = await db.query('select id from page where id = ? and user = ?', [ request.body.id, request.user.id ]);
        if (existing.length < 1) {
            await db.query('insert into page (id, user, book, lastmodified) values (?, ?, ?, ?);', [ request.body.id, request.body.user, request.body.book, request.body.lastmodified ]);
        }
        var result = await db.query('update page set ? where id = ? and user = ?;', [
            request.body,
            request.body.id,
            request.user.id
        ]);
        response.status(200).json(request.body);
    });

    return router;
};