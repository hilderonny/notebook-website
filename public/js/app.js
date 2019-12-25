var App = (function () {

    var USERNAMEKEY = 'username';
    var PASSWORDKEY = 'password';

    var token;
    var serviceworkerregistration;

    var books = [], canvas;

    var cardstack = [];
    var currentcard, currentpage;

    var config = {
        width: 2100, // A4
        height: 2970,
        sensibility: 1,
        usetouch: true, // Default false
    };

    function _showcard(selector, clearstack) {
        if (clearstack) while (cardstack.length > 1) _hidecurrentcard();
        if (currentcard) currentcard.classList.remove('visible');
        currentcard = document.querySelector('.card.' + selector);
        cardstack.push(currentcard);
        currentcard.classList.add('visible');
    }

    function _hidecurrentcard() {
        currentcard.classList.remove('visible');
        cardstack.pop();
        currentcard = cardstack[cardstack.length - 1];
        if (currentcard) currentcard.classList.add('visible');
    }

    async function _post(url, data) {
        var response = await fetch(url, {
            method: "POST",
            cache: "no-cache",
            headers: {
                "Content-Type": "application/json",
                "x-access-token": token,
            },
            body: JSON.stringify(data)
        });
        return await response.json();
    }

    function _createbutton(text, handler) {
        var button = document.createElement('div');
        button.classList.add('button');
        button.innerHTML = text;
        button.addEventListener('click', handler);
        return button;
    }

    async function _fetchbooks() {
        books = await _post('/api/book/list');
        books.sort(function (a, b) { return a.title.localeCompare(b.title); });
        console.log('📓 books', books);
    }

    async function _listbooks() {
        await _fetchbooks();
        var listdiv = document.querySelector('.card.books .list');
        listdiv.innerHTML = "";
        books.forEach(function (book) {
            var button = _createbutton(book.id, function () {
                _showpage(book.currentpage);
            });
            listdiv.appendChild(button);
        });
    }

    async function _showbooks() {
        await _listbooks();
        _showcard('books', true);
    }

    async function _showpage(pageid) {
        var page = await _post('/api/page/get', { id: pageid });
        currentpage = page;
        _showcard('page', false);
        _initcanvas();
        if (page.data) {
            var image = new Image();
            image.onload = function () {
                canvas.getContext('2d').drawImage(image, 0, 0);
            };
            image.src = page.data;
        }
        console.log('📜 page:', page);
    }

    async function _login() {
        var errormessagediv = document.querySelector('.card.login .errormessage');
        errormessagediv.style.display = 'none';
        var username = document.querySelector('.card.login [name="username"]').value;
        var password = document.querySelector('.card.login [name="password"]').value;
        var result = await _post('/api/user/login', { username: username, password: password });
        if (result.id) {
            // Login succeeded
            userid = result.id;
            token = result.token;
            _storeusercredentials(username, password);
            _showloggedincard();
            _showbooks();
        } else {
            // Login failed
            errormessagediv.style.display = 'block';
            // Clear stored credentials on failure
            _storeusercredentials();
        }
    }

    async function _logout() {
        // Simply clear the local storage of user credentials
        _storeusercredentials();
        _showlogincard();
    }

    async function _register() {
        var errormessagediv = document.querySelector('.card.register .errormessage');
        errormessagediv.style.display = 'none';
        var username = document.querySelector('.card.register [name="username"]').value;
        var password1 = document.querySelector('.card.register [name="password1"]').value;
        var password2 = document.querySelector('.card.register [name="password2"]').value;
        if (password1 !== password2) {
            errormessagediv.style.display = 'block';
            return;
        }
        var result = await _post('/api/user/register', { username: username, password: password1 });
        if (result.id) {
            // Registration and login succeeded
            userid = result.id;
            token = result.token;
            _storeusercredentials(username, password1);
            _showloggedincard();
            _showbooks();
        } else {
            // Registrierung fehlgeschlagen
            errormessagediv.style.display = 'block';
        }
    }

    async function _showloggedincard() {
        _showcard('loggedin');
    }

    function _showlogincard() {
        document.querySelector('.card.login .errormessage').style.display = 'none';
        _showcard('login', true);
    }

    // Store username and password after successful login for future auto login
    // Call without parameters to clear the storage after logout
    function _storeusercredentials(username, password) {
        if (!username) localStorage.removeItem(USERNAMEKEY);
        else localStorage.setItem(USERNAMEKEY, username);
        if (!password) localStorage.removeItem(PASSWORDKEY);
        else localStorage.setItem(PASSWORDKEY, password);
    }

    function _removeloading() {
        document.body.classList.remove('loading');
    }

    // Tries to login with the credentials stored in local memory.
    // Returns true on success, false otherwise.
    async function _tryautologin() {
        var username = localStorage.getItem(USERNAMEKEY);
        var password = localStorage.getItem(PASSWORDKEY);
        if (!username || !password) {
            console.log("No username or password stored");
            _showlogincard();
            _removeloading();
            return;
        }
        var result = await _post('/api/user/login', { username: username, password: password });
        if (!result.id) {
            // Clear stored credentials on failure
            _storeusercredentials();
            _showlogincard();
            _removeloading();
            return;
        }
        userid = result.id;
        token = result.token;
        await _showloggedincard();
        await _showbooks();
        _removeloading();
    }

    function _initcanvas() {
        canvas = document.querySelector(".card.page canvas");
        canvas.width = config.width;
        canvas.height = config.height;
        initpencil(canvas, config);
    }

    window.addEventListener('load', async function () {
        // Service worker einbinden. Dieser muss im Stammverzeichnis der App in der Datei "serviceworker.js"
        // enthalten sein.
        if ('serviceWorker' in navigator) {
            var serviceWorkerFile = 'serviceworker.js';
            console.log('%c🧰 load: Registriere service worker aus Datei ' + serviceWorkerFile, 'color:yellow');
            serviceworkerregistration = await navigator.serviceWorker.register(serviceWorkerFile);
            // Bei Aktualisierung des serviceworkers soll die Seite gleich neu geladen werden, um neue Daten anzuzeigen
            serviceworkerregistration.onupdatefound = function () {
                const installingWorker = serviceworkerregistration.installing;
                installingWorker.onstatechange = function () {
                    if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
                        location.reload(); // Neu laden, wenn Service worker aktualisiert wurde
                    }
                };
            };
        }
        _tryautologin();
    });

    window.addEventListener("orientationchange", function () {
        location.reload(); // Damit Breite und Höhe wieder synchron sind
    });

    return {
        createbook: async function () {
            var bookaddresult = await _post('/api/book/add', {});
            if (bookaddresult.error) return;
            var bookid = bookaddresult.id;
            var pageresult = await _post('/api/page/add', { book: bookid });
            if (pageresult.error) return;
            var pageid = pageresult.id;
            var bookupdateresult = await _post('/api/book/save', { id: bookid, currentpage: pageid });
            if (bookupdateresult.error) return;
            _showpage(pageid);
        },
        login: _login,
        logout: _logout,
        register: _register,
        savepage: function () {
            var base64data = canvas.toDataURL();
            _post('/api/page/save', { id: currentpage.id, data: base64data });
        },
        showbooks: _showbooks,
        showloggedincard: _showloggedincard,
        showlogincard: _showlogincard,
        showregistercard: function () {
            document.querySelector('.card.register .errormessage').style.display = 'none';
            _showcard('register', true);
        },
    };
})();
