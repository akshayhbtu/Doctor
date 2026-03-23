import Doctor from "../models/Doctor.js";
import User from "../models/User.js";
// import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import { deleteFromCloudinary, uploadToCloudinary } from "../utils/cloudinary.js";
import { normalizeTime } from "../utils/normalizeTime.js";


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

    //  Validation
    if (!specialization || !experience || !consultationFee || !location) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields",
      });
    }

    //  Check image
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Profile image is required",
      });
    }

    //  Prevent duplicate application
    const existingDoctor = await Doctor.findOne({ userId: req.user._id });

    if (existingDoctor) {
      return res.status(400).json({
        success: false,
        message: "You have already applied as a doctor",
      });
    }

    //  Upload image
    const result = await uploadToCloudinary(req.file.path);

    // ✅ 5. Delete local file
    if (fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }


    //  Create doctor (PENDING)
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
      qualifications: qualifications ? JSON.parse(qualifications) : [],
      status: "pending", 
    });

    res.status(201).json({
      success: true,
      message: "Doctor registration submitted. Waiting for admin approval.",
      doctor,
    });

  } catch (error) {
    console.error("Register Doctor Error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};




/////////////////////////////////////////

export const getDoctors = async (req, res) => {

   let query = { status: "approved" };
  try {
   const doctors = await Doctor.find(query).populate('userId', 'name email');
    //res.json(doctors);

    // console.log(doctors)

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
        for (let newSlot of slotDay.slots) {
          const startTime = normalizeTime(newSlot.startTime);
          const endTime = normalizeTime(newSlot.endTime);

          const isDuplicate = existingDate.slots.some(
            (s) =>
              normalizeTime(s.startTime) === startTime &&
              normalizeTime(s.endTime) === endTime
          );

          if (!isDuplicate) {
            existingDate.slots.push({
              startTime,
              endTime,
              isBooked: false,
            });
          }
        }
      } else {
        const formattedSlots = slotDay.slots.map((s) => ({
          startTime: normalizeTime(s.startTime),
          endTime: normalizeTime(s.endTime),
          isBooked: false,
        }));

        doctor.availableSlots.push({
          date: slotDay.date,
          slots: formattedSlots,
        });
      }
    }

    await doctor.save();

    res.status(200).json({
      success: true,
      message: "Availability updated",
      doctor,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};



// updat the doctor profile 


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