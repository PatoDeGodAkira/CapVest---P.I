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