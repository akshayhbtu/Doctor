import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';
import { format } from 'date-fns';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import {
  Edit,
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
  Settings,
  Users,
  CalendarDays,
  MessageSquare
} from 'lucide-react';

export default function DoctorDetailsProfile() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Fetch doctor's own profile
  const { data: doctor, isLoading } = useQuery({
    queryKey: ['doctorProfile', user?._id],
    queryFn: async () => {
      const response = await api.get(`/doctors/user/${user?._id}`);
      return response;
    },
    enabled: !!user?._id && user?.role === 'doctor',
  });

  if (isLoading) {
    return <DoctorProfileSkeleton />;
  }

  if (!doctor) {
    return (
      <div className="container py-8">
        <Card className="text-center py-12">
          <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <CardTitle>Profile Not Found</CardTitle>
          <CardDescription>
            Your doctor profile is not complete yet.
          </CardDescription>
          <Button className="mt-4" onClick={() => navigate('/doctor/register')}>
            Complete Registration
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container max-w-5xl py-8">
        {/* Header with Edit Button */}
        <div className="flex justify-between items-center mb-6">
          <Button
            variant="ghost"
            className="hover:bg-primary/10"
            onClick={() => navigate('/doctor/dashboard')}
          >
            ← Back to Dashboard
          </Button>
          <Button 
            onClick={() => navigate('/doctor/profile/edit')}
            className="gap-2"
          >
            <Edit className="h-4 w-4" />
            Edit Profile
          </Button>
        </div>

        {/* Profile Header Card */}
        <Card className="mb-8 overflow-hidden border-0 shadow-xl bg-gradient-to-r from-primary/5 via-background to-background">
          <CardContent className="pt-8 pb-6">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-8">
              <div className="relative">
                <Avatar className="h-28 w-28 md:h-32 md:w-32 border-4 border-primary shadow-xl">
                  <AvatarImage src={doctor?.profileImage?.url} className="object-cover" />
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
                    <Badge 
                      className={`px-3 py-1 text-sm ${
                        doctor?.status === "approved" 
                          ? "bg-green-500" 
                          : "bg-yellow-500"
                      }`}
                    >
                      {doctor?.status === "approved" ? "Verified" : "Pending Verification"}
                    </Badge>
                    <div className="flex items-center gap-2 bg-yellow-50 dark:bg-yellow-950/30 px-3 py-1 rounded-full">
                      <Star className="h-4 w-4 text-yellow-500 fill-current" />
                      <span className="font-semibold">{doctor?.rating?.toFixed(1) || 0}</span>
                      <span className="text-sm text-muted-foreground">
                        ({doctor?.totalReviews || 0} reviews)
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mt-6">
                  <div className="flex items-center gap-2 p-2 md:p-3 bg-muted/50 rounded-lg">
                    <MapPin className="h-4 w-4 text-primary" />
                    <div>
                      <p className="text-xs text-muted-foreground">Location</p>
                      <p className="font-medium text-xs md:text-sm">{doctor?.location}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-2 md:p-3 bg-muted/50 rounded-lg">
                    <Clock className="h-4 w-4 text-primary" />
                    <div>
                      <p className="text-xs text-muted-foreground">Experience</p>
                      <p className="font-medium text-sm">{doctor?.experience} years</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-2 md:p-3 bg-muted/50 rounded-lg">
                    <DollarSign className="h-4 w-4 text-green-600" />
                    <div>
                      <p className="text-xs text-muted-foreground">Fee</p>
                      <p className="font-medium text-sm">₹{doctor?.consultationFee}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-2 md:p-3 bg-muted/50 rounded-lg">
                    <Hospital className="h-4 w-4 text-primary" />
                    <div>
                      <p className="text-xs text-muted-foreground">Hospital</p>
                      <p className="font-medium text-xs md:text-sm">{doctor?.hospital}</p>
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
                <span className="text-xs md:text-sm">{doctor?.userId?.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
                <span className="text-xs md:text-sm">{doctor?.userId?.phoneNumber}</span>
              </div>
              <div className="flex items-center gap-2">
                <CalendarIcon className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
                <span className="text-xs md:text-sm">
                  Joined {format(new Date(doctor?.createdAt), "MMMM yyyy")}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="cursor-pointer hover:shadow-lg transition" onClick={() => navigate('/doctor/appointments')}>
            <CardContent className="p-4 text-center">
              <CalendarDays className="h-8 w-8 mx-auto text-primary mb-2" />
              <p className="font-medium">Appointments</p>
              <p className="text-xs text-muted-foreground">View all appointments</p>
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover:shadow-lg transition" onClick={() => navigate('/doctor/availability')}>
            <CardContent className="p-4 text-center">
              <Clock className="h-8 w-8 mx-auto text-primary mb-2" />
              <p className="font-medium">Availability</p>
              <p className="text-xs text-muted-foreground">Manage time slots</p>
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover:shadow-lg transition" onClick={() => navigate('/doctor/patients')}>
            <CardContent className="p-4 text-center">
              <Users className="h-8 w-8 mx-auto text-primary mb-2" />
              <p className="font-medium">Patients</p>
              <p className="text-xs text-muted-foreground">View your patients</p>
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover:shadow-lg transition" onClick={() => navigate('/chat')}>
            <CardContent className="p-4 text-center">
              <MessageSquare className="h-8 w-8 mx-auto text-primary mb-2" />
              <p className="font-medium">Messages</p>
              <p className="text-xs text-muted-foreground">Chat with patients</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs Section */}
        <Tabs defaultValue="about" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2 mx-auto">
            <TabsTrigger value="about" className="gap-1 md:gap-2">
              <Stethoscope className="h-4 w-4" />
              About
            </TabsTrigger>
            <TabsTrigger value="qualifications" className="gap-1 md:gap-2">
              <GraduationCap className="h-4 w-4" />
              Qualifications
            </TabsTrigger>
          </TabsList>

          <TabsContent value="about">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-primary" />
                  Professional Biography
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  {doctor?.bio || "No bio provided yet. Update your profile to add a professional biography."}
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="qualifications">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="h-5 w-5 text-primary" />
                  Educational Background
                </CardTitle>
              </CardHeader>
              <CardContent>
                {doctor?.qualifications?.length > 0 ? (
                  <div className="space-y-4">
                    {doctor.qualifications.map((qual, index) => (
                      <div key={index} className="flex items-start gap-4 p-4 bg-muted/30 rounded-lg">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <GraduationCap className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-semibold">{qual.degree}</h4>
                          <p className="text-sm text-muted-foreground">{qual.institution}</p>
                          <p className="text-xs text-muted-foreground mt-1">Year: {qual.year}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No qualifications listed</p>
                    <Button 
                      variant="outline" 
                      className="mt-2"
                      onClick={() => navigate('/doctor/profile/edit')}
                    >
                      Add Qualifications
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Settings Section */}
        <Separator className="my-8" />
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Account Settings
            </CardTitle>
            <CardDescription>
              Manage your profile and account settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/doctor/profile/edit')}>
              <Edit className="h-4 w-4 mr-2" />
              Edit Profile Information
            </Button>
            <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/doctor/availability')}>
              <Clock className="h-4 w-4 mr-2" />
              Manage Availability Slots
            </Button>
            <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/settings')}>
              <Settings className="h-4 w-4 mr-2" />
              Account Settings
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Loading Skeleton
function DoctorProfileSkeleton() {
  return (
    <div className="container max-w-5xl py-8">
      <div className="flex justify-between mb-6">
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-10 w-32" />
      </div>
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
      <Skeleton className="h-32 w-full mb-8" />
      <div className="grid grid-cols-4 gap-4 mb-8">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-lg" />
        ))}
      </div>
      <Skeleton className="h-96 rounded-lg" />
    </div>
  );
}