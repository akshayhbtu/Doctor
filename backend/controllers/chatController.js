// backend/controllers/chatController.js
import Chat from "../models/Chat.js";
import Appointment from "../models/Appointment.js";
import Doctor from "../models/Doctor.js";
import User from "../models/User.js";

// Get or create chat for an appointment
export const getOrCreateChat = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    
    let chat = await Chat.findOne({ appointmentId });
    
    if (!chat) {
      // Get appointment to find participants
      const appointment = await Appointment.findById(appointmentId);
      if (!appointment) {
        return res.status(404).json({
          success: false,
          message: "Appointment not found"
        });
      }
      
      // Get doctor to find user ID
      const doctor = await Doctor.findById(appointment.doctorId);
      if (!doctor) {
        return res.status(404).json({
          success: false,
          message: "Doctor not found"
        });
      }
      
      chat = await Chat.create({
        participants: [appointment.patientId, doctor.userId],
        appointmentId,
        messages: [],
        lastMessage: "",
        lastMessageTime: new Date()
      });
    }
    
    // Populate participants
    await chat.populate('participants', 'name email role profileImage');
    
    res.status(200).json({
      success: true,
      chat
    });
  } catch (error) {
    console.error("Get or Create Chat Error:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get chat by appointment ID
export const getChatByAppointment = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    
    const chat = await Chat.findOne({ appointmentId })
      .populate('participants', 'name email role profileImage');
    
    if (!chat) {
      return res.status(404).json({
        success: false,
        message: "Chat not found"
      });
    }
    
    res.status(200).json({
      success: true,
      chat
    });
  } catch (error) {
    console.error("Get Chat Error:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Save message to database
export const saveMessage = async (req, res) => {
  try {
    const { appointmentId, message, senderId, senderName, senderRole } = req.body;
    
    let chat = await Chat.findOne({ appointmentId });
    
    if (!chat) {
      chat = await Chat.create({
        participants: [],
        appointmentId,
        messages: [],
        lastMessage: "",
        lastMessageTime: new Date()
      });
    }
    
    const newMessage = {
      senderId,
      senderName,
      senderRole,
      message,
      timestamp: new Date(),
      read: false
    };
    
    chat.messages.push(newMessage);
    chat.lastMessage = message;
    chat.lastMessageTime = new Date();
    chat.updatedAt = new Date();
    
    await chat.save();
    
    res.status(200).json({
      success: true,
      message: newMessage
    });
  } catch (error) {
    console.error("Save Message Error:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Mark messages as read
export const markAsRead = async (req, res) => {
  try {
    const { appointmentId, userId } = req.body;
    
    const chat = await Chat.findOne({ appointmentId });
    if (!chat) {
      return res.status(404).json({
        success: false,
        message: "Chat not found"
      });
    }
    
    chat.messages.forEach(msg => {
      if (msg.senderId.toString() !== userId && !msg.read) {
        msg.read = true;
      }
    });
    
    await chat.save();
    
    res.status(200).json({
      success: true,
      message: "Messages marked as read"
    });
  } catch (error) {
    console.error("Mark as Read Error:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};