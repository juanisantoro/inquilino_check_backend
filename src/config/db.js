import pkg from "pg";
const { Pool } = pkg;
import dotenv from "dotenv";
dotenv.config();

export const pool = new Pool({
  host: process.env.PGHOST || "localhost",
  user: process.env.PGUSER || "postgres",
  password: process.env.PGPASSWORD || "postgres",
  database: process.env.PGDATABASE || "inquilino_check",
  port: process.env.PGPORT ? Number(process.env.PGPORT) : 5432,
  ssl: process.env.PGSSL === "true" ? { rejectUnauthorized: false } : false
});
