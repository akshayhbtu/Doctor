import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import api from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { Calendar, Clock, Icon, Star, TrendingUp, User } from "lucide-react";
import React, { Activity } from "react";
import { Link } from "react-router-dom";

const StatCard = ({ title, value, icon: Icon, description, trend }) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <Icon className="h-4 w-4 text-muted-foreground" />
    </CardHeader>

    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      <p className="text-xs text-muted-foreground">{description}</p>
      {trend && (
        <div className="flex items-center mt-2 text-xs text-green-600">
          <TrendingUp className="h-3 w-3 mr-1" />
          {trend}
        </div>
      )}
    </CardContent>
  </Card>
);



export default function PatientDashboard() {

    const {data: stats, isLoading}= useQuery({
        queryKey:['patientStats'],
        queryFn: async()=>{
            const response= await api.get('/appointment/user');
            // console.log(response)
            return response.data;
        }
    })


  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Welcome back!</h1>
        <Button asChild>
          <Link to="/doctors/search">
            <User className="mr-2 h-4 w-4" />
            Find a Doctor
          </Link>
        </Button>
      </div>

      {/* stats grid */}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Appointments"
          value={stats?.totalAppointments || 0}
          icon={Calendar}
          description="All time appointments"
          trend="+12% from last month"
        />
        <StatCard
          title="Upcoming"
          value={stats?.upcomingAppointments || 0}
          icon={Clock}
          description="Scheduled appointments"
        />
        <StatCard
          title="Completed"
          value={stats?.completedAppointments || 0}
          icon={Activity}
          description="Successfully completed"
        />
        <StatCard
          title="Reviews Given"
          value={stats?.totalReviews || 0}
          icon={Star}
          description="Your feedback matters"
        />
      </div>



    </div>
  );
}
