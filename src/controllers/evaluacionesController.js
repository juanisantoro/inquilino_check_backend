import { pool } from "../config/db.js";

export const crearEvaluacion = async (req, res) => {
  try {
    const { id_inquilino, puntaje, comentario } = req.body;
    const id_inmobiliaria = req.user.inmobiliariaId;
    const q = await pool.query(
      `INSERT INTO evaluaciones (id_inquilino, id_inmobiliaria, puntaje, comentario)
       VALUES ($1,$2,$3,$4) RETURNING *`,
      [id_inquilino, id_inmobiliaria, puntaje, comentario]
    );
    res.json(q.rows[0]);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Error al crear evaluación" });
  }
};

export const listarEvaluaciones = async (req, res) => {
  try {
    const { inquilinoId } = req.params;
    const q = await pool.query(
      `SELECT e.*, inm.nombre as inmobiliaria
       FROM evaluaciones e
       JOIN inmobiliarias inm ON e.id_inmobiliaria = inm.id
       WHERE e.id_inquilino=$1
       ORDER BY e.fecha DESC`,
      [inquilinoId]
    );
    res.json(q.rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Error al listar" });
  }
};
