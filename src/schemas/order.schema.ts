import * as Joi from "joi";

export const orderSchema = {
    query: Joi.object({
        order: Joi.string()
            .valid(...["1", "-1"])
            .required(),
    }),
};