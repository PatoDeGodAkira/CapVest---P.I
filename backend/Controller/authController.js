const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const userModel = require("../Models/userModel");

exports.register = (req, res) => {
    const {
        name,
        username,
        email,
        password
    } = req.body;

    if (!name || !username || !email || !password) {
        return res.status(400).json({
            error: "Preencha todos os campos obrigatórios."
        });
    }

    if (password.length < 6) {
        return res.status(400).json({
            error: "A senha deve ter pelo menos 6 caracteres."
        });
    }

    userModel.findByEmail(email, (error, users) => {
        if (error) {
            console.error("Erro ao verificar usuário:", error);

            return res.status(500).json({
                error: "Erro interno do servidor."
            });
        }

        if (users.length > 0) {
            return res.status(409).json({
                error: "Este e-mail já está cadastrado."
            });
        }

        const passwordHash = bcrypt.hashSync(password, 10);

        userModel.create(
            name,
            username,
            email,
            passwordHash,
            (error, result) => {
                if (error) {
                    console.error("Erro ao cadastrar usuário:", error);

                    if (error.code === "ER_DUP_ENTRY") {
                        return res.status(409).json({
                            error: "Nome de usuário ou e-mail já cadastrado."
                        });
                    }

                    return res.status(500).json({
                        error: "Erro ao cadastrar usuário."
                    });
                }

                return res.status(201).json({
                    message: "Usuário cadastrado com sucesso!",
                    userId: result.insertId
                });
            }
        );
    });
};

exports.login = (req, res) => {
    const {
        email,
        password
    } = req.body;

    if (!email || !password) {
        return res.status(400).json({
            error: "E-mail e senha são obrigatórios."
        });
    }

    userModel.findByEmail(email, (error, users) => {
        if (error) {
            console.error("Erro ao buscar usuário:", error);

            return res.status(500).json({
                error: "Erro interno do servidor."
            });
        }

        if (users.length === 0) {
            return res.status(401).json({
                error: "E-mail ou senha incorretos."
            });
        }

        const user = users[0];

        const passwordCorrect = bcrypt.compareSync(
            password,
            user.password_hash
        );

        if (!passwordCorrect) {
            return res.status(401).json({
                error: "E-mail ou senha incorretos."
            });
        }

        const token = jwt.sign(
            {
                id: user.id,
                email: user.email
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "7d"
            }
        );

        return res.status(200).json({
            message: "Login realizado com sucesso!",
            token,
            user: {
                id: user.id,
                name: user.name,
                username: user.username,
                email: user.email,
                avatar_url: user.avatar_url,
                bio: user.bio,
                city: user.city,
                school: user.school,
                education_level: user.education_level
            }
        });
    });
};