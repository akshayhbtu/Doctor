import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
// import { Select } from "@/components/ui/select";
import { Clock, DollarSign, MapPin, Search, SlidersHorizontal, Star } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Link } from "react-router-dom";

const specializations = [
  "Cardiologist",
  "Dermatologist",
  "Pediatrician",
  "Neurologist",
  "Orthopedic",
  "Gynecologist",
  "Psychiatrist",
  "Dentist",
  "General Physician",
];

const locations = [
  "Mumbai",
  "Delhi",
  "Bangalore",
  "Chennai",
  "Kolkata",
  "Pune",
  "Hyderabad",
];

const experienceRanges = [
  { value: "0-5", label: "0-5 years" },
  { value: "5-10", label: "5-10 years" },
  { value: "10-15", label: "10-15 years" },
  { value: "15+", label: "15+ years" },
];

const feeRanges = [
  { value: "0-500", label: "Under ₹500" },
  { value: "500-1000", label: "₹500 - ₹1000" },
  { value: "1000-2000", label: "₹1000 - ₹2000" },
  { value: "2000+", label: "Above ₹2000" },
];

export default function DoctorSearch() {
  const [searchTerm, setSearchTerm] = useState("");

  const [filters, setFilters] = useState({
    specialization: "",
    location: "",
    experience: "",
    feeRange: "",
  });

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    console.log(filters);
    setFilters({
      specialization: "",
      location: "",
      experience: "",
      feeRange: "",
    });
    setSearchTerm("");
  };

  const { data: doctors, isLoading } = useQuery({
    queryKey: ["doctors", searchTerm, filters],
    queryFn: async () => {
      const params = new URLSearchParams();

      if (searchTerm) params.append("search", searchTerm);
      if (filters.specialization)
        params.append("specialization", filters.specialization);
      if (filters.location) params.append("location", filters.location);
      if (filters.experience) params.append("experience", filters.experience);
      if (filters.feeRange) params.append("feeRange", filters.feeRange);

      const response = await api.get(`/doctors/all-doctor?${params.toString()}`);
      console.log(response)
      return response;
    },
  });

  return (
    <div className="container py-8 ">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Find a Doctor</h1>
        <p className="text-muted-foreground">
          Search for doctors by specialization, location, or name
        </p>
      </div>

      {/* search bar */}

      <div className="flex gap-4 mb-6">
        <div className="relative flex-1 items-center">
          <Search className="absolute  left-3 top-3 h-4 w-4 text-muted-foreground" />

          <Input
            placeholder="Search doctors by name, specialization, or hospital..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button variant="outline">
          <SlidersHorizontal className="h-4 w-4 mr-2" />
          Filters
        </Button>
      </div>

      {/* Filter */}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Select
          value={filters.specialization}
          onValueChange={(value) => handleFilterChange("specialization", value)}
        >
          <SelectTrigger>
            {/* <SelectValue placeholder="Theme" /> */}
            <SelectValue placeholder="Specialization" />
          </SelectTrigger>
          <SelectContent>
            {specializations.map((spec) => (
              <SelectItem key={spec} value={spec}>
                {spec}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.location}
          onValueChange={(value) => handleFilterChange("location", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Location" />
          </SelectTrigger>
          <SelectContent>
            {locations.map((loc) => (
              <SelectItem key={loc} value={loc}>
                {loc}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.experience}
          onValueChange={(value) => handleFilterChange("experience", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Experience" />
          </SelectTrigger>
          <SelectContent>
            {experienceRanges.map((range) => (
              <SelectItem key={range.value} value={range.value}>
                {range.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.feeRange}
          onValueChange={(value) => handleFilterChange("feeRange", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Consultation Fee" />
          </SelectTrigger>
          <SelectContent>
            {feeRanges.map((range) => (
              <SelectItem key={range.value} value={range.value}>
                {range.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Active Filters */}
      {(filters.specialization ||
        filters.location ||
        filters.experience ||
        filters.feeRange) && (
        <div className="flex items-center gap-2 mb-6">
          <span className="text-sm text-muted-foreground">Active filters:</span>

          {Object.entries(filters).map(
            ([key, value]) =>
              value && (
                <Badge variant="secondary" className="px-3 py-1" key={key}>
                  {value}
                  <button
                    className="ml-2 text-red-500"
                    onClick={() => handleFilterChange(key, "")}
                  >
                    ×
                  </button>
                </Badge>
              ),
          )}

          <Button variant="ghost" size="sm" onClick={clearFilters}>
            Clear all
          </Button>
        </div>
      )}




        {/* Results */}
      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-12 w-12 rounded-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {doctors?.map((doctor) => (
            <Card key={doctor._id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={doctor.profileImage.url} />
                      <AvatarFallback>
                        {doctor.userId?.name?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg">
                        Dr. {doctor.userId?.name}
                      </CardTitle>
                      <CardDescription>{doctor.specialization}</CardDescription>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center text-sm">
                    <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                    {doctor.location}
                  </div>
                  <div className="flex items-center text-sm">
                    <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                    {doctor.experience} years experience
                  </div>
                  <div className="flex items-center text-sm">
                    <Star className="h-4 w-4 mr-2 text-yellow-400 fill-current" />
                    {doctor.rating.toFixed(1)} ({doctor.totalReviews} reviews)
                  </div>
                  <div className="flex items-center text-sm font-medium">
                    <DollarSign className="h-4 w-4 mr-2 text-green-600" />
                    ₹{doctor.consultationFee} per consultation
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full" asChild>
                  <Link to={`/doctors/${doctor._id}`}>View Profile</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {doctors?.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <Search className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No doctors found</h3>
          <p className="text-muted-foreground">
            Try adjusting your search or filters to find more doctors
          </p>
        </div>
      )}


    </div>
  );
}
