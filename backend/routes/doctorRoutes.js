import express from "express";
import { addAvailability, getDoctorProfile, getDoctors, registerDoctor, updateDoctorProfile } from "../controllers/doctorController.js";
import { authorize, protect } from "../middleware/auth.js";
import upload from "../middleware/upload.js";

const router = express.Router();

router.post("/register", protect, authorize('user'), upload.single('profileImage'),  registerDoctor);
router.get("/all-doctor", getDoctors);
router.post("/availability", protect, authorize('doctor'), addAvailability);
router.get('/doctor/:id',getDoctorProfile)

router.put('/update-profile', protect, authorize('doctor'), upload.single('profileImage'), updateDoctorProfile);


export default router;
