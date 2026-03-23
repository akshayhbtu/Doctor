
import express from "express";
import { getProfile, login, logout, register } from "../controllers/authController.js";
import { protect } from "../middleware/auth.js";

const router= express.Router();


router.post("/register", register);
router.post("/login", login)
router.get("/me",protect, getProfile)
router.post("/logout",logout);




export default router;