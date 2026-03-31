import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
// import { useAuth } from '../../contexts/AuthContext';
// import { Button } from '../../components/ui/button';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";



import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// import { toast } from 'sonner';
import { Loader2, User, Mail, Lock, Phone } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";

const formSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
    phoneNumber: z.string().min(10, "Invalid phone number"),
    dob: z.string().min(1, "DOB is required"),
    gender: z.enum(["male", "female", "other"]),
    street: z.string().min(2, "Street required"),
    city: z.string().min(2, "City required"),
    state: z.string().min(2, "State required"),
    zipCode: z.string().min(4, "Zip required"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

const Register = () => {
  const { register, loading, setLoading } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register: formRegister,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(formSchema),
  });

  const onformSubmit = async (data) => {
    console.log(data);
    setIsLoading(true);

    const payload = {
      name: data.name,
      email: data.email,
      password: data.password,
      dob: data.dob,
      gender: data.gender,
      role: "user", 
      phoneNumber: data.phoneNumber,
      address: {
        street: data.street,
        city: data.city,
        state: data.state,
        zipCode: data.zipCode,
      },
    };

    await register(payload);

    setIsLoading(false);
    navigate("/dashboard");
  };

  return (
    <div className="container flex items-center justify-center min-h-[80vh] py-8">
      <Card className="w-full sm:max-w-md md:max-w-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">
            Create an account
          </CardTitle>
          <CardDescription className="text-center">
            Join us to book appointments with top doctors
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onformSubmit)}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Name */}
              <div className="space-y-1">
                <Label>Full Name</Label>
                <Input {...formRegister("name")} />
                <p className="text-red-500 text-sm">{errors.name?.message}</p>
              </div>

              {/* Email */}
              <div className="space-y-1">
                <Label>Email</Label>
                <Input type="email" {...formRegister("email")} />
                <p className="text-red-500 text-sm">{errors.email?.message}</p>
              </div>

              {/* Phone */}
              <div className="space-y-1">
                <Label>Phone</Label>
                <Input type="text" {...formRegister("phoneNumber")} />
                <p className="text-red-500 text-sm">
                  {errors.phoneNumber?.message}
                </p>
              </div>

              {/* DOB */}
              <div className="space-y-1">
                <Label>Date of Birth</Label>
                <Input type="date" {...formRegister("dob")} />
                <p className="text-red-500 text-sm">{errors.dob?.message}</p>
              </div>

              {/* Password */}
              <div className="space-y-1">
                <Label>Password</Label>
                <Input type="password" {...formRegister("password")} />
                <p className="text-red-500 text-sm">
                  {errors.password?.message}
                </p>
              </div>

              {/* Confirm Password */}
              <div className="space-y-1">
                <Label>Confirm Password</Label>
                <Input type="password" {...formRegister("confirmPassword")} />
                <p className="text-red-500 text-sm">
                  {errors.confirmPassword?.message}
                </p>
              </div>

              {/* Gender */}
              <div className="space-y-1">
                <Label>Gender</Label>
                <Select
                  onValueChange={(value) => setValue("gender", value)}
                  // value={genderValue}
                  // onValueChange={(value) => setValue("gender", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-red-500 text-sm">{errors.gender?.message}</p>
              </div>

              {/* Street full width */}
              <div className="md:col-span-2 space-y-1">
                <Label>Street</Label>
                <Input {...formRegister("street")} />
                <p
                  className="t7667
                ext-red-500 text-sm"
                >
                  {errors.street?.message}
                </p>
              </div>

              {/* City */}
              <div className="space-y-1">
                <Label>City</Label>
                <Input {...formRegister("city")} />
              </div>

              {/* State */}
              <div className="space-y-1">
                <Label>State</Label>
                <Input {...formRegister("state")} />
              </div>

              {/* Zip */}
              <div className="md:col-span-2 space-y-1">
                <Label>Zip Code</Label>
                <Input {...formRegister("zipCode")} />
              </div>
            </div>

            <Button type="submit" className="w-full mt-6" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Account
            </Button>
          </form>
        </CardContent>
        <CardFooter>
          <p className="text-sm text-muted-foreground text-center w-full">
            Already have an account?{" "}
            <Link to="/login" className="text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Register;
