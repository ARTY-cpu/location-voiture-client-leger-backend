import * as Joi from "joi";

export const idParams = {
    params: Joi.object({
        id: Joi.number()
            .integer()
            .min(1)
            .default(0)
            .required()
    }),
};
