import * as jwt from "jsonwebtoken";
import {NextFunction, Request, Response} from "express";
import {ErrorHandler, ErrorType} from "../helpers/ErrorHandler";
import { UserRolesEnum } from "../enum/role.enum";
import { getOneUser } from "../services/users.service";

// Extract bearer token
export const extractBearerToken = (headerValue: any) => {
    if (typeof headerValue !== "string") {
        return false
    }

    const matches = RegExp(/(bearer)\s+(\S+)/i).exec(headerValue)
    return matches && matches[2]
}

// Check token middleware
export const authenticationMiddleware = (requiredLevel:UserRolesEnum = UserRolesEnum.USER, byPass:boolean=false) => {
    return (req : Request, res : Response, next: NextFunction) => {
        // fetch token
        let token = req.headers.authorization && extractBearerToken(req.headers.authorization)
        if(!token) token = req.query.t && extractBearerToken("Bearer " + req.query.t as string)
        if (!token) {
            if(requiredLevel == UserRolesEnum.NOTLOG){
                req.body.role = UserRolesEnum.NOTLOG
                return next()
            }
            res.statusCode = ErrorHandler.getStatusCodeForErrorType(ErrorType.INVALID_ARGUMENT);
            res.json({message: "No token was provided"});
        }
        if (typeof token === "string") {
            // Verify token
            jwt.verify(token, process.env.SECRET!, async (err, decodedToken) => {
                if (err) {
                    if(requiredLevel == UserRolesEnum.NOTLOG){
                        req.body.role = UserRolesEnum.NOTLOG
                        return next()
                    }
                    UNAUTHORIZED(res, err.message)
                    return;
                }
                let user = await getOneUser((<any>decodedToken).id)
                if(!user){
                    UNAUTHORIZED(res, "User not found");
                    return;
                }
                //if(!user.confirm){
                //    if(requiredLevel == UserRolesEnum.NOTLOG){
                //        req.body.role = UserRolesEnum.NOTLOG
                //        return next()
                //    }
                //    UNAUTHORIZED(res, "User not confirmed, please check your email")
                //}
                //if(user.locked){
                //    if(requiredLevel == UserRolesEnum.NOTLOG){
                //        req.body.role = UserRolesEnum.NOTLOG
                //        return next()
                //    }
                //    UNAUTHORIZED(res, "User locked, please contact an administrator or check your email to unlock your account")
                //}
                if((<any>decodedToken).role < requiredLevel){
                    UNAUTHORIZED(res, "your pass is not powerful enough")
                    return;
                }
                req.body.role = (<any>decodedToken).role
                if(!byPass){
                    req.body.id = (req.body.role == UserRolesEnum.ADMINISTRATOR)?req.headers.usermodification??(<any>decodedToken).id:(<any>decodedToken).id
                }else{
                    req.body.id = (req.body.role >= UserRolesEnum.MODERATOR)?req.headers.usermodification??(<any>decodedToken).id:(<any>decodedToken).id
                }
                req.body.modificatorId = (<any>decodedToken).id
                req.body.user = user
                return next();
            })
        } else {
            res.statusCode = ErrorHandler.getStatusCodeForErrorType(ErrorType.INVALID_ARGUMENT);
            res.json({message: "The token format is not supported"});
            return;
        }
    }
}

function UNAUTHORIZED(res: Response, message: string) {
    res.statusCode = ErrorHandler.getStatusCodeForErrorType(ErrorType.UNAUTHORIZED);
    res.json({message});
}