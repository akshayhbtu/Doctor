import dotenv from "dotenv";
dotenv.config();

import express from "express";

import cors from "cors";
import connectDb from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import authDoctor from "./routes/doctorRoutes.js";
import authAdmin from './routes/adminRoutes.js';

import './config/cloudinary.js';

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

connectDb();

app.use("/api/auth", authRoutes);
app.use("/api/doctors", authDoctor);
app.use("/api/admin", authAdmin);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
