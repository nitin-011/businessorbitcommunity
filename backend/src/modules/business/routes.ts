import { Router } from "express";
import { apply, adminApprove } from "./controller";

const router = Router();

router.post("/apply", apply);
router.post("/admin/approve/:id", adminApprove);

export default router;
