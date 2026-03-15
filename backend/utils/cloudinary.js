// import { v2 as cloudinary } from "cloudinary";

import cloudinary from "../config/cloudinary.js";

// Upload File
export const uploadToCloudinary = async (filePath, folder = "doctors") => {
  try {
   
   

    const result = await cloudinary.uploader.upload(filePath, {
      folder: `doctor-appointment/${folder}`,
      resource_type: "auto",
    });

    console.log(result);

    return {
      public_id: result.public_id,
      url: result.secure_url,
    };
  } catch (error) {
    throw new Error(`Cloudinary Upload Error: ${error.message}`);
  }
};

// Delete File
export const deleteFromCloudinary = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);

    return result;
  } catch (error) {
    throw new Error(`Cloudinary Delete Error: ${error.message}`);
  }
};
