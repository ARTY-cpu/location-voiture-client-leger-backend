import {Response} from "express";
import { isEmpty } from "./IsEmpty";
const version = require('../../package.json').version;


export enum SuccessType {
    SUCCESS,
    CREATED,
    UPDATED,
    NOCONTENT
}


export class RequestSuccess {
    private static getStatusCodeForSuccessType(type?: SuccessType) {
        switch (type) {
            case SuccessType.SUCCESS:
            case SuccessType.UPDATED:
                return 200
            case SuccessType.CREATED:
                return 201;
            case SuccessType.NOCONTENT:
                return 204;
            default:
                return 200;
        }
    }

    private static returnMessage(type?: SuccessType) {
        switch (type) {
            case SuccessType.SUCCESS:
                return "success";
            case SuccessType.CREATED:
                return "created";
            case SuccessType.UPDATED:
                return "updated";
            case SuccessType.NOCONTENT:
                return "no content";
            default:
                return "success";
        }
    }

    public static generateSuccess(res: Response, successType: SuccessType, customMessage?: any) {
        if(!isEmpty(customMessage)){
            res.status(this.getStatusCodeForSuccessType(successType)).json({
                message: customMessage ?? this.returnMessage(successType),
                date: new Date(),
                version
            })
        }else{
            res.status(204).json({
                message: "no content",
                date: new Date(),
                version
            })
        }
    }
}