import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
// import api from '../../lib/api';
// import { useAuth } from '../../contexts/AuthContext';
// import { Button } from '../../components/ui/button';
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from '../../components/ui/card';

import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

// import {
//   Form,
//   FormControl,
//   FormDescription,
//   FormField,
//   FormItem,
//   FormLabel,
//   FormMessage,
// } from '../../components/ui/form';
// import { Input } from '../../components/ui/input';
// import { Textarea } from '../../components/ui/textarea';

import {
  Select,
  SelectContent,
  //   SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from '../../components/ui/select';
// import { toast } from 'sonner';
import {
  Loader2,
  Upload,
  X,
  Plus,
  GraduationCap,
  MapPin,
  DollarSign,
  Hospital,
  Briefcase,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

// Validation Schema
const doctorFormSchema = z.object({
  specialization: z.string().min(1, "Specialization is required"),
  experience: z.coerce
    .number()
    .min(0, "Experience cannot be negative")
    .max(50, "Experience cannot exceed 50 years"),
  hospital: z.string().min(2, "Hospital/Clinic name is required"),
  consultationFee: z.coerce
    .number()
    .min(100, "Fee must be at least ₹100")
    .max(10000, "Fee cannot exceed ₹10,000"),
  location: z.string().min(2, "Location is required"),
  qualifications: z
    .array(
      z.object({
        degree: z.string().min(1, "Degree is required"),
        institution: z.string().min(1, "Institution is required"),
        year: z.coerce
          .number()
          .min(1900, "Invalid year")
          .max(new Date().getFullYear(), "Year cannot be in future"),
      }),
    )
    .min(1, "At least one qualification is required"),
});

const specializations = [
  { value: "Cardiologist", label: "Cardiologist - Heart Specialist" },
  { value: "Dermatologist", label: "Dermatologist - Skin Specialist" },
  { value: "Pediatrician", label: "Pediatrician - Child Specialist" },
  { value: "Neurologist", label: "Neurologist - Brain & Nerve Specialist" },
  { value: "Orthopedic", label: "Orthopedic - Bone & Joint Specialist" },
  { value: "Gynecologist", label: "Gynecologist - Women Health Specialist" },
  { value: "Psychiatrist", label: "Psychiatrist - Mental Health Specialist" },
  { value: "Dentist", label: "Dentist - Dental Specialist" },
  { value: "General Physician", label: "General Physician - Primary Care" },
  { value: "Ophthalmologist", label: "Ophthalmologist - Eye Specialist" },
  { value: "ENT Specialist", label: "ENT Specialist - Ear, Nose, Throat" },
  { value: "Urologist", label: "Urologist - Urinary Tract Specialist" },
  { value: "Endocrinologist", label: "Endocrinologist - Hormone Specialist" },
  {
    value: "Gastroenterologist",
    label: "Gastroenterologist - Digestive System",
  },
  { value: "Pulmonologist", label: "Pulmonologist - Lung Specialist" },
];

const DoctorRegistration = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm({
    resolver: zodResolver(doctorFormSchema),
    defaultValues: {
      specialization: "",
      experience: 0,
      hospital: "",
      consultationFee: 500,
      location: "",
      qualifications: [
        { degree: "", institution: "", year: new Date().getFullYear() },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "qualifications",
  });

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size should be less than 5MB");
        return;
      }
      // Validate file type
      if (!file.type.startsWith("image/")) {
        toast.error("Please upload an image file");
        return;
      }
      setProfileImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const removeImage = () => {
    setProfileImage(null);
    setImagePreview(null);
  };

  const onSubmit = async (data) => {
    // Validate profile image
    if (!profileImage) {
      toast.error("Please upload a profile image");
      return;
    }

    setIsSubmitting(true);

    // Create FormData for multipart/form-data
    const formData = new FormData();
    formData.append("profileImage", profileImage);
    formData.append("specialization", data.specialization);
    formData.append("experience", data.experience.toString());
    formData.append("hospital", data.hospital);
    formData.append("consultationFee", data.consultationFee.toString());
    formData.append("location", data.location);
    formData.append("qualifications", JSON.stringify(data.qualifications));

    try {
      const response = await api.post("/doctors/register", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success(
        response.data.message || "Doctor registration submitted successfully!",
      );
      toast.info(
        "Your application is pending admin approval. You will be notified once approved.",
      );

      // Navigate to dashboard after successful registration
      setTimeout(() => {
        navigate("/dashboard");
      }, 2000);
    } catch (error) {
      console.error("Registration error:", error);
      toast.error(
        error.response?.data?.message ||
          "Registration failed. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container max-w-4xl py-8">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold">
            Doctor Registration
          </CardTitle>
          <CardDescription className="text-lg">
            Join our platform as a doctor. Fill in your professional details
            below. Your application will be reviewed by our admin team.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form>
            <div className="space-y-4 p-4 border rounded-lg bg-muted/30 ">
              <div className="flex items-center gap-2">
                <Upload className="h-5 w-5 text-primary" />
                <h3 className="font-semibold text-lg">Profile Image</h3>
              </div>

              <div>
                <div>
                  {imagePreview ? (
                    <div className="relative group">
                      <img
                        src={imagePreview}
                        alt="Profile preview"
                        className="w-32 h-32 rounded-full object-cover border-4 border-primary shadow-lg"
                      />
                      <button
                        type="button"
                        onClick={removeImage}
                        className="absolute -top-2 -right-2 bg-destructive text-white rounded-full p-1.5 hover:bg-destructive/90 transition-all shadow-md"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="w-22 h-22 rounded-full bg-muted flex items-center justify-center border-2 border-dashed border-muted-foreground/30">
                      <Upload className="h-10 w-10 text-muted-foreground" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default DoctorRegistration;
