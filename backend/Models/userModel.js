const db = require("../DB/database");

const userModel = {
    findByEmail: (email, callback) => {
        const sql = `
            SELECT *
            FROM users
            WHERE email = ?
            LIMIT 1
        `;

        db.query(sql, [email], callback);
    },

    create: (name, username, email, passwordHash, callback) => {
        const now = new Date();

        const sql = `
            INSERT INTO users
            (
                name,
                username,
                email,
                password_hash,
                created_at,
                updated_at
            )
            VALUES (?, ?, ?, ?, ?, ?)
        `;

        db.query(
            sql,
            [name, username, email, passwordHash, now, now],
            callback
        );
    },

    updateProfile: (id, fields, callback) => {
        const allowed = ["avatar_url", "bio", "city", "school", "education_level"];
        const keys = Object.keys(fields).filter((key) => allowed.includes(key));
        if (!keys.length) return callback(null, { affectedRows: 0 });
        const assignments = keys.map((key) => `${key} = ?`).join(", ");
        const values = keys.map((key) => fields[key]);
        values.push(new Date(), id);
        db.query(`UPDATE users SET ${assignments}, updated_at = ? WHERE id = ?`, values, callback);
    },

    findById: (id, callback) => {
        const sql = `
            SELECT
                id,
                name,
                username,
                email,
                avatar_url,
                bio,
                city,
                school,
                education_level,
                created_at,
                updated_at
            FROM users
            WHERE id = ?
            LIMIT 1
        `;

        db.query(sql, [id], callback);
    }
};

module.exports = userModel;