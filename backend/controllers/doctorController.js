import Doctor from "../models/Doctor.js";
import User from "../models/User.js";
// import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import { deleteFromCloudinary, uploadToCloudinary } from "../utils/cloudinary.js";

export const registerDoctor = async (req, res) => {
  try {
    const {
      specialization,
      experience,
      hospital,
      consultationFee,
      location,
      qualifications,
    } = req.body;

    if (!specialization || !experience || !consultationFee || !location) {
      return res.status(400).json({
        message: "Please provide all required fields",
      });
    }

    console.log(specialization, experience, hospital, location);

    console.log(req.file);

    if (!req.file) {
      return res.status(400).json({
        message: "Profile image is required",
      });
    }

    // Upload image to Cloudinary
    const result = await uploadToCloudinary(req.file.path);

    console.log("result",result)

    // Delete local file after upload
    // delete local file
    if (fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    // Update user role to doctor
    const findUser = await User.findByIdAndUpdate(
      req.user._id,
      { role: "doctor" },
      { new: true },
    );

    if (!findUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const doctor = await Doctor.create({
      userId: req.user._id,
      specialization,
      experience,
      hospital,
      consultationFee,
      location,
      profileImage: {
        url: result.url,
        public_id: result.public_id,
      },
      //profileImage: result.url,
      qualifications: qualifications ? JSON.parse(qualifications) : [],
      isApproved: false,
    });

    console.log("doctor",doctor)

    res.status(201).json({
      message: "Doctor registration submitted. Waiting for admin approval.",
      doctor,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};




/////////////////////////////////////////

export const getDoctors = async (req, res) => {

   let query = { isApproved: true };
  try {
   const doctors = await Doctor.find(query).populate('userId', 'name email');
    //res.json(doctors);

    res.status(200).json(doctors);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};




// add availablity slots for doctor
export const addAvailability = async (req, res) => {
  try {
    const { availableSlots } = req.body;

    if (!availableSlots || !Array.isArray(availableSlots)) {
      return res.status(400).json({ message: "Invalid slots data" });
    }

    const doctor = await Doctor.findOne({ userId: req.user._id });

    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    const today = new Date();

    for (let slotDay of availableSlots) {
      if (!slotDay.date || !slotDay.slots) {
        return res.status(400).json({ message: "Invalid format" });
      }

      if (new Date(slotDay.date) < today) {
        return res.status(400).json({ message: "Cannot add past dates" });
      }

      const existingDate = doctor.availableSlots.find(
        (d) =>
          new Date(d.date).toDateString() ===
          new Date(slotDay.date).toDateString()
      );

      if (existingDate) {
        // ✅ Avoid duplicate slots
        for (let newSlot of slotDay.slots) {
          const isDuplicate = existingDate.slots.some(
            (s) =>
              s.startTime === newSlot.startTime &&
              s.endTime === newSlot.endTime
          );

          if (!isDuplicate) {
            existingDate.slots.push(newSlot);
          }
        }
      } else {
        doctor.availableSlots.push(slotDay);
      }
    }

    await doctor.save();

    res.status(200).json({
      success: true,
      message: "Availability updated (no duplicates)",
      doctor,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};



// updat the doctor profile 

// import Doctor from "../models/Doctor.js";
// import fs from "fs";
// import { uploadToCloudinary, deleteFromCloudinary } from "../utils/cloudinary.js";

export const updateDoctorProfile = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ userId: req.user._id });

    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    const {
      specialization,
      experience,
      hospital,
      consultationFee,
      location,
      qualifications,
    } = req.body;

    if (specialization) doctor.specialization = specialization;
    if (experience) doctor.experience = experience;
    if (hospital) doctor.hospital = hospital;
    if (consultationFee) doctor.consultationFee = consultationFee;
    if (location) doctor.location = location;

    
    if (qualifications) {
      try {
        doctor.qualifications = JSON.parse(qualifications);
      } catch {
        return res.status(400).json({ message: "Invalid qualifications format" });
      }
    }

    //  Handle Image Update
    if (req.file) {
      //  Delete old image from Cloudinary
      if (doctor.profileImage?.public_id) {
        await deleteFromCloudinary(doctor.profileImage.public_id);
      }

      const result = await uploadToCloudinary(req.file.path);

      doctor.profileImage = {
        url: result.url,
        public_id: result.public_id,
      };

      //  Delete local file
      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
    }

    await doctor.save();


    res.status(200).json({
      success: true,
      message: "Doctor profile updated successfully",
      doctor,
    });

  } catch (error) {
    console.error("Update Doctor Error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};