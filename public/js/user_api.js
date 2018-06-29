User = {
    init: function() {
        this.registration = $('.registration__form');
        this.congrats = $('.congratulations');
        this.note = $('.invalid__email');

        this.authorizing = $('.login');
        this.user = $('input[name="user"]');
        this.password = $('input[name="pass"]');

        this.registration.on('submit', this.register);
        this.authorizing.on('submit', this.login);
    }

    ,login: async function() {
        event.preventDefault();

        let data = {
            name: $('input[name="user"]').val()
            ,password: $('input[name="pass"]').val()
        };

        await User.Ajax.post('/login', JSON.stringify(data));

        location.reload();
    }

    ,register: async function() {
        event.preventDefault();

        alert('stay');

        let data = {},
            email = $('#login').val(),
            reg = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/;

        if (reg.test(email) != false) {

            data.name = email;

            let response = JSON.parse(await User.Ajax.post('/register', JSON.stringify(data)));

            if (response.status) {
                User.congrats.addClass('active');
                User.registration.removeClass('active');
            } else {
                User.note.addClass('active').text(response.message);
            }

        } else {
            User.note.addClass('active').text('Please, enter correct email');
        }

    }

    ,logout: function() {

    }

    ,session: async function() {
        let data = JSON.parse(await this.Ajax.get('/onsession'));
        return data.online;
    }

    ,Ajax: {
        get: function(path, callback) {
            return new Promise( (resolve, reject) => {
                let xhr = new XMLHttpRequest();

                xhr.onload = () => {
                    if (xhr.status == 200) {
                        if (callback) callback(xhr.responseText);
                        resolve(xhr.responseText);
                    } else {
                        reject(xhr.responseText);
                    }
                }

                xhr.open('GET', path);
                xhr.send();
            });
        }

        ,post: function(path, data = null, callback) {

            return new Promise( (resolve, reject) => {
                let xhr = new XMLHttpRequest();

                xhr.onload = () => {
                    if (xhr.status == 200) {
                        if (callback) callback(xhr.responseText);
                        resolve(xhr.responseText);
                    } else {
                        reject(xhr.responseText);
                    }
                }

                console.log(data);

                xhr.open('POST', path);
                xhr.send(data);

            });
        }

    }
}

User.init();