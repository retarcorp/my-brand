var Logger = {

    setOptions(opt) {
        this.path = opt.path || this.path;
        this.credentials = opt.credentials || this.credentials;
    }

    ,formLogData(type, data) {
        const log_data = {
            data: data || this.data[type] || {},
            type: type || 'application',
            time: new Date().toLocaleTimeString()
        };

        return log_data;
    }

    ,logInstant(type, data, URL) {
        this.sendData(this.formLogData(type, data), URL);
    }

    /**
     * @description Добавляет в logger объект по ключу type.
     * @param {string} type Тип события.
     * @param {object} obj Объект, соответствующий типу события.
     */

    ,addToLogger(type, obj) {
        this.data[type] =  this.data[type] || [];
        this.data[type].push(obj);
    },

    /**
     * @description Добавляет в logger объект по ключу type.
     * @param {object} log_data Объект, соответствующий типу события.
     * @param {string} URL Путь, по которому на сервер отправляется объект.
     */
    sendData(log_data, URL) {
        const xhr = new XMLHttpRequest();

        xhr.onload = function() {
            // console.log(xhr.response);
        };

        URL = URL || this.path;

        xhr.open("POST", URL);
        xhr.setRequestHeader('content-type', 'application/json');
        xhr.send(JSON.stringify(log_data));
    },

    /**
     * @description Сохраняет в localStorage объект по ключу type.
     * @param {string} type Тип события.
     * @param {object} obj Объект, соответствующий типу события.
     */
    saveData(type, obj) {
        type = type || "all";
        var data = (type == 'all') ? this.data : this.data[type] || {};
        localStorage.setItem(type, JSON.stringify(data));
    },

    /**
     * @description Возвращает данные, содержащиеся в объекте data.
     * @param {string} type Тип события.
     * @return {object}
     */
    getData(type) {
        type = type || 'all';

        if (type !== 'all') {
            return this.data[type];
        }

        return this.data;
    },

    /**
     * @description Создаёт копию объекта и оправлет её в фунуцию, добавления в logger.
     * @param {string} type Тип события.
     * @param {object} obj Объект, соответствующий типу события.
     */
    saveToHistory(type,obj) {
        var newObj = JSON.parse(JSON.stringify(obj));
        this.addToLogger(type,newObj);
    },

    /**
     *@type {string}
     */
    path: '/',

    /**
     @type {object}
     */
    credentials: {},

    /**
     @type {object}
     */
    data: {}
};