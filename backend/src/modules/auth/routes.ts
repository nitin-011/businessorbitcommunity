import { Router } from "express";
import { login, logout, getMe, refresh } from "./controller";
import { authMiddleware } from "../../middleware/auth";

const router = Router();

router.post("/login", login);
router.post("/logout", logout);
router.get("/me", authMiddleware, getMe);
router.post("/refresh", refresh);

export default router;
