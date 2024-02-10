const Joi = require("joi");

export const loginSchema = {
  body: Joi.object({
    email: Joi.string()
      .email()
      .required(),
    pwd: Joi.string()
      .required()
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{10,20}$/),
    OTP: Joi.number().integer().min(100000).max(999999),
  }),
};
