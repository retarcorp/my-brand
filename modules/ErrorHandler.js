ErrorHandler = {
    init() {
        console.log('ErrorHandler init')
    }

    ,generateError(errorType, data) {
        return this[errorType](data);
    }

    ,fileType() {
        const error = {
            errorType: "fileType",
            message: "Unavailable file type"
        }

        return error;
    }

    ,noData(data) {
        const error = {
            errorType: "noData",
            data: {},
            requestOptions: data.options,
            message: "No data"
        }

        return error;
    }

    ,dataExpected() {
        const error = {
            errorType: 'dataExpected',
            data: {},
            message: "Not valid request"
        }

        return error;
    }
}

ErrorHandler.init();

module.exports = ErrorHandler;