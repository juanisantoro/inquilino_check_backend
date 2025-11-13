import express from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();

import { pool } from "./config/db.js";
import authRoutes from "./routes/auth.js";
import inquilinosRoutes from "./routes/inquilinos.js";
import evaluacionesRoutes from "./routes/evaluaciones.js";
import adminRoutes from "./routes/admin.js";
const app = express();


const allowed = process.env.FRONTEND_URL ? [process.env.FRONTEND_URL] : ["http://localhost:3000"];
app.use(cors({ origin: allowed, credentials: true }));
app.use(express.json());

app.use(cors({
    origin: "*",
    methods: "GET,POST,PUT,PATCH,DELETE",
    allowedHeaders: "Content-Type, Authorization",
}));

app.get("/", (req, res) => res.json({ ok: true, name: "inquilino-check-api" }));

app.use("/auth", authRoutes);
app.use("/inquilinos", inquilinosRoutes);
app.use("/evaluaciones", evaluacionesRoutes);
app.use("/admin", adminRoutes);

const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`✅ Backend corriendo en puerto ${port}`));


