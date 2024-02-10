import { UserInterface } from './../models/users/user.models';
import * as bcrypt from "bcryptjs";
import * as jwt from "jsonwebtoken";
import {UserRolesEnum} from "../enum/role.enum"
import { createUser, getOneUserByEmail, updateUser } from "./users.service";

const dotenv = require("dotenv");
dotenv.config();

export class AuthenticationService {


    public async doHash(password: string): Promise<[string, string]> {
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(password, salt);
        if (hash) {
            return [salt, hash];
        }
        throw new Error("Error while password generation");
    };

// Method to check the entered password is correct or not
    private async validPassword(userHash: string, password: string): Promise<boolean> {
        return await bcrypt.compare(password, userHash);
    };

    // Generate JWT token
    public generateJwtToken(id: number, role: UserRolesEnum) {
        try {
            const secret: string = process.env.SECRET! ?? 'itsasecret';
            return jwt.sign({id, role}, secret, {expiresIn: "2 week"})
        } catch (e) {
            throw new Error("Unable to jwt sign in")
        }
    }

    async login(email:string, password:string): Promise<any> {
        // Get user from db
        const user = await getOneUserByEmail(email);
        if (!user) throw new Error(`No user ${email} with found`);
        if(user.deactivate) return "User locked, please contact an administrator or check your email to unlock your account";
        if (await this.validPassword(user.pwd, password)) {
            return {
                Token: this.generateJwtToken(user?.id??0, user.role),
                id: user.id,
            }
        } else {
            throw new Error("Wrong password");
        }
    }

    async register(pseudo:string, email:string, pwd:string): Promise<any> {
        // Check if username does not exist
        const user = await getOneUserByEmail(email);
        if (user?.email) throw new Error("Email already taken");

        // Hash password
        const [, hash] = await this.doHash(pwd);

        // Add User
        const newUser:UserInterface = {
            email,
            pwd:hash,
            role: UserRolesEnum.USER,
            firstname: pseudo,
            lastname: "",
            address: "",
            code_postal: "",
            town: "",
            phone: "",
            deactivate: false,
        };
        await createUser(newUser)
        const createdUser = await getOneUserByEmail(email);
        if (!createdUser?.email) throw new Error("Unable to create user account");
        // Generate JWT
        const Token = this.generateJwtToken(createdUser?.id??0, createdUser.role)

        // Return access_token and user id
        return {
            id: createdUser.id,
            Token,
        }
    };
}