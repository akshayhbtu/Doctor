import Doctor from "../models/Doctor.js";

export const approveDoctor = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if ID is provided
    if (!id) {
      return res.status(400).json({ message: "Doctor ID is required" });
    }

    //  Find and update doctor
    const doctor = await Doctor.findByIdAndUpdate(
      id,
      { isApproved: true },
      { new: true }
    );

    // If doctor not found
    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    
    res.status(200).json({
      success: true,
      message: "Doctor approved successfully",
      doctor,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};