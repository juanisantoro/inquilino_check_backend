import { pool } from "../config/db.js";

export const crearInquilino = async (req, res) => {
  try {
    const { nombre, dni, telefono, email, direccion_actual } = req.body;
    const id_inmobiliaria = req.user.inmobiliariaId;
    const q = await pool.query(
      `INSERT INTO inquilinos (nombre, dni, telefono, email, direccion_actual, id_inmobiliaria)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [nombre, dni, telefono, email, direccion_actual, id_inmobiliaria]
    );
    res.json(q.rows[0]);
  } catch (e) {
    if (e.code === "23505") return res.status(409).json({ error: "DNI ya existe" });
    console.error(e);
    res.status(500).json({ error: "Error al crear inquilino" });
  }
};

export const listarInquilinos = async (req, res) => {
  try {
    const id_inmobiliaria = req.user.inmobiliariaId;
    const q = await pool.query(
      `SELECT * FROM inquilinos WHERE id_inmobiliaria=$1 ORDER BY fecha_alta DESC`,
      [id_inmobiliaria]
    );
    res.json(q.rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Error al listar" });
  }
};

export const buscarPorDni = async (req, res) => {
  try {
    const { dni } = req.params;
    const q = await pool.query(
      `SELECT i.*, COALESCE(ROUND(AVG(e.puntaje)::numeric,1), 0) as reputacion
       FROM inquilinos i
       LEFT JOIN evaluaciones e ON e.id_inquilino = i.id
       WHERE i.dni = $1
       GROUP BY i.id
       ORDER BY i.fecha_alta DESC`,
      [dni]
    );
    res.json(q.rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Error en búsqueda" });
  }
};

export const actualizarInquilino = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, telefono, email, direccion_actual } = req.body;
    const q = await pool.query(
      `UPDATE inquilinos SET nombre=$1, telefono=$2, email=$3, direccion_actual=$4 WHERE id=$5 RETURNING *`,
      [nombre, telefono, email, direccion_actual, id]
    );
    res.json(q.rows[0]);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Error al actualizar" });
  }
};

export const borrarInquilino = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query(`DELETE FROM evaluaciones WHERE id_inquilino=$1`, [id]);
    await pool.query(`DELETE FROM inquilinos WHERE id=$1`, [id]);
    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Error al eliminar" });
  }
};
