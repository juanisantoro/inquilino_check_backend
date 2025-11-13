import { pool } from "./config/db.js";

const schemaSql = `
CREATE TABLE IF NOT EXISTS inmobiliarias (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(120) NOT NULL,
  cuit VARCHAR(20),
  direccion TEXT,
  telefono VARCHAR(40),
  email VARCHAR(120),
  fecha_alta TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS usuarios (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  email VARCHAR(120) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  id_inmobiliaria INTEGER REFERENCES inmobiliarias(id) ON DELETE CASCADE,
  rol VARCHAR(20) DEFAULT 'admin',
  fecha_alta TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS inquilinos (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(100),
  dni VARCHAR(15) UNIQUE,
  telefono VARCHAR(30),
  email VARCHAR(100),
  direccion_actual TEXT,
  id_inmobiliaria INTEGER REFERENCES inmobiliarias(id) ON DELETE SET NULL,
  fecha_alta TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS evaluaciones (
  id SERIAL PRIMARY KEY,
  id_inquilino INTEGER REFERENCES inquilinos(id) ON DELETE CASCADE,
  id_inmobiliaria INTEGER REFERENCES inmobiliarias(id) ON DELETE SET NULL,
  puntaje SMALLINT CHECK (puntaje BETWEEN 1 AND 5),
  comentario TEXT,
  fecha TIMESTAMP DEFAULT now()
);
`;

(async () => {
  try {
    await pool.query(schemaSql);
    console.log("✅ Migraciones ejecutadas");
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
})();
