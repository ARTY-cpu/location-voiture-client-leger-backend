import {Response} from "express";
const version = require('../../package.json').version;


export enum ErrorType {
    UNAUTHORIZED,
    UNAUTHENTICATED,
    INVALID_ARGUMENT,
    CONFLICT,
    CUSTOM,
    INTERNAL,
}


export class ErrorHandler {
    public static getStatusCodeForErrorType(type?: ErrorType) {
        switch (type) {
            case ErrorType.UNAUTHORIZED:
                return 401
            case ErrorType.UNAUTHENTICATED:
                return 403
            case ErrorType.INVALID_ARGUMENT:
                return 404
            case ErrorType.CUSTOM:
                return 400
            case ErrorType.CONFLICT:
                return 409
            case ErrorType.INTERNAL:
                return 500
            default:
                return 500
        }
    }

    private static returnMessage(type?: ErrorType) {
        switch (type) {
            case ErrorType.UNAUTHORIZED:
                return "permission-denied";
            case ErrorType.UNAUTHENTICATED:
                return "unauthenticated";
            case ErrorType.INVALID_ARGUMENT:
                return "invalid-argument";
            case ErrorType.CUSTOM:
            case ErrorType.CONFLICT:
                return "cancelled";
            case ErrorType.INTERNAL:
                return "internal";
            default:
                return "internal";
        }
    }

    public static generateError(res: Response, errorType: ErrorType, customMessage?: string) {
        try{
            const message = customMessage ?? this.returnMessage(errorType)
    
            res.statusCode = this.getStatusCodeForErrorType(errorType);
            res.json({message, date: new Date(), version});
            return res;
        }catch (e) {
            console.log(e)
        }
    }
}