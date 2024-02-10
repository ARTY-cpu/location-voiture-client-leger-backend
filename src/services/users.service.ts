import { CRUDUsersIquery } from '../iquery/CRUD/users.iqeury';
import { UserInterface } from '../models/users/user.models';
const db = require('../config/connection/sqlLite.connector');

export async function getOneUser(id: string): Promise<UserInterface | null> {
    return db.get(CRUDUsersIquery.Read.One, [id])
}

export async function getOneUserByEmail(email: string): Promise<UserInterface | null> {
    return db.get(CRUDUsersIquery.Read.OneByEmail, [email])
}

export async function createUser(user: UserInterface): Promise<number> {
    return db.run(CRUDUsersIquery.Create.One, [user.role, user.firstname, user.lastname, user.address, user.code_postal, user.town, user.phone, user.pwd, user.email, user.deactivate])
}

export async function updateUser(user: UserInterface): Promise<number> {
    return db.run(CRUDUsersIquery.Update.OneByEmail, [user.role, user.firstname, user.lastname, user.address, user.code_postal, user.town, user.phone, user.pwd, user.email, user.deactivate, user.id, user.email])
}

export async function deleteUser(id: string): Promise<number> {
    return db.run(CRUDUsersIquery.Delete.One, [id])
}