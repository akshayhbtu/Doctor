// import Doctor from "../models/Doctor.js";

import Doctor from "../models/Doctor.js";
// import mongoose from "mongoose";
import Appointment from "../models/Appointment.js";

const normalizeTime = (time) => {
  return time.trim().toUpperCase().replace(/\s+/g, " ");
};

export const bookAppointment = async (req, res) => {
  try {
    const { doctorId, appointmentDate, startTime, endTime, symptoms } =
      req.body;

    //   Validation
    if (!doctorId || !appointmentDate || !startTime || !endTime || !symptoms) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    //   Find doctor
    const doctor = await Doctor.findById(doctorId);

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }

    //  Match date
    const selectedDate = new Date(appointmentDate);

    const dateSlot = doctor.availableSlots.find(
      (d) => new Date(d.date).toDateString() === selectedDate.toDateString(),
    );

    if (!dateSlot) {
      return res.status(400).json({
        success: false,
        message: "No slots available for this date",
      });
    }

    //  Match slot
    const slot = dateSlot.slots.find(
      (s) =>
        normalizeTime(s.startTime) === normalizeTime(startTime) &&
        normalizeTime(s.endTime) === normalizeTime(endTime),
    );

    if (!slot) {
      return res.status(400).json({
        success: false,
        message: "Slot not found",
      });
    }

    //  Check already booked
    if (slot.isBooked) {
      return res.status(400).json({
        success: false,
        message: "Slot already booked",
      });
    }

    // Mark slot booked
    slot.isBooked = true;

    // Save doctor
    await doctor.save();

    //  Create appointment
    const appointment = await Appointment.create({
      patientId: req.user._id,
      doctorId,
      appointmentDate: selectedDate,
      timeSlot: {
        startTime: normalizeTime(startTime),
        endTime: normalizeTime(endTime),
      },
      symptoms,
      status: "pending",
      paymentStatus: "pending",
    });

    res.status(201).json({
      success: true,
      message: "Appointment booked successfully",
      appointment,
    });
  } catch (error) {
    console.error("Book Appointment Error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};



// update appointment by doctor
export const updateAppointmentStatus = async (req, res) => {
  try {
    const { status } = req.body;

    //  Validate status
    const validStatus = [
      "pending",
      "approved",
      "rejected",
      "completed",
      "cancelled",
    ];

    if (!validStatus.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status value",
      });
    }

    //  Find appointment
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    //  Update status
    appointment.status = status;

    //  If cancelled → free slot
    if (status === "cancelled") {
      const doctor = await Doctor.findById(appointment.doctorId);

      if (doctor) {
        const dateSlot = doctor.availableSlots.find(
          (d) =>
            new Date(d.date).toDateString() ===
            new Date(appointment.appointmentDate).toDateString(),
        );

        if (dateSlot) {
          const slot = dateSlot.slots.find(
            (s) =>
              s.startTime === appointment.timeSlot.startTime &&
              s.endTime === appointment.timeSlot.endTime,
          );

          if (slot) {
            slot.isBooked = false;
          }
        }

        await doctor.save();
      }
    }

    await appointment.save();

    res.status(200).json({
      success: true,
      message: "Appointment status updated",
      appointment,
    });
  } catch (error) {
    console.error("Update Appointment Error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};



export const getUserAppointments = async (req, res) => {
  try {
    const totalAppointments = await Appointment.countDocuments({
      patientId: req.user._id,
    });

    const upcomingAppointments = await Appointment.countDocuments({
      patientId: req.user._id,
      appointmentDate: { $gt: new Date() },
      status: { $nin: ["cancelled", "completed"] },
    });

    const completedAppointments = await Appointment.countDocuments({
      patientId: req.user._id,
      status: "completed",
    });

    res.status(200).json({
      success: true,
      totalAppointments,
      upcomingAppointments,
      completedAppointments,
      totalReviews: 0,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// Get user's upcoming appointments

export const getUserUpcomingAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({
      patientId: req.user._id,
      appointmentDate: { $gt: new Date() },
      status: { $nin: ['cancelled', 'completed'] },
    })
      .populate({
        path: 'doctorId',
        populate: {
          path: 'userId',
          model: 'User',
          select: 'name email phoneNumber'  // Sirf User se name, email, phoneNumber
        }
      })
      .sort({ appointmentDate: 1 })
      .limit(5);

    // Format response for frontend
    const formattedAppointments = appointments.map(apt => {
      const doctor = apt.doctorId;
      const user = doctor?.userId;
      
      return {
        _id: apt._id,
        appointmentDate: apt.appointmentDate,
        timeSlot: apt.timeSlot,
        status: apt.status,
        symptoms: apt.symptoms,
        doctor: {
          id: doctor?._id,
          name: user?.name || 'Doctor',
          specialization: doctor?.specialization,
          experience: doctor?.experience,
          hospital: doctor?.hospital,
          consultationFee: doctor?.consultationFee,
          location: doctor?.location,
          profileImage: doctor?.profileImage?.url || doctor?.profileImage, // Doctor se profileImage
          email: user?.email,
          phoneNumber: user?.phoneNumber
        }
      };
    });

    res.status(200).json({
      success: true,
      data: formattedAppointments,
    });
  } catch (error) {
    console.error("Error fetching upcoming appointments:", error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};


// Get user's appointment history
export const getUserAppointmentHistory = async (req, res) => {
  try {
    const appointments = await Appointment.find({
      patientId: req.user._id,
    })
      .populate('doctorId', 'name email profilePicture')
      .sort({ appointmentDate: -1 })
      .limit(10);

    res.status(200).json({
      success: true,
      data: appointments,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// get doctor appointments

export const getDocotorAppointments = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ userId: req.user._id });

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }

    const appointments = await Appointment.find({ doctorId: doctor._id })
      .populate("patientId", "name email phone")
      .sort({ appointmentDate: -1 });

    res.status(200).json({
      success: true,
      appointments,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
