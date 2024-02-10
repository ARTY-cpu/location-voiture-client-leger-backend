import * as Joi from "joi";
import {ObjectSchema, Schema} from "joi";
import * as HttpErrors from "http-errors";
import {RequestHandler, Request} from "express";

interface ValidationOptions {
    params?: ObjectSchema | Record<string, Schema>;
    query?: ObjectSchema | Record<string, Schema>;
    body?: ObjectSchema | Record<string, Schema>;
    headers?: ObjectSchema | Record<string, Schema>;
}

export function validateRequest(schema: ValidationOptions): RequestHandler<any, any, any, any, any> {
    return (req, res, next) => {
        const {error} = Joi.object(schema).validate(
            {
                query: schema.query ? req.query : undefined,
                body: schema.body ? req.body : undefined,
                params: schema.params ? req.params : undefined,
                headers: schema.headers ? req.headers : undefined,
            },
            {abortEarly: false, allowUnknown: true},
        );

        if (error) {
            const httpError = new HttpErrors.BadRequest();

            return res.status(httpError.status).json({
                success: false,
                statusCode: httpError.status,
                error: httpError.name,
                message: error.message,
                details: error.details,
            });
        }
        return next();
    };
}