import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { crearEvaluacion, listarEvaluaciones } from "../controllers/evaluacionesController.js";

const router = Router();
router.use(requireAuth);

router.post("/", crearEvaluacion);
router.get("/:inquilinoId", listarEvaluaciones);

export default router;
