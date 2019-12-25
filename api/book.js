var db = require('../utils/db');
var auth = require('../utils/auth');

module.exports = function(router) {

    router.post('/list', auth, async function(request, response) {
        var books = await db.query('select id, title, currentpage from book where user = ?;', [request.user.id]);
        response.status(200).json(books);
    });

    router.post('/add', auth, async function(request, response) {
        var title = request.body.title || '';
        if (title.length > 255) title = title.subString(0, 255);
        var id = Date.now().toString();
        await db.query('insert into book (id, user, title) values (?, ?, ?);', [
            id,
            request.user.id,
            title
        ]);
        response.status(200).json({ id: id });
    });

    router.post('/save', auth, async function(request, response) {
        if (!request.body.id) return response.status(400).json({ error: 'id required' });
        var title = request.body.title;
        if (!title) return response.status(200).json({});
        // Item speichern
        await db.query('update book set title = ? where id = ? and user = ?;', [
            title,
            request.body.id,
            request.user.id
        ]);
        response.status(200).json({});
    });
    
    return router;
};