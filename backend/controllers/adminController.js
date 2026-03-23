import Doctor from "../models/Doctor.js";
import User from "../models/User.js";
// import Doctor from "../models/Doctor.js";
import Appointment from "../models/Appointment.js";



export const approveDoctor = async (req, res) => {
  try {
    const { id } = req.params;

    
    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Doctor ID is required",
      });
    }

    
    const doctor = await Doctor.findById(id);

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }

    //  Check already approved
    if (doctor.status === "approved") {
      return res.status(400).json({
        success: false,
        message: "Doctor already approved",
      });
    }

    //  Update status
    doctor.status = "approved";
    //doctor.rejectionReason = undefined; // clear if previously rejected

    await doctor.save();

    //  Update user role 
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


// reject doctor application by admin

export const rejectDoctor = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Doctor ID is required",
      });
    }

    const doctor = await Doctor.findById(id);

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }

    //  Prevent duplicate rejection
    if (doctor.status === "rejected") {
      return res.status(400).json({
        success: false,
        message: "Doctor already rejected",
      });
    }

    // Prevent rejecting approved doctor (optional but good)
    if (doctor.status === "approved") {
      return res.status(400).json({
        success: false,
        message: "Approved doctor cannot be rejected",
      });
    }

    doctor.status = "rejected";

    

    await doctor.save();


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



// get dashboard stats for admin



export const getDashboardStats = async (req, res) => {
  try {
   
    const [
      totalUsers,
      totalDoctors,
      totalAppointments,
      pendingApprovals
    ] = await Promise.all([
      User.countDocuments({ role: "user" }),
      User.countDocuments({ role: "doctor" }),
      Appointment.countDocuments(),
      Doctor.countDocuments({ isApproved: false })
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