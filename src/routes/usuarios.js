import { Router } from "express";
import {
    listarUsuarios,
    crearUsuario,
    editarUsuario,
    cambiarPassword,
} from "../controllers/usuariosController.js";

const router = Router();

router.get("/", listarUsuarios);
router.post("/", crearUsuario);
router.put("/:id", editarUsuario);
router.put("/:id/password", cambiarPassword);

export default router;
