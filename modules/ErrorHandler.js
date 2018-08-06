ErrorHandler = {
    init() {
        console.log('ErrorHandler init')
    }

    ,generateError(errorType, data) {
        return this[errorType](data);
    }

    ,fileType(data) {
        const error = {
            errorType: "fileType",
            data: {
                fileName: data.file.originalFilename
            },
            requestOptions: data.options,
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
}

ErrorHandler.init();

module.exports = ErrorHandler;