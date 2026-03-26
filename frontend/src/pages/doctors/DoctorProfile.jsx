import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, Clock, DollarSign, MapPin, Star } from "lucide-react";
import React from "react";
import { useParams } from "react-router-dom";

export default function DoctorProfile() {
  const { id } = useParams();

  //   console.log(id)

  const { user } = useAuth();

  const { data: doctor, isLoading } = useQuery({
    queryKey: ["doctor", id],
    queryFn: async () => {
      const response = await api.get(`/doctors/doctor/${id}`);
      console.log(response);
      return response;
    },
  });

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-64 bg-muted rounded-lg" />
          <div className="h-96 bg-muted rounded-lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <Button
        variant="ghost"
        className="mb-6"
        onClick={() => window.history.back()}
      >
        <ChevronLeft className="h-4 w-4 mr-2" />
        Back to Search
      </Button>

      {/* Profile Header */}
      <Card className="mb-8">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <Avatar className="h-24 w-24">
              <AvatarImage src={doctor?.profileImage.url} />
              <AvatarFallback>{doctor?.userId?.name?.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-bold">
                    Dr. {doctor?.userId?.name}
                  </h1>
                  <p className="text-lg text-muted-foreground">
                    {doctor?.specialization}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center">
                    <Star className="h-5 w-5 text-yellow-400 fill-current" />
                    <span className="ml-1 font-semibold">
                      {doctor?.rating.toFixed(1)}
                    </span>
                    <span className="ml-1 text-muted-foreground">
                      ({doctor?.totalReviews} reviews)
                    </span>
                  </div>
                  

                  <Badge
                  className="bg-green-400"
                    variant={
                      doctor?.status === "approved" ? "default" : "secondary"
                    }
                  >
                    {doctor?.status === "approved"
                      ? "Verified"
                      : "Pending Verification"}
                  </Badge>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <div className="flex items-center text-sm">
                  <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                  {doctor?.location}
                </div>
                <div className="flex items-center text-sm">
                  <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                  {doctor?.experience} years experience
                </div>
                <div className="flex items-center text-sm font-medium">
                  <DollarSign className="h-4 w-4 mr-2 text-green-600" />₹
                  {doctor?.consultationFee} per consultation
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* <div>{doctor}</div> */}
    </div>
  );
}
