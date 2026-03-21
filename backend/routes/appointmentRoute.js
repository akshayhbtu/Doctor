
import express from 'express'
import { authorize, protect } from '../middleware/auth.js';
import { bookAppointment, getDocotorAppointments, getUserAppointmentHistory, getUserAppointments, getUserUpcomingAppointments, updateAppointmentStatus } from '../controllers/appointmentController.js';

const router= express.Router();

router.post("/book", protect, authorize("user"), bookAppointment)

router.put("/:id/status", protect, authorize("doctor"), updateAppointmentStatus);

router.get("/user", protect, authorize("user"),getUserAppointments);
router.get("/user/history", protect,authorize("user"), getUserAppointmentHistory);
router.get("/user/upcoming", protect, authorize('user'), getUserUpcomingAppointments);

router.get("/doctor", protect, authorize("doctor"), getDocotorAppointments);




export default router;