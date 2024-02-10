import * as Joi from "joi";

export const getAll = {
    query: Joi.object({
        page: Joi.number()
            .integer()
            .min(1)
            .default(1)
            .required(),
        itemPerPage: Joi.number()
            .integer()
            .min(1)
            .max(500)
            .default(50)
            .required()
    }),
};
