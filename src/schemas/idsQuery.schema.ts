import * as Joi from "joi";

export const idsQuery = {
    query: Joi.object({
        id: Joi.array()
            .items(
                Joi.number()
                .integer()
                .min(0)
                .default(0)
            )
            .required()
    }),
};
