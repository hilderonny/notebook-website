import * as Auth from "/static/auth/Auth.js";

Auth.init('userid', 'username', 'password');

var App = (function () {

    var serviceworkerregistration;

    var books = [], canvas;

    var cardstack = [];
    var currentcard, currentpage, currentbook, currentbookpages, camefromregistration = false, config;

    var defaultconfig = {
        width: 2100, // A4
        height: 2970,
        sensibility: 1,
        pensize: 3,
        pencolor: '#000',
        pentype: 'pen',
        currentpageid: undefined,
        currentbookid: undefined,
    };

    function _loadconfig() {
        var storedconfigstring = localStorage.getItem('config');
        var usedconfig;
        if (storedconfigstring) {
            usedconfig = JSON.parse(storedconfigstring);
        } else {
            localStorage.setItem('config', JSON.stringify(defaultconfig));
            usedconfig = defaultconfig;
        }
        usedconfig.save = function() {
            localStorage.setItem('config', JSON.stringify(this));
        }
        return usedconfig;
    }

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

    function _createbutton(text, handler) {
        var button = document.createElement('button');
        button.innerHTML = text;
        button.addEventListener('click', handler);
        return button;
    }

    async function _fetchbooks() {
        books = await Notebook.loadbooks();
        books.sort(function (a, b) { return a.title.localeCompare(b.title); });
        console.log('📓 books', books);
    }

    async function _loadcurrentbook(bookid) {
        currentbook = books.find(function(b) { return b.id === bookid; });
        currentbookpages = (await Notebook.loadpages()).filter(function(p) { return p.book === currentbook.id; });
    }

    async function _listbooks() {
        await _fetchbooks();
        var listdiv = document.querySelector('.card.books .list');
        listdiv.innerHTML = "";
        books.forEach(function (book) {
            var button = _createbutton(book.title || book.id, async function () {
                await _loadcurrentbook(book.id);
                _showpage(book.currentpage);
            });
            if (book.image) button.style.backgroundImage = 'url(' + book.image + ')';
            listdiv.appendChild(button);
        });
    }

    async function _showbooks() {
        await _listbooks();
        _showcard('books', true);
    }

    async function _showpage(pageid) {
        page = await Notebook.loadpage(pageid);
        currentpage = page;
        config.currentpageid = pageid;
        config.currentbookid = currentbook.id;
        config.save();
        _showcard('page', false);
        _initcanvas();
        if (page.data) {
            var image = new Image();
            image.onload = function () {
                canvas.getContext('2d').drawImage(image, 0, 0);
            };
            image.src = page.data;
        }
        currentbook.currentpage = currentpage.id;
        await Notebook.savebook(currentbook);
        var pageselect = document.querySelector('.card.page .pageselect');
        pageselect.innerHTML = '';
        var currentpageindex;
        for (var i = 0; i < currentbookpages.length; i++) {
            var page = currentbookpages[i];
            var el = document.createElement('option');
            el.innerHTML = (i+1);
            el.value = page.id;
            if (page.id === currentbook.currentpage) {
                el.setAttribute('selected', 'selected');
                currentpageindex = i;
            }
            pageselect.appendChild(el);
        }
        var previousbutton = document.querySelector('.card.page .previouspage');
        var nextbutton = document.querySelector('.card.page .nextpage');
        if (currentpageindex < 1) {
            previousbutton.setAttribute('disabled', 'disabled');
        } else {
            previousbutton.removeAttribute('disabled');
        }
        if (currentpageindex >= currentbookpages.length - 1) {
            nextbutton.innerHTML = '+';
        } else {
            nextbutton.innerHTML = '⏩';
        }
        document.querySelector('.card.page .buttonrow .savepage').setAttribute('disabled', 'disabled');
        document.querySelector('.card.page .buttonrow .radio.type [value="' + config.pentype + '"]').click();
        document.querySelector('.card.page .buttonrow .radio.size [value="' + config.pensize + '"]').click();
        document.querySelector('.card.page .buttonrow .radio.color [value="' + config.pencolor + '"]').click();
        console.log('📜 page:', page);
    }

    async function _login() {
        camefromregistration = false;
        var errormessagediv = document.querySelector('.card.login .errormessage');
        errormessagediv.style.display = 'none';
        var username = document.querySelector('.card.login [name="username"]').value;
        var password = document.querySelector('.card.login [name="password"]').value;
        await Auth.login(username, password);
    }

    async function _logout() {
        Auth.logout();
    }

    async function _register() {
        camefromregistration = true;
        var errormessagediv = document.querySelector('.card.register .errormessage');
        errormessagediv.style.display = 'none';
        var username = document.querySelector('.card.register [name="username"]').value;
        var password1 = document.querySelector('.card.register [name="password1"]').value;
        var password2 = document.querySelector('.card.register [name="password2"]').value;
        if (password1 !== password2) {
            errormessagediv.style.display = 'block';
            return;
        }
        await Auth.register(username, password1);
    }

    async function _showloggedincard() {
        _showcard('loggedin');
    }

    function _showlogincard() {
        document.querySelector('.card.login .errormessage').style.display = 'none';
        _showcard('login', true);
    }

    function _removeloading() {
        document.body.classList.remove('loading');
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
        Auth.tryautologin();
    });

    window.addEventListener('login', async function(evt) {
        if (evt.detail.success) {
            Notebook.init(evt.detail.userid);
            await _showloggedincard();
            await _showbooks();
            _removeloading();
            config = _loadconfig();
            if (config.currentbookid && config.currentpageid) {
                await _loadcurrentbook(config.currentbookid);
                await _showpage(config.currentpageid);
            }
        } else {
            if (camefromregistration) {
                var errormessagediv = document.querySelector('.card.register .errormessage');
                errormessagediv.style.display = 'block';
            } else {
                _showlogincard();
            }
            _removeloading();
        }
    });

    window.addEventListener('logout', function() {
        _showlogincard();
    });

    window.addEventListener('offline', function() {
        document.querySelector('body').classList.add('offline');
    });

    window.addEventListener('orientationchange', function () {
        location.reload(); // Damit Breite und Höhe wieder synchron sind
    });

    return {
        addbook: async function () {
            var book = await Notebook.addbook();
            currentbook = book;
            currentbookpages = (await Notebook.loadpages()).filter(function(p) { return p.book === currentbook.id; });
            _showpage(book.currentpage);
        },
        hidecurrentcard: _hidecurrentcard,
        login: _login,
        logout: _logout,
        register: _register,
        savebookproperties: async function() {
            currentbook.title = document.querySelector('.card.bookdetails [name="title"]').value;
            currentbook.image = document.querySelector('.card.bookdetails [name="image"]').value;
            currentbook.lastmodified = Date.now();
            await Notebook.savebook(currentbook);
            _hidecurrentcard();
        },
        savepage: function () {
            currentpage.data = canvas.toDataURL();
            currentpage.lastmodified = Date.now();
            Notebook.savepage(currentpage);
            document.querySelector('.card.page .buttonrow .savepage').setAttribute('disabled', 'disabled');
        },
        setpencolor: function(pencolor) {
            config.pencolor = pencolor;
            config.save();
        },
        setpensize: function(pensize) {
            config.pensize = pensize;
            config.save();
        },
        setpentype: function(pentype) {
            config.pentype = pentype;
            config.save();
        },
        showbooks: _showbooks,
        showbookproperties: function() {
            document.querySelector('.card.bookdetails [name="title"]').value = currentbook.title;
            document.querySelector('.card.bookdetails [name="image"]').value = currentbook.image;
            _showcard('bookdetails');
        },
        showloggedincard: _showloggedincard,
        showlogincard: _showlogincard,
        shownextpage: async function() {
            var currentindex = currentbookpages.findIndex(function(p) { return p.id === currentpage.id; });
            if (currentindex >= currentbookpages.length - 1) {
                var newpage = await Notebook.addpage(currentpage.book);
                currentbookpages.push(newpage);
            }
            _showpage(currentbookpages[currentindex + 1].id);
        },
        showpage: _showpage,
        showpreviouspage: async function() {
            var currentindex = currentbookpages.findIndex(function(p) { return p.id === currentpage.id; });
            if (currentindex < 1) return;
            _showpage(currentbookpages[currentindex - 1].id);
        },
        showregistercard: function () {
            document.querySelector('.card.register .errormessage').style.display = 'none';
            _showcard('register', true);
        },
        synchronize: async function() {
            var localbooks = await Notebook.loadbooks();
            var remotebooks = await Auth.post('/api/book/list');
            var localpages = await Notebook.loadpages();
            var remotepages = await Auth.post('/api/page/list');
            var syncbutton = document.querySelector('.card.books .synchronize');
            var count = localbooks.length + remotebooks.length + localpages.length + remotepages.length;
            var current = 1;
            function countup() {
                syncbutton.innerHTML = 'Synchronisiere ' + current + '/' + count + ' ...';
                current++;
            }
            // Seiten, die lokal neuer sind
            for (var i = 0; i < localpages.length; i++) {
                countup();
                var localpage = localpages[i];
                var remotepage = remotepages.find(function(rp) { return rp.id === localpage.id; });
                if (!remotepage || remotepage.lastmodified < localpage.lastmodified) {
                    await Auth.post('/api/page/save', localpage);
                }
            }
            // Seiten, die remote neuer sind
            for (var i = 0; i < remotepages.length; i++) {
                countup();
                var remotepage = remotepages[i];
                var localpage = localpages.find(function(lp) { return lp.id === remotepage.id; });
                if (!localpage || localpage.lastmodified < remotepage.lastmodified) {
                    var fullremotepage = await Auth.post('/api/page/get', { id: remotepage.id });
                    await Notebook.savepage(fullremotepage);
                }
            }
            // Bücher, die lokal neuer sind
            for (var i = 0; i < localbooks.length; i++) {
                countup();
                var localbook = localbooks[i];
                var remotebook = remotebooks.find(function(rb) { return rb.id === localbook.id; });
                if (!remotebook || remotebook.lastmodified < localbook.lastmodified) {
                    await Auth.post('/api/book/save', localbook);
                }
            }
            // Bücher, die remote neuer sind
            for (var i = 0; i < remotebooks.length; i++) {
                countup();
                var remotebook = remotebooks[i];
                var localbook = localbooks.find(function(lb) { return lb.id === remotebook.id; });
                if (!localbook || localbook.lastmodified < remotebook.lastmodified) {
                    var fullremotebook = await Auth.post('/api/book/get', { id: remotebook.id });
                    await Notebook.savebook(fullremotebook);
                }
            }
            await _listbooks();
            syncbutton.innerHTML = 'Synchronisieren';
        },
    };
})();

// Damit Auth und App aus der index.html aus aufrufbar sind.
window.Auth = Auth;
window.App = App;