import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  Clock, 
  Users, 
  DollarSign, 
  Activity,
  TrendingUp,
  Star,
  MessageSquare,
  Settings,
  PlusCircle,
  ChevronRight
} from 'lucide-react';

export default function DoctorDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Mock data - Replace with actual API calls
  const stats = {
    todayAppointments: 3,
    totalPatients: 128,
    totalEarnings: 45600,
    pendingRequests: 5,
    rating: 4.8,
    totalReviews: 42,
    completedAppointments: 156,
    cancellationRate: '8%'
  };

  const todayAppointments = [
    { id: 1, time: "09:00 AM", patient: "Rajesh Kumar", type: "Follow-up", status: "pending" },
    { id: 2, time: "10:30 AM", patient: "Priya Sharma", type: "Consultation", status: "confirmed" },
    { id: 3, time: "02:00 PM", patient: "Amit Patel", type: "Checkup", status: "pending" },
  ];

  const recentPatients = [
    { id: 1, name: "Sneha Reddy", lastVisit: "2024-04-15", condition: "Hypertension" },
    { id: 2, name: "Vikram Singh", lastVisit: "2024-04-14", condition: "Diabetes" },
    { id: 3, name: "Neha Gupta", lastVisit: "2024-04-13", condition: "Thyroid" },
  ];

  const StatCard = ({ title, value, icon: Icon, description, trend, color }) => (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={`h-4 w-4 text-${color}-500`} />
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Welcome back, Dr. {user?.name?.split(' ')[0]}</h1>
          <p className="text-muted-foreground mt-1">
            Here's your practice overview for today
          </p>
        </div>
        <div className="flex gap-3">
          <Button onClick={() => navigate('/doctor/availability')} className="gap-2">
            <PlusCircle className="h-4 w-4" />
            Add Availability
          </Button>
          <Button variant="outline" onClick={() => navigate('/doctor/profile')} className="gap-2">
            <Settings className="h-4 w-4" />
            Profile
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Today's Appointments"
          value={stats.todayAppointments}
          icon={Calendar}
          description="Scheduled for today"
          color="blue"
        />
        <StatCard
          title="Total Patients"
          value={stats.totalPatients}
          icon={Users}
          description="Lifetime patients"
          trend="+12 this month"
          color="green"
        />
        <StatCard
          title="Total Earnings"
          value={`₹${stats.totalEarnings.toLocaleString()}`}
          icon={DollarSign}
          description="This month"
          trend="+8% from last month"
          color="yellow"
        />
        <StatCard
          title="Pending Requests"
          value={stats.pendingRequests}
          icon={Activity}
          description="Awaiting response"
          color="red"
        />
      </div>

      {/* Rating & Reviews */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-500 fill-current" />
              Your Rating
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="text-4xl font-bold">{stats.rating}</div>
              <div className="text-sm text-muted-foreground">
                Based on {stats.totalReviews} reviews
              </div>
            </div>
            <Button variant="outline" className="w-full mt-4" onClick={() => navigate('/doctor/reviews')}>
              View All Reviews
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Practice Statistics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Completed Appointments</span>
                <span className="font-semibold">{stats.completedAppointments}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Cancellation Rate</span>
                <span className="font-semibold">{stats.cancellationRate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Average Rating</span>
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 text-yellow-500 fill-current" />
                  <span className="font-semibold">{stats.rating}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Today's Schedule */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Today's Schedule
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={() => navigate('/doctor/appointments')}>
              View All
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
          <CardDescription>
            Your appointments for {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {todayAppointments.map((appointment) => (
              <div key={appointment.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition">
                <div className="flex items-center gap-4">
                  <div className="text-center min-w-[70px]">
                    <div className="text-sm font-semibold">{appointment.time}</div>
                  </div>
                  <div>
                    <p className="font-medium">{appointment.patient}</p>
                    <p className="text-sm text-muted-foreground">{appointment.type}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={appointment.status === 'confirmed' ? 'default' : 'secondary'}>
                    {appointment.status === 'confirmed' ? 'Confirmed' : 'Pending'}
                  </Badge>
                  <Button size="sm" variant="outline" className="gap-1">
                    <MessageSquare className="h-3 w-3" />
                    Message
                  </Button>
                </div>
              </div>
            ))}
            {todayAppointments.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No appointments scheduled for today</p>
                <p className="text-sm">Check your availability settings</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Recent Patients */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Recent Patients
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={() => navigate('/doctor/patients')}>
              View All
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
          <CardDescription>
            Patients you've recently consulted
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentPatients.map((patient) => (
              <div key={patient.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition">
                <div>
                  <p className="font-medium">{patient.name}</p>
                  <p className="text-sm text-muted-foreground">Last visit: {new Date(patient.lastVisit).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{patient.condition}</Badge>
                  <Button size="sm" variant="ghost">
                    View History
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-3">
        <Button 
          variant="outline" 
          className="h-auto py-4 flex flex-col gap-2"
          onClick={() => navigate('/doctor/availability')}
        >
          <Clock className="h-6 w-6" />
          <span>Update Availability</span>
          <span className="text-xs text-muted-foreground">Manage your time slots</span>
        </Button>
        <Button 
          variant="outline" 
          className="h-auto py-4 flex flex-col gap-2"
          onClick={() => navigate('/doctor/appointments')}
        >
          <Calendar className="h-6 w-6" />
          <span>View Appointments</span>
          <span className="text-xs text-muted-foreground">Accept/Reject requests</span>
        </Button>
        <Button 
          variant="outline" 
          className="h-auto py-4 flex flex-col gap-2"
          onClick={() => navigate('/doctor/earnings')}
        >
          <DollarSign className="h-6 w-6" />
          <span>Check Earnings</span>
          <span className="text-xs text-muted-foreground">View payment history</span>
        </Button>
      </div>
    </div>
  );
}