import * as Joi from "joi";

export const registerSchema = {
    body: Joi.object({
        pseudo: Joi.string()
            .alphanum()
            .min(3)
            .max(30)
            .required(),
        email: Joi.string()
            .email()
            .required(),
        pwd: Joi.string()
            .required()
            .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{10,20}$/),
        description: Joi.string(),
        profile_picture: Joi.string()
            .base64({ paddingRequired: true })
    }),
};
