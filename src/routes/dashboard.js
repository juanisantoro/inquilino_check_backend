import express from "express";
import { pool } from "../config/db.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

// Stats generales
router.get("/stats", requireAuth, async (req, res) => {
    try {
        const totalInquilinos = (await pool.query("SELECT COUNT(*) FROM inquilinos")).rows[0].count;
        const totalEvaluaciones = (await pool.query("SELECT COUNT(*) FROM evaluaciones")).rows[0].count;

        const prom = await pool.query("SELECT COALESCE(AVG(puntaje),0) AS promedio FROM evaluaciones");
        const promedio = prom.rows[0].promedio || 0;

        const recientes = await pool.query(`
      SELECT e.id, e.puntaje, e.fecha, i.nombre AS nombre_inquilino
      FROM evaluaciones e
      JOIN inquilinos i ON i.id = e.id_inquilino
      ORDER BY fecha DESC
      LIMIT 5
    `);

        res.json({
            totalInquilinos: Number(totalInquilinos),
            totalEvaluaciones: Number(totalEvaluaciones),
            promedioGeneral: Number(promedio),
            recientes: recientes.rows,
        });

    } catch (err) {
        console.log(err);
        res.status(500).json({ error: "Error obteniendo estadísticas" });
    }
});

export default router;
