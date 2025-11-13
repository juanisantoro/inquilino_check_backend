// controllers/usuariosController.js
import bcrypt from "bcryptjs";
import {pool} from "../config/db.js"; // asegurate que sea export default

export const crearUsuarioDemo = async (req, res) => {
    try {
        const passwordPlano = "123456";
        const hash = await bcrypt.hash(passwordPlano, 10);

        await pool.query(
            `
      INSERT INTO usuarios (nombre, email, password_hash, id_inmobiliaria, rol, activo)
      VALUES ($1, $2, $3, $4, $5, $6)
      `,
            [
                "Usuario Demo",
                "demo@inquilinocheck.com",
                hash,
                1,        // id inmobiliaria
                "user",   // rol NO admin
                true
            ]
        );

        return res.json({
            msg: "Usuario demo creado correctamente",
            email: "demo@inquilinocheck.com",
            password: passwordPlano,
            hash_generado: hash
        });
    } catch (err) {
        console.error("Error creando usuario demo:", err);
        return res.status(500).json({ error: "Error al crear usuario demo" });
    }
};

export const listarUsuarios = async (req, res) => {
    try {
        const { rows } = await pool.query(`
      SELECT u.id, u.nombre, u.email, u.rol, u.activo,
             u.id_inmobiliaria,
             i.nombre AS inmobiliaria_nombre
      FROM usuarios u
      LEFT JOIN inmobiliarias i ON u.id_inmobiliaria = i.id
      ORDER BY u.id DESC
    `);

        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error listando usuarios" });
    }
};


export const crearUsuario = async (req, res) => {
    try {
        const { nombre, email, password, rol, id_inmobiliaria } = req.body;

        if (!nombre || !email || !password || !rol || !id_inmobiliaria) {
            return res.status(400).json({ error: "Faltan datos" });
        }

        const hash = await bcrypt.hash(password, 10);

        const { rows } = await pool.query(
            `
      INSERT INTO usuarios (nombre, email, password_hash, id_inmobiliaria, rol, activo)
      VALUES ($1, $2, $3, $4, $5, true)
      RETURNING id, nombre, email, rol, id_inmobiliaria
      `,
            [nombre, email, hash, id_inmobiliaria, rol]
        );

        res.json({
            msg: "Usuario creado correctamente",
            usuario: rows[0],
        });

    } catch (err) {
        console.error(err);

        if (err.code === "23505") {
            return res.status(400).json({ error: "El email ya existe" });
        }

        res.status(500).json({ error: "Error creando usuario" });
    }
};


export const cambiarPassword = async (req, res) => {
    try {
        const { id } = req.params;
        const { password } = req.body;

        const hash = await bcrypt.hash(password, 10);

        await pool.query(
            `UPDATE usuarios SET password_hash = $1 WHERE id = $2`,
            [hash, id]
        );

        res.json({ msg: "Contraseña actualizada" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error cambiando contraseña" });
    }
};



export const asignarInmobiliariaAUsuario = async (req, res) => {
    try {
        const { usuarioId, inmobiliariaId } = req.body;

        if (!usuarioId || !inmobiliariaId) {
            return res.status(400).json({ error: "Faltan datos" });
        }

        const query = `
      UPDATE usuarios
      SET id_inmobiliaria = $1
      WHERE id = $2
      RETURNING id, nombre, email, id_inmobiliaria, rol
    `;

        const { rows } = await pool.query(query, [inmobiliariaId, usuarioId]);

        if (rows.length === 0) {
            return res.status(404).json({ error: "Usuario no encontrado" });
        }

        res.json({
            msg: "Inmobiliaria asignada correctamente",
            usuario: rows[0]
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error asignando inmobiliaria" });
    }
};


export const editarUsuario = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, email, rol, id_inmobiliaria } = req.body;

        if (!nombre || !email || !rol || !id_inmobiliaria) {
            return res.status(400).json({ error: "Faltan datos obligatorios" });
        }

        // Verificar si existe la inmobiliaria
        const checkInmo = await pool.query(
            "SELECT id FROM inmobiliarias WHERE id = $1",
            [id_inmobiliaria]
        );
        if (checkInmo.rows.length === 0) {
            return res.status(400).json({ error: "La inmobiliaria seleccionada no existe" });
        }

        // Validar email duplicado
        const checkEmail = await pool.query(
            "SELECT id FROM usuarios WHERE email = $1 AND id <> $2",
            [email, id]
        );
        if (checkEmail.rows.length > 0) {
            return res.status(400).json({ error: "El email ya está en uso por otro usuario" });
        }

        // Actualizar usuario
        const result = await pool.query(
            `
            UPDATE usuarios
            SET nombre = $1,
                email = $2,
                rol = $3,
                id_inmobiliaria = $4
            WHERE id = $5
            RETURNING id, nombre, email, rol, id_inmobiliaria, activo
            `,
            [nombre, email, rol, id_inmobiliaria, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Usuario no encontrado" });
        }

        res.json({
            msg: "Usuario actualizado correctamente",
            usuario: result.rows[0]
        });

    } catch (err) {
        console.error("Error actualizando usuario:", err);
        res.status(500).json({ error: "Error actualizando usuario" });
    }
};


export const toggleUsuario = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            `
            UPDATE usuarios
            SET activo = NOT activo
            WHERE id = $1
            RETURNING id, nombre, email, rol, id_inmobiliaria, activo
            `,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Usuario no encontrado" });
        }

        res.json({
            msg: `Usuario ${result.rows[0].activo ? "activado" : "suspendido"} correctamente`,
            usuario: result.rows[0]
        });

    } catch (err) {
        console.error("Error suspendiendo usuario:", err);
        res.status(500).json({ error: "Error interno" });
    }
};