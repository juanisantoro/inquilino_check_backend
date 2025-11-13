import { Router } from "express";
import {
    listarUsuarios,
    crearUsuario,
    editarUsuario,
    cambiarPassword,
    asignarInmobiliariaAUsuario,
    toggleUsuario,
    crearUsuarioDemo
} from "../controllers/usuariosController.js";

const router = Router();

// 🔹 Listar usuarios
router.get("/", listarUsuarios);

// 🔹 Crear usuario
router.post("/", crearUsuario);

// 🔹 Editar usuario
router.put("/:id", editarUsuario);

// 🔹 Cambiar password de usuario
router.put("/:id/password", cambiarPassword);

// 🔹 Activar / suspender usuario
router.patch("/:id/toggle", toggleUsuario);

// 🔹 Asignar inmobiliaria a un usuario
router.patch("/asignar-inmobiliaria", asignarInmobiliariaAUsuario);

// 🔹 Crear usuario demo (opcional)
router.get("/demo", crearUsuarioDemo);

export default router;