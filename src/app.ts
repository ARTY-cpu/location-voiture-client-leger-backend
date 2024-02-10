const express = require('express');
const cors = require('cors');
const dotenv = require("dotenv");
const bodyParser = require('body-parser');
const YAML = require('yamljs');
const path = require('path');
import * as swaggerUi from "swagger-ui-express";
import { ErrorHandler, ErrorType } from "./helpers/ErrorHandler";
import router from "./router/index";

dotenv.config();
const app = express();
const options = {};
const coreOptions = {
    origin: process.env.DOMAINE??'*'
}
app.use(cors(coreOptions));


export function startServer(){
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use("/api", router);
    app.use("/api-doc", swaggerUi.serveFiles(YAML.load(path.resolve(__dirname,'../../swagger.yaml')), options), swaggerUi.setup(YAML.load(path.resolve(__dirname,'../../swagger.yaml')), options));
    app.get("/", (req:any, res:any) => {
        res.send("Ceci est la page d'accueil de l'API");
    });
    router.use("*", async function notFound(req: any, res: any) {
        ErrorHandler.generateError(res, ErrorType.INVALID_ARGUMENT, "Path not exist")
    });
}