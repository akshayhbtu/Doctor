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
  Phone,
  Mail,
  CheckCircle,
  XCircle,
  AlertCircle,
  Calendar as CalendarIcon,
  Loader2,
  MessageSquare,
  ChevronRight,
} from 'lucide-react';

export default function DoctorAppointment() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('pending');

  // Fetch doctor's appointments
  const { data: appointmentsData, isLoading, refetch } = useQuery({
    queryKey: ['doctorAppointments', user?._id],
    queryFn: async () => {
      const response = await api.get('/appointment/doctor');
      console.log('Doctor appointments:', response);
      return response;
    },
    enabled: !!user?._id,
  });

  // Update appointment status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ appointmentId, status }) => {
      const response = await api.put(`/appointment/${appointmentId}/status`, { status });
      return response;
    },
    onSuccess: () => {
      toast.success('Appointment status updated!');
      refetch();
      queryClient.invalidateQueries(['doctorAppointments']);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update status');
    },
  });

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

  const handleStatusUpdate = (appointmentId, status) => {
    if (window.confirm(`Are you sure you want to ${status} this appointment?`)) {
      updateStatusMutation.mutate({ appointmentId, status });
    }
  };

  const handleChat = (appointmentId) => {
    navigate(`/chat/${appointmentId}`);
  };

  const getFilteredAppointments = () => {
    if (!appointmentsData?.appointments) return [];
    
    if (activeTab === 'all') {
      return appointmentsData.appointments;
    }
    return appointmentsData.appointments.filter(apt => apt.status === activeTab);
  };

  const filteredAppointments = getFilteredAppointments();
  const stats = {
    pending: appointmentsData?.appointments?.filter(apt => apt.status === 'pending').length || 0,
    approved: appointmentsData?.appointments?.filter(apt => apt.status === 'approved').length || 0,
    completed: appointmentsData?.appointments?.filter(apt => apt.status === 'completed').length || 0,
    total: appointmentsData?.appointments?.length || 0,
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
    const patient = appointment.patientId;

    return (
      <Card className="hover:shadow-lg transition-shadow">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Patient Info */}
            <div className="flex items-start gap-4 flex-1">
              <Avatar className="h-16 w-16">
                <AvatarFallback className="bg-primary/10 text-primary text-lg">
                  {patient?.name?.charAt(0) || 'P'}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-lg font-semibold">{patient?.name || 'Patient'}</h3>
                <div className="flex flex-wrap gap-3 mt-2">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Phone className="h-3 w-3" />
                    {patient?.phone || 'N/A'}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Mail className="h-3 w-3" />
                    {patient?.email || 'N/A'}
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
                {appointment.status === 'pending' && (
                  <>
                    <Button
                      size="sm"
                      className="bg-black cursor-pointer hover:bg-gray-600"
                      onClick={() => handleStatusUpdate(appointment._id, 'approved')}
                      disabled={updateStatusMutation.isPending}
                    >
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Approve
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="bg-white cursor-pointer text-black hover:bg-gray-700 hover:text-white border-gray-800"
                      onClick={() => handleStatusUpdate(appointment._id, 'rejected')}
                      disabled={updateStatusMutation.isPending}
                    >
                      <XCircle className="h-3 w-3 mr-1" />
                      Reject
                    </Button>
                  </>
                )}
                {appointment.status === 'approved' && (
                  <Button
                    size="sm"
                    className="bg-blue-500 hover:bg-blue-600"
                    onClick={() => handleStatusUpdate(appointment._id, 'completed')}
                    disabled={updateStatusMutation.isPending}
                  >
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Mark Completed
                  </Button>
                )}
                {(appointment.status === 'approved' || appointment.status === 'completed') && (
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
        <h1 className="text-3xl font-bold">Appointment Requests</h1>
        <p className="text-muted-foreground mt-1">
          Manage and respond to patient appointment requests
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">Total Appointments</p>
          </CardContent>
        </Card>
        <Card className="border-yellow-200 bg-yellow-50/50">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            <p className="text-xs text-muted-foreground">Pending</p>
          </CardContent>
        </Card>
        <Card className="border-green-200 bg-green-50/50">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
            <p className="text-xs text-muted-foreground">Approved</p>
          </CardContent>
        </Card>
        <Card className="border-blue-200 bg-blue-50/50">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-blue-600">{stats.completed}</div>
            <p className="text-xs text-muted-foreground">Completed</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-4">
          <TabsTrigger value="pending" className="gap-2">
            Pending
          </TabsTrigger>
          <TabsTrigger value="approved" className="gap-2">
            Approved
          </TabsTrigger>
          <TabsTrigger value="completed" className="gap-2">
            Completed
          </TabsTrigger>
          <TabsTrigger value="all" className="gap-2">
            All
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          {filteredAppointments.length > 0 ? (
            filteredAppointments.map((appointment) => (
              <AppointmentCard key={appointment._id} appointment={appointment} />
            ))
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <CalendarIcon className="h-12 w-12 mx-auto text-muted-foreground mb-3 opacity-50" />
                <p className="text-muted-foreground">No {activeTab} appointments found</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}