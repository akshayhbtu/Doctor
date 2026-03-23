import mongoose from "mongoose";

const doctorSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  specialization: {
    type: String,
    required: true,
  },
  experience: {
    type: Number,
    required: true,
  },
  hospital: {
    type: String,
    required: true,
  },
  consultationFee: {
    type: Number,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  profileImage: {
    url: String,
    public_id: String,
  },
  qualifications: [
    {
      degree: String,
      institution: String,
      year: Number,
    },
  ],

  availableSlots: [
    {
      date: {
        type: Date,
        required: true,
      },
      slots: [
        {
          startTime: {
            type: String,
            required: true,
            match: [
              /^(0?[1-9]|1[0-2]):[0-5][0-9]\s?(AM|PM)$/i,
              "Invalid time format",
            ],
          },
          endTime: {
            type: String,
            required: true,
            match: [
              /^(0?[1-9]|1[0-2]):[0-5][0-9]\s?(AM|PM)$/i,
              "Invalid time format",
            ],
          },
          isBooked: {
            type: Boolean,
            default: false,
          },
        },
      ],
    },
  ],

  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5,
  },
  totalReviews: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("Doctor", doctorSchema);
