import bcrypt from "bcryptjs";
import { pool } from "./config/db.js";

(async () => {
  try {
    // Crear inmobiliaria demo
    const inm = await pool.query(
      `INSERT INTO inmobiliarias (nombre, cuit, direccion, telefono, email)
       VALUES ('Inmobiliaria Demo SRL', '30-12345678-9', 'Av. Siempre Viva 123', '011-4444-5555', 'demo@demo.com')
       ON CONFLICT (email) DO NOTHING
       RETURNING id`
    );
    const inmobiliariaId = inm.rows[0]?.id || (await pool.query(`SELECT id FROM inmobiliarias WHERE email='demo@demo.com'`)).rows[0].id;

    // Usuario demo
    const hash = await bcrypt.hash("Demo1234!", 10);
    await pool.query(
      `INSERT INTO usuarios (nombre, email, password_hash, id_inmobiliaria, rol)
       VALUES ('Admin Demo', 'demo@demo.com', $1, $2, 'admin')
       ON CONFLICT (email) DO NOTHING`,
      [hash, inmobiliariaId]
    );

    // Inquilino demo
    const inq = await pool.query(
      `INSERT INTO inquilinos (nombre, dni, telefono, email, direccion_actual, id_inmobiliaria)
       VALUES ('Juan Perez', '20123456', '11-3333-2222', 'juan.perez@example.com', 'Calle Falsa 123', $1)
       ON CONFLICT (dni) DO NOTHING
       RETURNING id`,
      [inmobiliariaId]
    );
    const inqId = inq.rows[0]?.id || (await pool.query(`SELECT id FROM inquilinos WHERE dni='20123456'`)).rows[0].id;

    // Evaluación demo
    await pool.query(
      `INSERT INTO evaluaciones (id_inquilino, id_inmobiliaria, puntaje, comentario)
       VALUES ($1, $2, 4, 'Cumple con pagos, entrega correcta.')
       ON CONFLICT DO NOTHING`,
      [inqId, inmobiliariaId]
    );

    console.log("✅ Seed demo insertado");
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
})();
