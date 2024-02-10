import * as Joi from "joi";

export const searchQuery = {
    query: Joi.object({
        search: Joi.string().min(1).max(255).required()
    }),
}