// frontend/src/pages/chat/ChatList.jsx
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import {
  MessageSquare,
  Calendar,
  Clock,
  ChevronRight,
  Users,
  Stethoscope,
  Hospital,
  Mail,
  Phone,
  Search,
  Filter,
} from 'lucide-react';
import { Input } from '@/components/ui/input';

export default function ChatList() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch all appointments where chat exists
  const { data: chatList, isLoading } = useQuery({
    queryKey: ['chatList', user?._id],
    queryFn: async () => {
      // Get all appointments for the user
      let endpoint = '';
      if (user?.role === 'user') {
        endpoint = '/appointment/user/all';
      } else if (user?.role === 'doctor') {
        endpoint = '/appointment/doctor/all';
      }
      
      const response = await api.get(endpoint);
      console.log('Chat list response:', response);
      return response;
    },
    enabled: !!user?._id,
  });

  // Filter chats based on search
  const filteredChats = () => {
    if (!chatList?.appointments) return [];
    
    if (user?.role === 'user') {
      return chatList.appointments.filter(apt => 
        apt.doctorId?.userId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        apt.doctorId?.specialization?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    } else {
      return chatList.appointments.filter(apt => 
        apt.patientId?.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
  };

  const chats = filteredChats();

  const handleOpenChat = (appointmentId) => {
    navigate(`/chat/${appointmentId}`);
  };

  const getOtherPerson = (appointment) => {
    if (user?.role === 'user') {
      // Patient sees doctor
      const doctor = appointment.doctorId;
      return {
        id: doctor?._id,
        name: `Dr. ${doctor?.userId?.name || 'Doctor'}`,
        role: 'doctor',
        specialization: doctor?.specialization,
        hospital: doctor?.hospital,
        image: doctor?.profileImage?.url,
        email: doctor?.userId?.email,
        phone: doctor?.userId?.phoneNumber,
      };
    } else {
      // Doctor sees patient
      const patient = appointment.patientId;
      return {
        id: patient?._id,
        name: patient?.name || 'Patient',
        role: 'patient',
        email: patient?.email,
        phone: patient?.phoneNumber,
        image: patient?.profileImage,
      };
    }
  };

  if (isLoading) {
    return (
      <div className="container max-w-4xl py-8">
        <div className="space-y-4">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-12 w-full" />
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <MessageSquare className="h-7 w-7" />
          Messages
        </h1>
        <p className="text-muted-foreground mt-1">
          {user?.role === 'user' 
            ? 'Chat with your doctors about appointments' 
            : 'Chat with your patients about their health'}
        </p>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={user?.role === 'user' 
              ? "Search by doctor name or specialization..." 
              : "Search by patient name..."}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Chat List */}
      {chats.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-3 opacity-50" />
            <p className="text-muted-foreground">No conversations yet</p>
            <p className="text-sm text-muted-foreground">
              {user?.role === 'user' 
                ? 'Book an appointment with a doctor to start chatting' 
                : 'When patients book appointments, you can chat with them here'}
            </p>
            {user?.role === 'user' && (
              <Button 
                className="mt-4"
                variant="outline"
                onClick={() => navigate('/doctors/search')}
              >
                Find a Doctor
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {chats.map((appointment) => {
            const otherPerson = getOtherPerson(appointment);
            const appointmentDate = new Date(appointment.appointmentDate);
            const isUpcoming = appointmentDate >= new Date() && appointment.status === 'approved';
            
            return (
              <Card 
                key={appointment._id}
                className="hover:shadow-lg transition-all cursor-pointer hover:border-primary/50"
                onClick={() => handleOpenChat(appointment._id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    {/* Avatar */}
                    <Avatar className="h-14 w-14">
                      <AvatarImage src={otherPerson.image} />
                      <AvatarFallback className="bg-primary/10 text-primary text-lg">
                        {otherPerson.name?.charAt(0)?.toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>

                    {/* Info */}
                    <div className="flex-1">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div>
                          <h3 className="font-semibold text-lg">
                            {otherPerson.name}
                            {otherPerson.role === 'doctor' && (
                              <Badge variant="outline" className="ml-2 text-xs">
                                Doctor
                              </Badge>
                            )}
                          </h3>
                          {otherPerson.role === 'doctor' ? (
                            <div className="flex flex-wrap gap-3 mt-1">
                              <p className="text-xs text-muted-foreground flex items-center gap-1">
                                <Stethoscope className="h-3 w-3" />
                                {otherPerson.specialization}
                              </p>
                              <p className="text-xs text-muted-foreground flex items-center gap-1">
                                <Hospital className="h-3 w-3" />
                                {otherPerson.hospital}
                              </p>
                            </div>
                          ) : (
                            <div className="flex flex-wrap gap-3 mt-1">
                              <p className="text-xs text-muted-foreground flex items-center gap-1">
                                <Mail className="h-3 w-3" />
                                {otherPerson.email}
                              </p>
                              <p className="text-xs text-muted-foreground flex items-center gap-1">
                                <Phone className="h-3 w-3" />
                                {otherPerson.phone}
                              </p>
                            </div>
                          )}
                        </div>
                        <div className="text-right">
                          <Badge 
                            variant={appointment.status === 'approved' ? 'default' : 'secondary'}
                            className={`text-xs ${
                              appointment.status === 'approved' 
                                ? 'bg-green-500' 
                                : appointment.status === 'pending' 
                                ? 'bg-yellow-500' 
                                : 'bg-gray-500'
                            }`}
                          >
                            {appointment.status}
                          </Badge>
                          <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {format(appointmentDate, 'dd MMM yyyy')}
                          </div>
                          <div className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {appointment.timeSlot?.startTime} - {appointment.timeSlot?.endTime}
                          </div>
                        </div>
                      </div>

                      {/* Last Message Preview */}
                      <div className="mt-2 pt-2 border-t flex items-center justify-between">
                        <p className="text-sm text-muted-foreground truncate max-w-md">
                          {appointment.lastMessage || 'Click to start chatting'}
                        </p>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}