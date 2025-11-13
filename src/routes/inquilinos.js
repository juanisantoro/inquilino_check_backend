import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import {
  crearInquilino, listarInquilinos, buscarPorDni, actualizarInquilino, borrarInquilino
} from "../controllers/inquilinosController.js";

const router = Router();
router.use(requireAuth);

router.post("/", crearInquilino);
router.get("/", listarInquilinos);
router.get("/dni/:dni", buscarPorDni);
router.put("/:id", actualizarInquilino);
router.delete("/:id", borrarInquilino);

export default router;
