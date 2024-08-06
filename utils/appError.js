class AppError extends Error{
    constructor(message, statusCode){
        super(message) //Error accepts only message parameter like new Error(message)

        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        this.isOperational = true;
        Error.captureStackTrace(this, this.constructor);
    }
}

module.exports = AppError;