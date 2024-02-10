import { UserRolesEnum } from "../../enum/role.enum";

export interface UserInterface {
    id?: number;
    role: UserRolesEnum
    firstname: string;
    lastname: string;
    address: string;
    code_postal: string;
    town: string;
    phone: string;
    pwd: string;
    email: string;
    deactivate: boolean;
}