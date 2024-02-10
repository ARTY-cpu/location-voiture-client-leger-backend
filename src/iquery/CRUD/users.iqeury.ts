export const CRUDUsersIquery = {
    Create: {
        One: `INSERT INTO users (firstname, lastname, address, code_postal, town, phone, pwd) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    },
    Read: {
        All: `SELECT * FROM users LIMIT ? OFFSET ?`,
        One: `SELECT * FROM users WHERE id = ?`,
        OneByEmail: `SELECT * FROM users WHERE email = ?`,
        Search: `SELECT * FROM users WHERE firstname LIKE ? OR lastname LIKE ? OR email LIKE ? LIMIT ? OFFSET ?`,
    },
    Update: {
        One: `UPDATE users SET firstname = COALESCE(?, firstname), lastname = COALESCE(?, lastname), address = COALESCE(?, address), code_postal = COALESCE(?, code_postal), town = COALESCE(?, town), phone = COALESCE(?, phone), pwd = COALESCE(?, pwd) WHERE id = ?`,
        OneByEmail: `UPDATE users SET firstname = COALESCE(?, firstname), lastname = COALESCE(?, lastname), address = COALESCE(?, address), code_postal = COALESCE(?, code_postal), town = COALESCE(?, town), phone = COALESCE(?, phone), pwd = COALESCE(?, pwd) WHERE email = ?`,
    },
    Delete: {
        One: `DELETE FROM users WHERE id = ?`,
        OneByEmail: `DELETE FROM users WHERE email = ?`,
    },
}