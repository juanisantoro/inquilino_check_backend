import express from "express";
import { pool } from "../config/db.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

router.use(requireAuth);

router.get("/inmobiliarias", async (req, res) => {
    if (req.user.rol !== "admin") {
        return res.status(403).json({ error: "No autorizado" });
    }

    const result = await pool.query(`
        SELECT id, nombre, email, telefono, activo
        FROM inmobiliarias
        ORDER BY id DESC
    `);

    res.json(result.rows);
});


// ADMIN - Activar / Desactivar inmobiliaria
router.patch("/inmobiliarias/:id/toggle", async (req, res) => {
    if (req.user.rol !== "admin") {
        return res.status(403).json({ error: "No autorizado" });
    }

    const { id } = req.params;

    const result = await pool.query(`
        UPDATE inmobiliarias
        SET activo = NOT activo
        WHERE id = $1
        RETURNING id, nombre, email, telefono, activo
    `, [id]);

    res.json(result.rows[0]);
});
export default router;
