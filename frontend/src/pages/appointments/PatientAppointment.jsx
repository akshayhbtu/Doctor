import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Calendar,
  Clock,
  MapPin,
  DollarSign,
  MessageSquare,
  Star,
  FileText,
  ChevronRight,
  Calendar as CalendarIcon,
  Loader2,
  CheckCircle,
  XCircle,
  AlertCircle,
  Phone,
  Mail,
  Video,
} from 'lucide-react';

export default function PatientAppointment() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('upcoming');

  // Fetch user's appointments (using /user endpoint)
  const { data: appointmentsData, isLoading, refetch } = useQuery({
    queryKey: ['patientAppointments', user?._id],
    queryFn: async () => {
      const response = await api.get('/appointment/user');
      console.log('Appointments response:', response);
      return response;
    },
    enabled: !!user?._id,
  });

  // Fetch upcoming appointments
  const { data: upcomingData } = useQuery({
    queryKey: ['upcomingAppointments', user?._id],
    queryFn: async () => {
      const response = await api.get('/appointment/user/upcoming');
      return response;
    },
    enabled: !!user?._id,
  });

  // Fetch appointment history
  const { data: historyData } = useQuery({
    queryKey: ['appointmentHistory', user?._id],
    queryFn: async () => {
      const response = await api.get('/appointment/user/history');
      return response;
    },
    enabled: !!user?._id,
  });

  // Cancel appointment mutation (using status update)
  const cancelAppointmentMutation = useMutation({
    mutationFn: async (appointmentId) => {
      const response = await api.put(`/appointment/${appointmentId}/status`, {
        status: 'cancelled',
      });
      return response;
    },
    onSuccess: () => {
      toast.success('Appointment cancelled successfully!');
      refetch();
      queryClient.invalidateQueries(['patientAppointments']);
      queryClient.invalidateQueries(['upcomingAppointments']);
      queryClient.invalidateQueries(['appointmentHistory']);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to cancel appointment');
    },
  });

  // Get status badge
  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return { color: 'bg-yellow-500', icon: <Clock className="h-3 w-3" />, label: 'Pending' };
      case 'approved':
        return { color: 'bg-green-500', icon: <CheckCircle className="h-3 w-3" />, label: 'Approved' };
      case 'rejected':
        return { color: 'bg-red-500', icon: <XCircle className="h-3 w-3" />, label: 'Rejected' };
      case 'completed':
        return { color: 'bg-blue-500', icon: <CheckCircle className="h-3 w-3" />, label: 'Completed' };
      case 'cancelled':
        return { color: 'bg-gray-500', icon: <XCircle className="h-3 w-3" />, label: 'Cancelled' };
      default:
        return { color: 'bg-gray-500', icon: <AlertCircle className="h-3 w-3" />, label: status };
    }
  };

  // Get appointments based on active tab
  const getAppointments = () => {
    if (activeTab === 'upcoming') {
      return upcomingData?.data || [];
    } else if (activeTab === 'past') {
      return historyData?.data || [];
    } else {
      return appointmentsData || [];
    }
  };

  const appointments = getAppointments();
  const stats = appointmentsData || {};

  const handleCancelAppointment = (appointmentId) => {
    if (window.confirm('Are you sure you want to cancel this appointment?')) {
      cancelAppointmentMutation.mutate(appointmentId);
    }
  };

  const handleChat = (appointmentId) => {
    navigate(`/chat/${appointmentId}`);
  };

  const handleViewDetails = (appointmentId) => {
    navigate(`/appointments/${appointmentId}`);
  };

  const handleReview = (appointmentId, doctorId) => {
    navigate(`/review/${appointmentId}?doctorId=${doctorId}`);
  };

  if (isLoading) {
    return (
      <div className="container max-w-5xl py-8">
        <div className="space-y-4">
          <Skeleton className="h-10 w-64" />
          <div className="grid grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-24" />
            ))}
          </div>
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }

  const AppointmentCard = ({ appointment }) => {
    const statusBadge = getStatusBadge(appointment.status);
    const appointmentDate = new Date(appointment.appointmentDate);
    const isUpcoming = appointmentDate >= new Date() && appointment.status === 'approved';
    const canReview = appointment.status === 'completed';
    const canChat = appointment.status === 'approved';

    // Handle both response formats (direct or nested in doctor object)
    const doctor = appointment.doctor || appointment.doctorId;
    const doctorUser = doctor?.userId || doctor;
    const doctorName = doctorUser?.name || doctor?.name || 'Doctor';
    const doctorSpecialization = doctor?.specialization || 'General Physician';
    const doctorLocation = doctor?.location || 'Not specified';
    const doctorFee = doctor?.consultationFee || 0;
    const doctorRating = doctor?.rating || 0;
    const doctorImage = doctor?.profileImage?.url || doctor?.profileImage;

    return (
      <Card className="hover:shadow-lg transition-shadow">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Doctor Avatar & Info */}
            <div className="flex items-start gap-4 flex-1">
              <Avatar className="h-16 w-16">
                <AvatarImage src={doctorImage} />
                <AvatarFallback className="bg-primary/10 text-primary text-lg">
                  {doctorName?.charAt(0) || 'D'}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-lg font-semibold">
                  Dr. {doctorName}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {doctorSpecialization}
                </p>
                <div className="flex flex-wrap gap-3 mt-2">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    {doctorLocation}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <DollarSign className="h-3 w-3" />
                    ₹{doctorFee}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Star className="h-3 w-3" />
                    {doctorRating?.toFixed(1) || 'New'}
                  </div>
                </div>
              </div>
            </div>

            {/* Appointment Details */}
            <div className="flex flex-col items-start md:items-end gap-2">
              <Badge className={`${statusBadge.color} text-white gap-1`}>
                {statusBadge.icon}
                {statusBadge.label}
              </Badge>
              <div className="text-sm">
                <div className="flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                  <span>{format(appointmentDate, 'EEEE, dd MMM yyyy')}</span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>{appointment.timeSlot?.startTime} - {appointment.timeSlot?.endTime}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-2 mt-3">
                {isUpcoming && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleCancelAppointment(appointment._id)}
                    disabled={cancelAppointmentMutation.isPending}
                  >
                    Cancel
                  </Button>
                )}
                {canChat && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleChat(appointment._id)}
                    className="gap-1"
                  >
                    <MessageSquare className="h-3 w-3" />
                    Chat
                  </Button>
                )}
                {canReview && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleReview(appointment._id, doctor?._id)}
                    className="gap-1"
                  >
                    <Star className="h-3 w-3" />
                    Review
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleViewDetails(appointment._id)}
                  className="gap-1"
                >
                  Details
                  <ChevronRight className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>

          {/* Symptoms */}
          {appointment.symptoms && (
            <div className="mt-4 pt-3 border-t">
              <p className="text-xs text-muted-foreground">
                <span className="font-medium">Symptoms:</span> {appointment.symptoms}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="container max-w-5xl py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold">My Appointments</h1>
        <p className="text-muted-foreground mt-1">
          View and manage all your appointments
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{stats.totalAppointments || 0}</div>
            <p className="text-xs text-muted-foreground">Total Appointments</p>
          </CardContent>
        </Card>
        <Card className="border-green-200 bg-green-50/50">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">{stats.upcomingAppointments || 0}</div>
            <p className="text-xs text-muted-foreground">Upcoming</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{stats.completedAppointments || 0}</div>
            <p className="text-xs text-muted-foreground">Completed</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{stats.totalReviews || 0}</div>
            <p className="text-xs text-muted-foreground">Reviews Given</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="upcoming" className="gap-2">
            <Calendar className="h-4 w-4" />
            Upcoming
          </TabsTrigger>
          <TabsTrigger value="past" className="gap-2">
            <Clock className="h-4 w-4" />
            Past
          </TabsTrigger>
          <TabsTrigger value="all" className="gap-2">
            <FileText className="h-4 w-4" />
            All
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          {appointments && appointments.length > 0 ? (
            appointments.map((appointment) => (
              <AppointmentCard key={appointment._id} appointment={appointment} />
            ))
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <CalendarIcon className="h-12 w-12 mx-auto text-muted-foreground mb-3 opacity-50" />
                <p className="text-muted-foreground">No appointments found</p>
                <Button 
                  className="mt-4"
                  variant="outline"
                  onClick={() => navigate('/doctors/search')}
                >
                  Find a Doctor
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}