import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import api from "@/lib/api";
import { Progress } from "@/components/ui/progress";
import { useQuery } from "@tanstack/react-query";
import {
  Calendar,
  Activity,
  Clock,
  Icon,
  Star,
  TrendingUp,
  User,
  ChevronRight,
  MessageSquare,
} from "lucide-react";

import { Link } from "react-router-dom";

// import defaultImage from "../../assets/doc3.png";
// import { Progress } from "radix-ui";

const StatCard = ({ title, value, icon: Icon, description, trend, color }) => {
  // Color mapping for different card styles
  const colorStyles = {
    blue: {
      bg: "bg-blue-50 dark:bg-blue-950/20",
      icon: "text-blue-600 dark:text-blue-400",
      border: "border-blue-200 dark:border-blue-600",
      trend: "text-blue-600 dark:text-blue-400",
    },
    green: {
      bg: "bg-green-50 dark:bg-green-950/20",
      icon: "text-green-600 dark:text-green-400",
      border: "border-green-200 dark:border-green-600",
      trend: "text-green-600 dark:text-green-400",
    },
    purple: {
      bg: "bg-purple-50 dark:bg-purple-950/20",
      icon: "text-purple-600 dark:text-purple-400",
      border: "border-purple-200 dark:border-purple-600",
      trend: "text-purple-600 dark:text-purple-400",
    },
    orange: {
      bg: "bg-orange-50 dark:bg-orange-950/20",
      icon: "text-orange-600 dark:text-orange-400",
      border: "border-orange-200 dark:border-orange-600",
      trend: "text-orange-600 dark:text-orange-400",
    },
  };

  const style = colorStyles[color] || colorStyles.blue;

  return (
    <Card
      className={`${style.bg} ${style.border} transition-all hover:shadow-lg`}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={`h-4 w-4 text-muted-foreground ${style.icon} `} />
      </CardHeader>

      <CardContent>
        <div className={`text-2xl font-bold `}>{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
        {trend && (
          <div className={`flex items-center mt-2 text-xs ${style.trend}`}>
            <TrendingUp className="h-3 w-3 mr-1" />
            {trend}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default function PatientDashboard() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["patientStats"],
    queryFn: async () => {
      const response = await api.get("/appointment/user");
      // console.log(response);

      if (!response) {
        return {
          totalAppointments: 0,
          upcomingAppointments: 0,
          completedAppointments: 0,
          totalReviews: 0,
        };
      }

      return response;
    },
  });

  // get upcoming appointments

  const { data: upcomingData, isLoading: upcomingLoading } = useQuery({
    queryKey: ["upcomingAppointments"],
    queryFn: async () => {
      const response = await api.get("/appointment/user/upcoming");
      // console.log(response.data);
      return response.data;
    },
  });

  const upcomingAppointments = upcomingData || [];

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
          color="blue"
          description="All time appointments"
          trend="+12% from last month"
        />
        <StatCard
          title="Upcoming"
          value={stats?.upcomingAppointments || 0}
          icon={Clock}
          color="green"
          description="Scheduled appointments"
        />
        <StatCard
          title="Completed"
          value={stats?.completedAppointments || 0}
          icon={Activity}
          color="purple"
          description="Successfully completed"
        />
        <StatCard
          title="Reviews Given"
          value={stats?.totalReviews || 0}
          icon={Star}
          color="orange"
          description="Your feedback matters"
        />
      </div>

      {/* Upcoming Appointments */}

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle className="text-green-600 font-bold">
              Upcoming Appointments
            </CardTitle>
          </CardHeader>
          <CardContent>
            {upcomingAppointments?.length > 0 ? (
              <div className="space-y-4">
                {upcomingAppointments.map((appointment) => (
                  <div
                    key={appointment._id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                         {appointment.doctor?.profileImage ? (
                          <img
                              src={appointment.doctor.profileImage}
                              alt="doctor"
                              className="h-full w-full object-cover"
                          />
                           ) : (
                         <User className="h-5 w-5 text-primary" />
                            )}
                      </div>
                      <div>
                        <p className="font-medium">
                          Dr. {appointment.doctor?.name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(
                            appointment.appointmentDate,
                          ).toLocaleDateString()}{" "}
                          at {appointment.timeSlot?.startTime}
                        </p>
                      </div>
                    </div>
                    <Badge
                      variant={
                        appointment.status === "approved"
                          ? "default"
                          : appointment.status === "pending"
                            ? "secondary"
                            : "destructive"
                      }
                    >
                      {appointment.status}
                    </Badge>
                  </div>
                ))}
                <Button variant="outline" className="w-full" asChild>
                  <Link to="/appointments" >
                    View All Appointments
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-4">
                  No upcoming appointments
                </p>
                <Button asChild>
                  <Link to="/doctors/search">Book an Appointment</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Messages */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle className="text-blue-600 font-bold">Recent Messages</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="flex items-center space-x-4 p-3 border rounded-lg"
                >
                  <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center">
                    <MessageSquare className="h-5 w-5 text-blue-500" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Dr. Sarah Johnson</p>
                    <p className="text-xs text-muted-foreground">
                      Your appointment has been confirmed...
                    </p>
                  </div>
                  <Badge variant="outline">2h ago</Badge>
                </div>
              ))}
              <Button variant="outline" className="w-full" asChild>
                <Link to="/chat">
                  View All Messages
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>


       {/* Health Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Your Health Journey</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Appointment Completion Rate</span>
                <span className="font-medium">85%</span>
              </div>
              <Progress value={85} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Regular Check-ups</span>
                <span className="font-medium">4/6 this year</span>
              </div>
              <Progress value={66} className="h-2" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>

  );
}
