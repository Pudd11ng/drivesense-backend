function errorHandler(err, req, res, next) {
    const statusCode = err.status || 500;
    const message = err.message || 'Internal Server Error';

    res.status(statusCode).json({
        status: 'error',
        statusCode: statusCode,
        message: message,
    });
}

module.exports = errorHandler;