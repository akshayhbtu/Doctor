import Doctor from "../models/Doctor.js";
import User from "../models/User.js";
// import Doctor from "../models/Doctor.js";
import Appointment from "../models/Appointment.js";

import mongoose from "mongoose";



// Pending
export const getPendingDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find({ status: "pending" })
      .populate("userId", "name email phoneNumber")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: doctors,
    });
  } catch (error) {
    console.error("Get Pending Doctors Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch pending doctors",
    });
  }
};

// Approved
export const getApprovedDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find({ status: "approved" })
      .populate("userId", "name email phoneNumber")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: doctors,
    });
  } catch (error) {
    console.error("Get Approved Doctors Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch approved doctors",
    });
  }
};

// Rejected
export const getRejectedDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find({ status: "rejected" })
      .populate("userId", "name email phoneNumber")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: doctors,
    });
  } catch (error) {
    console.error("Get Rejected Doctors Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch rejected doctors",
    });
  }
};

// ================= APPROVE =================

export const approveDoctor = async (req, res) => {
  try {
    const { id } = req.params;

    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid doctor ID",
      });
    }

    const doctor = await Doctor.findById(id);

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }

    if (doctor.status === "approved") {
      return res.status(400).json({
        success: false,
        message: "Doctor already approved",
      });
    }

    
    doctor.status = "approved";
    doctor.rejectionReason = ""; 

    await doctor.save();

    await User.findByIdAndUpdate(doctor.userId, {
      role: "doctor",
    });

    res.status(200).json({
      success: true,
      message: "Doctor approved successfully",
      doctor,
    });
  } catch (error) {
    console.error("Approve Doctor Error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};



export const rejectDoctor = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid doctor ID",
      });
    }

    const doctor = await Doctor.findById(id);

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }

    if (doctor.status === "rejected") {
      return res.status(400).json({
        success: false,
        message: "Doctor already rejected",
      });
    }

    if (doctor.status === "approved") {
      return res.status(400).json({
        success: false,
        message: "Approved doctor cannot be rejected",
      });
    }

    
    doctor.status = "rejected";
    doctor.rejectionReason = reason || "Not specified";

    await doctor.save();

    
    await User.findByIdAndUpdate(doctor.userId, {
      role: "user",
    });

    res.status(200).json({
      success: true,
      message: "Doctor rejected successfully",
      doctor,
    });
  } catch (error) {
    console.error("Reject Doctor Error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};



//  DASHBOARD 

export const getDashboardStats = async (req, res) => {
  try {
    const [
      totalUsers,
      totalDoctors,
      totalAppointments,
      pendingApprovals,
    ] = await Promise.all([
      User.countDocuments({ role: "user" }),
      User.countDocuments({ role: "doctor" }),
      Appointment.countDocuments(),
      Doctor.countDocuments({ status: "pending" }), 
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalDoctors,
        totalAppointments,
        pendingApprovals,
      },
    });
  } catch (error) {
    console.error("Dashboard Stats Error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};