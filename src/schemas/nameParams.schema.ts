import * as Joi from "joi";

export const nameParams = {
    params: Joi.object({
        name: Joi.string()
            .min(1)
            .max(255)
            .required()
    }),
};
