class Ajax {
    constructor(app) {
        this.App = app;
    }

    getJSON(path){
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest;

            xhr.open("GET",path, true);
            xhr.onload = () => {
                resolve(JSON.parse(xhr.responseText));
            }

            xhr.setRequestHeader('Content-Type', 'application/json');
            xhr.send(null);

        });
    }

    postJSON(path, data = null, callback){
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest;

            xhr.open("POST",path, true);
            xhr.onload = () => {
                if (callback) callback(xhr.responseText);
                resolve(JSON.parse(xhr.responseText))
            }

            xhr.setRequestHeader('Content-Type', 'application/json');
            xhr.send(data);
        });
    }


    get(path, callback, responseType = "") {
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

    post(path, data = null, callback) {
        if (typeof data == "function") {
            callback = data;
            data = null;
        }

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

            xhr.open('POST', path);
            xhr.send(data);

        });
    }

    getBlob(path, cb) {
        const xhr = new XMLHttpRequest();

        xhr.onload = () => {
            if (cb) cb(xhr.response);
        }

        xhr.onerror = () => {
            if (cb) cb(xhr.response);
        }

        xhr.open('GET', path);
        xhr.responseType = 'blob';
        xhr.send();
    }
}