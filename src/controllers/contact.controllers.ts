import {Request, Response} from "express";
import {ErrorHandler, ErrorType} from "../helpers/ErrorHandler";
import {RequestSuccess, SuccessType} from "../helpers/RequestSuccess";
import { SendContactMail } from "../helpers/sendMail";

export const contact = async (req: Request, res: Response) => {
    try {
        const { name, email, message } = req.body;
        let result = await SendContactMail(name, email, message);
        (result)?RequestSuccess.generateSuccess(res, SuccessType.CREATED):ErrorHandler.generateError(res, ErrorType.INTERNAL, "Error while sending the mail");
    } catch (error: any) {
        ErrorHandler.generateError(res, ErrorType.CUSTOM, error.message)
    }
};