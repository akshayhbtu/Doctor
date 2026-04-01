
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import {
  Avatar,
  AvatarBadge,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"


import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import { Badge } from '../../components/ui/badge';



import { Textarea } from "@/components/ui/textarea"


import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"




import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"


import { 
  CheckCircle, 
  XCircle, 
  Eye, 
  Loader2, 
  UserCheck, 
  UserX,
  Clock,
  FileText,
  Hospital,
  MapPin,
  DollarSign,
  GraduationCap,
  Calendar,
  Briefcase
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import api from '@/lib/api';

const DoctorApprovals = () => {
  const queryClient = useQueryClient();
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);

  // Fetch pending doctors
  const { data: pendingDoctors, isLoading: pendingLoading } = useQuery({
    queryKey: ['pendingDoctors'],
    queryFn: async () => {
      const response = await api.get('/admin/doctor/pending');
      return response.data;
    },
  });

  // Fetch approved doctors
  const { data: approvedDoctors, isLoading: approvedLoading } = useQuery({
    queryKey: ['approvedDoctors'],
    queryFn: async () => {
      const response = await api.get('/admin/doctor/approved');
      return response.data;
    },
  });

  // Fetch rejected doctors
  const { data: rejectedDoctors, isLoading: rejectedLoading } = useQuery({
    queryKey: ['rejectedDoctors'],
    queryFn: async () => {
      const response = await api.get('/admin/doctor/rejected');
      return response.data;
    },
  });

  // Approve Doctor Mutation
  const approveMutation = useMutation({
    mutationFn: async (doctorId) => {
      const response = await api.put(`/admin/doctor/${doctorId}/approve`);
      return response.data;
    },
    onSuccess: () => {
      toast.success('Doctor approved successfully!');
      queryClient.invalidateQueries(['pendingDoctors']);
      queryClient.invalidateQueries(['approvedDoctors']);
      setShowDetailsDialog(false);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to approve doctor');
    },
  });

  // Reject Doctor Mutation
  const rejectMutation = useMutation({
    mutationFn: async ({ doctorId, reason }) => {
      const response = await api.put(`/admin/doctors/${doctorId}/reject`, { reason });
      return response.data;
    },
    onSuccess: () => {
      toast.success('Doctor rejected successfully!');
      queryClient.invalidateQueries(['pendingDoctors']);
      queryClient.invalidateQueries(['rejectedDoctors']);
      setShowRejectDialog(false);
      setRejectReason('');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to reject doctor');
    },
  });

  const handleApprove = (doctor) => {
    setSelectedDoctor(doctor);
    approveMutation.mutate(doctor._id);
  };

  const handleReject = () => {
    if (!rejectReason.trim()) {
      toast.error('Please provide a reason for rejection');
      return;
    }
    rejectMutation.mutate({ 
      doctorId: selectedDoctor._id, 
      reason: rejectReason 
    });
  };

  const openRejectDialog = (doctor) => {
    setSelectedDoctor(doctor);
    setShowRejectDialog(true);
  };

  const openDetailsDialog = (doctor) => {
    setSelectedDoctor(doctor);
    setShowDetailsDialog(true);
  };

  const DoctorCard = ({ doctor, type }) => {
    const getStatusBadge = () => {
      switch (doctor.status) {
        case 'pending':
          return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Pending</Badge>;
        case 'approved':
          return <Badge variant="default" className="bg-green-100 text-green-800">Approved</Badge>;
        case 'rejected':
          return <Badge variant="destructive" className="bg-red-100 text-red-800">Rejected</Badge>;
        default:
          return <Badge variant="outline">Unknown</Badge>;
      }
    };

    return (
      <Card className="hover:shadow-lg transition-shadow ">
        <CardHeader className="pb-3 ">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-4">
              <Avatar className="h-12 w-12">
                <AvatarImage src={doctor.profileImage?.url} />
                <AvatarFallback>
                  {doctor.userId?.name?.charAt(0) || 'D'}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-lg">
                  Dr. {doctor.userId?.name}
                </CardTitle>
                <CardDescription>{doctor.specialization}</CardDescription>
              </div>
            </div>
            {getStatusBadge()}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <Hospital className="h-4 w-4 text-muted-foreground" />
              <span>{doctor.hospital}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span>{doctor.location}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>{doctor.experience} years experience</span>
            </div>
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <span>₹{doctor.consultationFee} per consultation</span>
            </div>
            {doctor.rejectionReason && (
              <div className="mt-2 p-2 bg-red-50 dark:bg-red-950/20 rounded">
                <p className="text-xs text-red-600">
                  <strong>Rejection Reason:</strong> {doctor.rejectionReason}
                </p>
              </div>
            )}
          </div>

          <div className="flex gap-2 mt-4">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1"
              onClick={() => openDetailsDialog(doctor)}
            >
              <Eye className="h-4 w-4 mr-1" />
              View Details
            </Button>
            
            {type === 'pending' && (
              <>
                <Button 
                  size="sm" 
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  onClick={() => handleApprove(doctor)}
                  disabled={approveMutation.isPending}
                >
                  {approveMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Approve
                    </>
                  )}
                </Button>
                <Button 
                  variant="destructive" 
                  size="sm" 
                  className="flex-1"
                  onClick={() => openRejectDialog(doctor)}
                >
                  <XCircle className="h-4 w-4 mr-1" />
                  Reject
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  const DoctorDetailsDialog = () => {
    if (!selectedDoctor) return null;

    return (
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-6xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">Doctor Application Details</DialogTitle>
            <DialogDescription>
              Review the doctor's credentials and application information
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Profile Header */}
            <div className="flex items-center gap-4 pb-4 border-b">
              <Avatar className="h-20 w-20">
                <AvatarImage src={selectedDoctor.profileImage?.url} />
                <AvatarFallback>DR</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-xl font-bold">
                  Dr. {selectedDoctor.userId?.name}
                </h3>
                <p className="text-muted-foreground">{selectedDoctor.userId?.email}</p>
                <p className="text-muted-foreground">{selectedDoctor.userId?.phoneNumber}</p>
              </div>
            </div>

            {/* Professional Details */}
            <div>
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <Briefcase className="h-4 w-4" />
                Professional Information
              </h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Specialization</p>
                  <p className="font-medium">{selectedDoctor.specialization}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Experience</p>
                  <p className="font-medium">{selectedDoctor.experience} years</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Hospital/Clinic</p>
                  <p className="font-medium">{selectedDoctor.hospital}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Location</p>
                  <p className="font-medium">{selectedDoctor.location}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Consultation Fee</p>
                  <p className="font-medium text-green-600">₹{selectedDoctor.consultationFee}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Applied On</p>
                  <p className="font-medium">
                    {new Date(selectedDoctor.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Qualifications */}
            <div>
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <GraduationCap className="h-4 w-4" />
                Qualifications
              </h4>
              <div className="space-y-3">
                {selectedDoctor.qualifications?.map((qual, index) => (
                  <div key={index} className="p-3 bg-muted rounded-lg">
                    <p className="font-medium">{qual.degree}</p>
                    <p className="text-sm text-muted-foreground">
                      {qual.institution} • {qual.year}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Bio */}
            {selectedDoctor.bio && (
              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Professional Bio
                </h4>
                <p className="text-sm text-muted-foreground bg-muted p-3 rounded-lg">
                  {selectedDoctor.bio}
                </p>
              </div>
            )}
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowDetailsDialog(false)}>
              Close
            </Button>
            {selectedDoctor.status === 'pending' && (
              <>
                <Button 
                  variant="default" 
                  className="bg-green-600 hover:bg-green-700"
                  onClick={() => {
                    handleApprove(selectedDoctor);
                  }}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Approve Application
                </Button>
                <Button 
                  variant="destructive"
                  onClick={() => {
                    setShowDetailsDialog(false);
                    openRejectDialog(selectedDoctor);
                  }}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject Application
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  };

  const RejectDialog = () => (
    <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reject Doctor Application</DialogTitle>
          <DialogDescription>
            Please provide a reason for rejecting Dr. {selectedDoctor?.userId?.name}'s application.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <Textarea
            placeholder="Enter rejection reason..."
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            rows={4}
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
            Cancel
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleReject}
            disabled={rejectMutation.isPending}
          >
            {rejectMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Confirm Rejection
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Doctor Approvals</h1>
          <p className="text-muted-foreground mt-1">
            Review and manage doctor registration applications
          </p>
        </div>
      </div>

      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pending" className="relative">
            Pending
            {pendingDoctors?.length > 0 && (
              <Badge variant="secondary" className="ml-2 bg-yellow-500 text-white">
                {pendingDoctors.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="approved">
            Approved
            {approvedDoctors?.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {approvedDoctors.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="rejected">
            Rejected
            {rejectedDoctors?.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {rejectedDoctors.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          {pendingLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : pendingDoctors?.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {pendingDoctors.map((doctor) => (
                <DoctorCard key={doctor._id} doctor={doctor} type="pending" />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Clock className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No pending doctor applications</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="approved" className="space-y-4">
          {approvedLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : approvedDoctors?.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {approvedDoctors.map((doctor) => (
                <DoctorCard key={doctor._id} doctor={doctor} type="approved" />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <UserCheck className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No approved doctors yet</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="rejected" className="space-y-4">
          {rejectedLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : rejectedDoctors?.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {rejectedDoctors.map((doctor) => (
                <DoctorCard key={doctor._id} doctor={doctor} type="rejected" />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <UserX className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No rejected applications</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      <DoctorDetailsDialog />
      <RejectDialog />
    </div>
  );
};

export default DoctorApprovals;