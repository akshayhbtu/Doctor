
import express from 'express'
import { approveDoctor, getDashboardStats, rejectDoctor } from '../controllers/adminController.js';
import { authorize, protect } from '../middleware/auth.js';

const router= express.Router();


router.patch('/approve-doctor/:id', protect, authorize('admin'), approveDoctor);

router.patch('/reject-doctor/:id', protect, authorize('admin'), rejectDoctor);

router.get("/dashboard-stats", protect, authorize("admin"),getDashboardStats)

export default router;