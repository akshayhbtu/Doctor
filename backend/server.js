import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";

import connectDb from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import authDoctor from "./routes/doctorRoutes.js";
import authAdmin from './routes/adminRoutes.js';
import authAppointment from './routes/appointmentRoute.js';
import chatRoutes from './routes/chatRoutes.js';

import './config/cloudinary.js';

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    credentials: true
  }
});

app.use(cookieParser());
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

connectDb();

// Make io accessible to routes
app.set("io", io);

// Socket.io connection handling
io.on("connection", (socket) => {
  console.log(" New client connected:", socket.id);

  // Join a room (appointment chat)
  socket.on("join-chat", (appointmentId) => {
    socket.join(`chat_${appointmentId}`);
    console.log(` Client joined chat_${appointmentId}`);
  });

  // Leave a room
  socket.on("leave-chat", (appointmentId) => {
    socket.leave(`chat_${appointmentId}`);
    console.log(` Client left chat_${appointmentId}`);
  });

  // Send message
  socket.on("send-message", async (data) => {
    console.log(" Message received:", data);
    // Emit to everyone in the room including sender
    io.to(`chat_${data.appointmentId}`).emit("new-message", data);
  });

  // Typing indicator
  socket.on("typing", (data) => {
    socket.to(`chat_${data.appointmentId}`).emit("user-typing", {
      userId: data.userId,
      name: data.name
    });
  });

  // Stop typing
  socket.on("stop-typing", (data) => {
    socket.to(`chat_${data.appointmentId}`).emit("user-stop-typing", {
      userId: data.userId
    });
  });

  socket.on("disconnect", () => {
    console.log("🔌 Client disconnected:", socket.id);
  });
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/doctors", authDoctor);
app.use("/api/admin", authAdmin);
app.use("/api/appointment", authAppointment);
app.use("/api/chat", chatRoutes);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(` Server is running on port ${PORT}`);
});