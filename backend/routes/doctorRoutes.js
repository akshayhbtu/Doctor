import express from "express";
import { getDoctors, registerDoctor } from "../controllers/doctorController.js";
import { authorize, protect } from "../middleware/auth.js";
import upload from "../middleware/upload.js";

const router = express.Router();

router.post("/register", protect, authorize('user'), upload.single('profileImage'),  registerDoctor);
router.get("/", getDoctors);

export default router;
