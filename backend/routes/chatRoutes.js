// backend/routes/chatRoutes.js
import express from 'express';
import { protect } from '../middleware/auth.js';
import { 
  getOrCreateChat, 
  getChatByAppointment, 
  saveMessage,
  markAsRead
} from '../controllers/chatController.js';

const router = express.Router();

// Get or create chat for an appointment
router.get('/appointment/:appointmentId', protect, getOrCreateChat);

// Get chat by appointment ID
router.get('/:appointmentId', protect, getChatByAppointment);

// Save message
router.post('/message', protect, saveMessage);

// Mark messages as read
router.put('/read', protect, markAsRead);

export default router;