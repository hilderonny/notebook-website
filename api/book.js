var db = require('@levelupsoftware/db');
var auth = require('../utils/auth');

module.exports = function(router) {

    router.post('/get', auth, async function(request, response) {
        if (!request.body.id) return response.status(400).json({ error: 'id required' });
        var books = await db.query('select * from book where id = ? and user = ?;', [ request.body.id, request.user.id ]);
        if (books.length < 1) return response.status(400).json({ error: 'book not found' });
        response.status(200).json(books[0]);
    });

    router.post('/list', auth, async function(request, response) {
        var books = await db.query('select id, lastmodified from book where user = ?;', [request.user.id]);
        response.status(200).json(books);
    });

    router.post('/save', auth, async function(request, response) {
        var existing = await db.query('select id from book where id = ? and user = ?', [ request.body.id, request.user.id ]);
        if (existing.length < 1) {
            await db.query('insert into book (id, user, lastmodified) values (?, ?, ?);', [ request.body.id, request.body.user, request.body.lastmodified ]);
        }
        await db.query('update book set ? where id = ? and user = ?;', [
            request.body,
            request.body.id,
            request.user.id
        ]);
        response.status(200).json(request.body);
    });
    
    return router;
};