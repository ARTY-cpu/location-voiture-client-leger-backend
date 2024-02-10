import { validateRequest } from "../../helpers/validateRequestSchema";
import { authenticationMiddleware } from "../../middlewares/authentication.middleware";
import { AuthenticationController } from "../../controllers/authentication.controller";
import { loginSchema } from "../../schemas/authentication/login.schema";
import { registerSchema } from "../../schemas/authentication/register.schema";
import { UserRolesEnum } from "../../enum/role.enum";

const express = require("express");

const route = express.Router();
const authenticationController = new AuthenticationController();

route.post("/login", validateRequest(loginSchema), authenticationController.login);
route.post("/register", validateRequest(registerSchema), authenticationController.registerUser);
route.delete("/", authenticationMiddleware(UserRolesEnum.USER), authenticationController.deleteAccount);

export default route;




// GET /api/users - Get all users
// GET /api/users/:id | /api/users?id=0 - Get a user by id
// POST /api/users - Create a user
// PUT /api/users | /api/users - Update a user by id info in body
// PATCH /api/users | /api/users - Update a user by id info in body
// DELETE /api/users | /api/users - Delete a user by id
