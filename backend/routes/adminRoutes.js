
import express from 'express'
import { approveDoctor } from '../controllers/adminController.js';
import { authorize, protect } from '../middleware/auth.js';

const router= express.Router();


router.patch('/approve-doctor/:id', protect, authorize('admin'), approveDoctor)

export default router;