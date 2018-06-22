Core = function () {
}

Core.prototype = {
    init: function () {
        console.log('Application successfully loaded');

        window.base = new Base();

        this.loadContent();
    },

    loadContent: function () {
        let t = this;

        $.ajax({
            type: 'GET',
            url: 'server.json',
            dataType: 'json',
            success: function(data) {
                t.parseContent(data);
                console.log(data);
            },
            data: {}
        });
    },

    parseContent: function (data) {
        for (key in data) {
            base = data[key];
        }

        console.log(base)
    }
}
