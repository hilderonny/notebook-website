var db = require('../utils/db');
var bcryptjs = require('bcryptjs');
var jsonwebtoken = require('jsonwebtoken');

module.exports = function(router) {

    var tokensecret = process.env.TOKENSECRET || 'mytokensecret';

    router.post('/login', async function(request, response) {
        if (!request.body.username) return response.status(400).json({ error: 'Username required' });
        if (!request.body.password) return response.status(400).json({ error: 'Password required' });
        var existingusers = await db.query('select id, username, password from user where username = ?;', [request.body.username]);
        if (existingusers.length < 1) return response.status(403).json({ error: 'Login failed' });
        var user = existingusers[0];
        if (!bcryptjs.compareSync(request.body.password, user.password)) return response.status(403).json({ error: 'Login failed' });
        var result = {
            id: user.id,
            token: jsonwebtoken.sign({
                id: user.id,
                time: Date.now()
            }, tokensecret, {
                expiresIn: '24h'
            }),
            username: user.username
        };
        response.json(result);
    });

    router.post('/register', async function(request, response) {
        if (!request.body.username) return response.status(400).json({ error: 'Username required' });
        if (!request.body.password) return response.status(400).json({ error: 'Password required' });
        var existingusers = await db.query('select username from user where username = ?;', [request.body.username]);
        if (existingusers.length > 0) return response.status(400).json({ error: 'Username already taken' });
        var id = Date.now().toString();
        await db.query('insert into user (id, username, password) values (?, ?, ?);', [
            id,
            request.body.username,
            bcryptjs.hashSync(request.body.password)
        ]);
        var createduser = {
            id: id,
            token: jsonwebtoken.sign({
                id: id,
                time: Date.now()
            }, tokensecret, {
                expiresIn: '24h'
            }),
            username: request.body.username
        };
        response.json(createduser);
    });

    return router;
};