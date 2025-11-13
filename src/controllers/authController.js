import bcrypt from "bcryptjs";
import { pool } from "../config/db.js";
import { signJWT } from "../utils/jwt.js";

export const register = async (req, res) => {
  const client = await pool.connect();
  try {
    const { nombreInmobiliaria, cuit, direccion, telefono, email, nombreUsuario, password } = req.body;
    if (!email || !password || !nombreInmobiliaria) return res.status(400).json({ error: "Datos incompletos" });

    await client.query("BEGIN");

    const insInm = await client.query(
      `INSERT INTO inmobiliarias (nombre, cuit, direccion, telefono, email) VALUES ($1,$2,$3,$4,$5) RETURNING id`,
      [nombreInmobiliaria, cuit || null, direccion || null, telefono || null, email]
    );
    const inmobiliariaId = insInm.rows[0].id;

    const hash = await bcrypt.hash(password, 10);
    const insUsr = await client.query(
      `INSERT INTO usuarios (nombre, email, password_hash, id_inmobiliaria, rol) VALUES ($1,$2,$3,$4,$5) RETURNING id, nombre, email, id_inmobiliaria, rol`,
      [nombreUsuario || "Admin", email, hash, inmobiliariaId, "admin"]
    );

    await client.query("COMMIT");
    const token = signJWT({ userId: insUsr.rows[0].id, inmobiliariaId, rol: "admin", email });
    return res.json({ token, user: insUsr.rows[0] });
  } catch (e) {
    await client.query("ROLLBACK");
    if (e.code === "23505") return res.status(409).json({ error: "Email o DNI duplicado" });
    console.error(e);
    return res.status(500).json({ error: "Error en registro" });
  } finally {
    client.release();
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const q = await pool.query(`SELECT * FROM usuarios WHERE email=$1`, [email]);
    if (q.rowCount === 0) return res.status(401).json({ error: "Credenciales inválidas" });
    const user = q.rows[0];
    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(401).json({ error: "Credenciales inválidas" });
    const token = signJWT({ userId: user.id, inmobiliariaId: user.id_inmobiliaria, rol: user.rol, email: user.email });
    return res.json({ token, user: { id: user.id, nombre: user.nombre, email: user.email, rol: user.rol } });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Error en login" });
  }
};

export const me = async (req, res) => {
  try {
    const q = await pool.query(`SELECT id, nombre, email, rol, id_inmobiliaria FROM usuarios WHERE id=$1`, [req.user.userId]);
    if (q.rowCount === 0) return res.status(404).json({ error: "Usuario no encontrado" });
    return res.json(q.rows[0]);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Error" });
  }
};
