import { contact } from "../controllers/contact.controllers";
import { validateRequest } from "../helpers/validateRequestSchema";
import { contactBodySchema } from "../schemas/contactBody.schema";
import AuthRoute from "./routes/authentification.routes";

const express = require("express");


const router = express.Router();

router.post("/contact", validateRequest(contactBodySchema), contact);
router.use("/auth", AuthRoute);
router.use("/users", UsersRoute);
router.use("/models", ModelsRoute);
router.use("/cars", CarsRoute);
router.use("/reservation", ReservationRoute);

export default router;