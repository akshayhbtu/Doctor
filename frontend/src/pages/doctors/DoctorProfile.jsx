import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/lib/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ChevronLeft,
  Clock,
  DollarSign,
  MapPin,
  Star,
  GraduationCap,
  Hospital,
  Calendar as CalendarIcon,
  Phone,
  Mail,
  Stethoscope,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  Loader2,
  CheckCircle,
  XCircle,
} from "lucide-react";
import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { format, isSameDay } from "date-fns";
import { toast } from "sonner";

export default function DoctorProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedTab, setSelectedTab] = useState("about");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [symptoms, setSymptoms] = useState("");
  const [isBooking, setIsBooking] = useState(false);

  // Fetch doctor details
  const { data: doctor, isLoading } = useQuery({
    queryKey: ["doctor", id],
    queryFn: async () => {
      const response = await api.get(`/doctors/doctor/${id}`);
      return response;
    },
  });

  // Get all dates that have available slots
  const getDatesWithAvailableSlots = () => {
    if (!doctor?.availableSlots) return [];

    const datesWithSlots = [];
    const today = new Date();

    doctor.availableSlots.forEach((dateSlot) => {
      const slotDate = new Date(dateSlot.date);
      // Check if date is today or future and has any available slots
      if (slotDate >= today && dateSlot.slots.some((slot) => !slot.isBooked)) {
        datesWithSlots.push(slotDate);
      }
    });

    return datesWithSlots;
  };

  // Get all dates that have fully booked slots (all slots booked)
  const getDatesWithFullyBookedSlots = () => {
    if (!doctor?.availableSlots) return [];

    const datesWithBookedSlots = [];

    doctor.availableSlots.forEach((dateSlot) => {
      const slotDate = new Date(dateSlot.date);
      const allBooked = dateSlot.slots.every((slot) => slot.isBooked);
      if (allBooked && slotDate >= new Date()) {
        datesWithBookedSlots.push(slotDate);
      }
    });

    return datesWithBookedSlots;
  };

  // Get available slots for selected date
  const getAvailableSlotsForDate = (date) => {
    if (!doctor?.availableSlots) return [];

    const dateSlot = doctor.availableSlots.find((slot) =>
      isSameDay(new Date(slot.date), date),
    );

    if (!dateSlot) return [];

    // Return slots with their status
    return dateSlot.slots.map((slot) => ({
      ...slot,
      isAvailable: !slot.isBooked,
    }));
  };

  const availableSlots = getAvailableSlotsForDate(selectedDate);
  const datesWithSlots = getDatesWithAvailableSlots();
  const datesWithFullyBooked = getDatesWithFullyBookedSlots();

  // Check if a date has available slots
  const isDateWithAvailableSlots = (date) => {
    return datesWithSlots.some((d) => isSameDay(d, date));
  };

  // Check if a date is fully booked
  const isDateFullyBooked = (date) => {
    return datesWithFullyBooked.some((d) => isSameDay(d, date));
  };

  // Book appointment mutation
  const bookAppointmentMutation = useMutation({
    mutationFn: async (appointmentData) => {
      const response = await api.post("/appointment/book", {
        doctorId: appointmentData.doctorId,
        appointmentDate: appointmentData.appointmentDate,
        startTime: appointmentData.startTime,
        endTime: appointmentData.endTime,
        symptoms: appointmentData.symptoms,
      });
      return response.data;
    },
    onSuccess: () => {
      toast.success("Appointment booked successfully!");
      setSelectedSlot(null);
      setSymptoms("");
      queryClient.invalidateQueries(["doctor", id]);
      setTimeout(() => {
        navigate("/dashboard");
      }, 1500);
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message || "Failed to book appointment",
      );
    },
  });

  const handleBookAppointment = () => {
    if (!selectedSlot) {
      toast.error("Please select a time slot");
      return;
    }
    if (!symptoms.trim()) {
      toast.error("Please describe your symptoms");
      return;
    }

    setIsBooking(true);
    // console.log("Booking appointment with data:",{
    //   doctorId: doctor._id,
    //   appointmentDate: selectedDate,
    //   startTime: selectedSlot.startTime,
    //   endTime: selectedSlot.endTime,
    //   symptoms: symptoms,

    // })


    bookAppointmentMutation.mutate({
      doctorId: doctor._id,
      appointmentDate: selectedDate,
      startTime: selectedSlot.startTime,
      endTime: selectedSlot.endTime,
      symptoms: symptoms,
    });
    setIsBooking(false);
  };

  if (isLoading) {
    return <DoctorProfileSkeleton />;
  }

  if (!doctor) {
    return (
      <div className="container py-8">
        <Card className="text-center py-12">
          <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <CardTitle>Doctor Not Found</CardTitle>
          <CardDescription>
            The doctor you're looking for doesn't exist.
          </CardDescription>
          <Button className="mt-4" onClick={() => window.history.back()}>
            Go Back
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container max-w-5xl py-4">
        {/* Back Button */}
        <Button
          variant="ghost"
          className="mb-6 hover:bg-primary/10"
          onClick={() => window.history.back()}
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Back to Search
        </Button>

        {/* Profile Header Card */}
        <Card className="mb-8 overflow-hidden border-0 shadow bg-gradient-to-r from-primary/5 via-background to-background">
          <CardContent className="pt-8 pb-6">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-8">
              <div className="relative">
                <Avatar className="h-28 w-28 md:h-32 md:w-32 border-4 border-primary shadow-xl">
                  <AvatarImage
                    src={doctor?.profileImage?.url}
                    className="object-cover"
                  />
                  <AvatarFallback className="text-4xl bg-primary/10">
                    {doctor?.userId?.name?.charAt(0) || "D"}
                  </AvatarFallback>
                </Avatar>
                {doctor?.status === "approved" && (
                  <div className="absolute -bottom-2 -right-2 bg-green-500 rounded-full p-1.5 border-4 border-background">
                    <CheckCircle2 className="h-4 w-4 text-white" />
                  </div>
                )}
              </div>

              <div className="flex-1">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                      Dr. {doctor?.userId?.name}
                    </h1>
                    <p className="text-lg md:text-xl text-muted-foreground mt-1">
                      {doctor?.specialization}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <Badge className="px-3 py-1 text-sm bg-green-500">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Verified
                    </Badge>
                    <div className="flex items-center gap-2 bg-yellow-50 dark:bg-yellow-950/30 px-3 py-1 rounded-full">
                      <Star className="h-4 w-4 text-yellow-500 fill-current" />
                      <span className="font-semibold">
                        {doctor?.rating?.toFixed(1) || 0}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        ({doctor?.totalReviews || 0})
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mt-6">
                  <div className="flex items-center gap-2 p-2 md:p-3 bg-muted/50 rounded-lg">
                    <MapPin className="h-4 w-4 text-primary" />
                    <div>
                      <p className="text-xs text-muted-foreground">Location</p>
                      <p className="font-medium text-xs md:text-sm">
                        {doctor?.location?.split(",")[0]}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-2 md:p-3 bg-muted/50 rounded-lg">
                    <Clock className="h-4 w-4 text-primary" />
                    <div>
                      <p className="text-xs text-muted-foreground">
                        Experience
                      </p>
                      <p className="font-medium text-sm">
                        {doctor?.experience}y
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-2 md:p-3 bg-muted/50 rounded-lg">
                    <DollarSign className="h-4 w-4 text-green-600" />
                    <div>
                      <p className="text-xs text-muted-foreground">Fee</p>
                      <p className="font-medium text-sm">
                        ₹{doctor?.consultationFee}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-2 md:p-3 bg-muted/50 rounded-lg">
                    <Hospital className="h-4 w-4 text-primary" />
                    <div>
                      <p className="text-xs text-muted-foreground">Hospital</p>
                      <p className="font-medium text-xs md:text-sm">
                        {doctor?.hospital?.split(" ").slice(0, 2).join(" ")}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Info Bar */}
        <Card className="mb-8">
          <CardContent className="py-3 md:py-4">
            <div className="flex flex-wrap justify-center gap-4 md:gap-6">
              <div className="flex items-center gap-2">
                <Mail className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
                <span className="text-xs md:text-sm">
                  {doctor?.userId?.email}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
                <span className="text-xs md:text-sm">
                  {doctor?.userId?.phoneNumber}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <CalendarIcon className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
                <span className="text-xs md:text-sm">
                  Joined {format(new Date(doctor?.createdAt), "MMM yyyy")}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs Section */}
        <div className="mb-8">
          <Tabs
            defaultValue="about"
            value={selectedTab}
            onValueChange={setSelectedTab}
            className="space-y-6"
          >
            <TabsList className="grid w-full max-w-md grid-cols-3 mx-auto">
              <TabsTrigger value="about" className="gap-1 md:gap-2 text-sm">
                <Stethoscope className="h-3 w-3 md:h-4 md:w-4" />
                About
              </TabsTrigger>
              <TabsTrigger
                value="qualifications"
                className="gap-1 md:gap-2 text-sm"
              >
                <GraduationCap className="h-3 w-3 md:h-4 md:w-4" />
                Qualifications
              </TabsTrigger>
              <TabsTrigger value="reviews" className="gap-1 md:gap-2 text-sm">
                <Star className="h-3 w-3 md:h-4 md:w-4" />
                Reviews
              </TabsTrigger>
            </TabsList>

            <TabsContent value="about">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
                    <BookOpen className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                    Professional Biography
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed text-sm md:text-base">
                    {doctor?.bio || "No bio provided yet."}
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="qualifications">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
                    <GraduationCap className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                    Educational Background
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {doctor?.qualifications?.length > 0 ? (
                    <div className="space-y-4">
                      {doctor.qualifications.map((qual, index) => (
                        <div
                          key={index}
                          className="flex items-start gap-3 md:gap-4 p-3 md:p-4 bg-muted/30 rounded-lg"
                        >
                          <div className="h-8 w-8 md:h-10 md:w-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <GraduationCap className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-sm md:text-base">
                              {qual.degree}
                            </h4>
                            <p className="text-xs md:text-sm text-muted-foreground">
                              {qual.institution}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              Year: {qual.year}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">
                        No qualifications listed
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="reviews">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="h-5 w-5 text-yellow-500" />
                    Patient Reviews
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <Star className="h-12 w-12 mx-auto text-muted-foreground mb-3 opacity-50" />
                    <p className="text-muted-foreground">No reviews yet</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Booking Section */}

        {/* Booking Section */}
        {user?.role === "user" && doctor?.status === "approved" ? (
          <Card className="border-2 border-primary/20 shadow">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg">
              <CardTitle className="flex items-center gap-2 text-xl">
                <CalendarIcon className="h-5 w-5" />
                Book Appointment
              </CardTitle>
              <CardDescription className="text-white/80">
                <span className="inline-flex items-center gap-2">
                  <span className="inline-flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>{" "}
                    Available Slots
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>{" "}
                    Fully Booked
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-gray-300"></div> No
                    Slots
                  </span>
                </span>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="p-4 bg-primary/10 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground font-medium">
                    Consultation Fee
                  </span>
                  <span className="font-bold text-2xl text-primary">
                    ₹{doctor?.consultationFee}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Date Selection with Highlighting */}
                <div className="space-y-3">
                  <Label className="text-base font-semibold flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4" />
                    Select Date
                  </Label>
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => {
                      setSelectedDate(date);
                      setSelectedSlot(null); // Reset selected slot when date changes
                      toast.info(
                        `Date changed to ${format(date, "dd MMM yyyy")}`,
                      );
                    }}
                    className="rounded-md border mx-auto"
                    disabled={(date) => date < new Date()}
                    modifiers={{
                      available: (date) => isDateWithAvailableSlots(date),
                      fullyBooked: (date) => isDateFullyBooked(date),
                    }}
                    modifiersStyles={{
                      available: {
                        backgroundColor: "rgba(34, 197, 94, 0.2)",
                        color: "#166534",
                        fontWeight: "bold",
                        borderRadius: "50%",
                      },
                      fullyBooked: {
                        backgroundColor: "rgba(239, 68, 68, 0.2)",
                        color: "#b91c1c",
                        fontWeight: "bold",
                        borderRadius: "50%",
                      },
                    }}
                  />
                  <div className="text-xs text-center text-muted-foreground space-y-1">
                    <p>
                      🟢 <span className="text-green-600">Green highlight</span>{" "}
                      = Available slots
                    </p>
                    <p>
                      🔴 <span className="text-red-600">Red highlight</span> =
                      Fully booked
                    </p>
                    <p>⚪ No highlight = No slots available</p>
                  </div>
                </div>

                {/* Time Slots Selection - WITH GREEN BACKGROUND ON SELECT */}
                <div className="space-y-3">
                  <Label className="text-base font-semibold flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Available Time Slots
                  </Label>
                  <div className="text-sm text-muted-foreground mb-2">
                    for {format(selectedDate, "dd MMM yyyy")}
                  </div>

                  {availableSlots.length > 0 ? (
                    <div className="grid grid-cols-2 gap-2">
                      {availableSlots.map((slot, index) => (
                        <Button
                          key={index}
                          variant={
                            selectedSlot === slot ? "default" : "outline"
                          }
                          className={`
                    py-4 transition-all duration-200
                    ${
                      selectedSlot === slot
                        ? "bg-green-500 text-white hover:bg-green-600 border-green-600 shadow-md"
                        : "hover:bg-gray-100 dark:hover:bg-gray-800"
                    }
                    ${slot.isAvailable ? "border-gray-300" : "border-red-500 opacity-50 cursor-not-allowed"}
                  `}
                          onClick={() => {
                            if (slot.isAvailable) {
                              setSelectedSlot(slot);
                              // ✅ Alert message when slot is selected
                              toast.success(`✅ Slot Selected!`, {
                                description: `${slot.startTime} - ${slot.endTime} on ${format(selectedDate, "dd MMM yyyy")}`,
                                duration: 3000,
                                icon: <CheckCircle className="h-5 w-5" />,
                              });
                            }
                          }}
                          disabled={!slot.isAvailable}
                        >
                          <Clock className="h-3 w-3 mr-2" />
                          {slot.startTime} - {slot.endTime}
                          {!slot.isAvailable && (
                            <XCircle className="h-3 w-3 ml-2 text-red-500" />
                          )}
                          {slot.isAvailable && selectedSlot === slot && (
                            <CheckCircle className="h-3 w-3 ml-2" />
                          )}
                        </Button>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground bg-muted/30 rounded-lg">
                      <CalendarIcon className="h-10 w-10 mx-auto mb-2 opacity-50" />
                      <p>No available slots for this date</p>
                      <p className="text-sm">Please select another date</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Symptoms Input */}
              <div className="space-y-3">
                <Label className="text-base font-semibold flex items-center gap-2">
                  <Stethoscope className="h-4 w-4" />
                  Symptoms / Reason for Visit
                </Label>
                <Textarea
                  placeholder="Please describe your symptoms or reason for consultation..."
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                  rows={4}
                  className="resize-none"
                />
              </div>

              <Separator />

              {/* Booking Summary */}
              <div className="p-4 bg-muted/30 rounded-lg">
                <h4 className="font-semibold mb-3">Booking Summary</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Doctor</span>
                    <span className="font-medium">
                      Dr. {doctor?.userId?.name}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Date</span>
                    <span className="font-medium text-green-600">
                      {format(selectedDate, "dd MMM yyyy")}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Time</span>
                    <span className="font-medium text-green-600">
                      {selectedSlot
                        ? `${selectedSlot.startTime} - ${selectedSlot.endTime}`
                        : "Not selected"}
                    </span>
                  </div>
                  <div className="flex justify-between border-t pt-2 mt-2">
                    <span className="font-semibold">Total Amount</span>
                    <span className="font-bold text-primary text-lg">
                      ₹{doctor?.consultationFee}
                    </span>
                  </div>
                </div>
              </div>

              {/* Book Button */}
              <Button
              
                onClick={() => {
                  if (!selectedSlot) {
                    toast.error(" Please select a time slot first!");
                    return;
                  }
                  if (!symptoms.trim()) {
                    toast.error(" Please describe your symptoms!");
                    return;
                  }
                  handleBookAppointment();
                }}
                disabled={!selectedSlot || !symptoms.trim() || isBooking}
                className="w-full cursor-pointer bg-black  hover:bg-gray-800 py-6 text-lg font-semibold"
                size="lg"
              >
                {isBooking && <Loader2 className="h-5 w-5 mr-2 animate-spin" />}
                {isBooking ? "Booking..." : "Confirm & Book Appointment"}
              </Button>
            </CardContent>
          </Card>
        ) : null}
      </div>
    </div>
  );
}

// Loading Skeleton Component
function DoctorProfileSkeleton() {
  return (
    <div className="container max-w-5xl py-8">
      <Skeleton className="h-10 w-32 mb-6" />
      <Card className="mb-8">
        <CardContent className="pt-8 pb-6">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-8">
            <Skeleton className="h-32 w-32 rounded-full" />
            <div className="flex-1 space-y-4">
              <Skeleton className="h-10 w-64" />
              <Skeleton className="h-6 w-48" />
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="h-16 rounded-lg" />
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      <Skeleton className="h-[500px] rounded-lg" />
    </div>
  );
}
