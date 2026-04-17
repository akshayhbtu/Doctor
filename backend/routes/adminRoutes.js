
import express from 'express'
import { authorize, protect } from '../middleware/auth.js';

import {approveDoctor, getApprovedDoctors, getDashboardStats, getPendingDoctors, getRejectedDoctors, rejectDoctor} from '../controllers/adminController.js';


const router= express.Router();


router.get("/doctor/pending",protect, authorize("admin"), getPendingDoctors);

router.get("/doctor/approved", protect, authorize("admin"), getApprovedDoctors)

router.get("/doctor/rejected", protect, authorize("admin"), getRejectedDoctors);

router.patch("/doctor/:id/approve", protect, authorize("admin"), approveDoctor)

router.patch("/doctor/:id/reject", protect, authorize("admin"), rejectDoctor)



router.get("/dashboard-stats", protect, authorize("admin"), getDashboardStats);




export default router;