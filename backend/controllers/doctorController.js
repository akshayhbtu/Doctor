import Doctor from "../models/Doctor.js";
import User from "../models/User.js";
// import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import { uploadToCloudinary } from "../utils/cloudinary.js";

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
      profileImage: result.url,
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
  try {
    const doctors = await Doctor.find();

    res.status(200).json(doctors);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
