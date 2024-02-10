import * as Joi from "joi";

export const contactBodySchema = {
    body: Joi.object({
        name: Joi.string()
            .min(1)
            .max(255)
            .required()
            .description("Name of the contact"),
        email: Joi.string()
            .email()
            .required()
            .description("Email of the contact"),
        message: Joi.string()
            .min(1)
            .max(5000)
            .required()
            .description("Message of the contact"),
    }),
};