import {Request, Response} from "express";
import {ErrorHandler, ErrorType} from "../helpers/ErrorHandler";
import {RequestSuccess, SuccessType} from "../helpers/RequestSuccess";
import {AuthenticationService} from "../services/authentication.service";


export class AuthenticationController {

    private authenticationService: AuthenticationService;

    constructor() {
        this.authenticationService = new AuthenticationService();
    }

    async registerUser(req: Request, res: Response): Promise<any> {
        try {
            let {pseudo, email, pwd} = req.body // add all the fields needed
            const {Token, id} = await this.authenticationService.register(pseudo, email, pwd)
            RequestSuccess.generateSuccess(res, SuccessType.CREATED, {Token, id});
        } catch (error: any) {
            error.code === 1100 ? ErrorHandler.generateError(res, ErrorType.CONFLICT, error.message) :
                ErrorHandler.generateError(res, ErrorType.CUSTOM, error.message)
        }
    }

    async login(req: Request, res: Response): Promise<any> {
        try {
            let {email, pwd} = req.body
            const result = await this.authenticationService.login(email, pwd)
            RequestSuccess.generateSuccess(res, SuccessType.CREATED, result);
        } catch (error: any) {
            ErrorHandler.generateError(res, ErrorType.CUSTOM, error.message)
        }
    }

    async deleteAccount(req: Request, res: Response): Promise<any> {
        try {
            const { user } = req.body;
            const result = await this.authenticationService.deleteAccount(user)
            RequestSuccess.generateSuccess(res, SuccessType.SUCCESS, result);
        } catch (error: any) {
            ErrorHandler.generateError(res, ErrorType.CUSTOM, error.message)
        }
    }
}





