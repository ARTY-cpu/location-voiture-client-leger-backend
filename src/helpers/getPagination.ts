import {Request} from "express";
import { PaginationInterface } from "../models/pagination.model";

export function getPagination(req: Request): PaginationInterface{
    let {page, itemPerPage} = req.query;
    let pageNumber = page ? parseInt(page.toString()) : 1;
    let itemsPerPageNumber = itemPerPage ? parseInt(itemPerPage.toString()) : 10;
    return {page:pageNumber, itemsPerPage:itemsPerPageNumber};
}