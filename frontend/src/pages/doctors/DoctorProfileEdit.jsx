import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';
import { toast } from 'sonner';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import {
  ChevronLeft,
  Upload,
  X,
  Plus,
  Trash2,
  Loader2,
  GraduationCap,
  Save,
  User,
  Mail,
  Phone,
  MapPin,
  DollarSign,
  Clock,
  Hospital,
  Stethoscope,
  BookOpen
} from 'lucide-react';

export default function DoctorProfileEdit() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    specialization: '',
    experience: '',
    hospital: '',
    consultationFee: '',
    location: '',
    bio: '',
    qualifications: []
  });
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [newQualification, setNewQualification] = useState({
    degree: '',
    institution: '',
    year: new Date().getFullYear()
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch doctor's current profile
  const { data: doctor, isLoading } = useQuery({
    queryKey: ['doctorProfile', user?._id],
    queryFn: async () => {
      const response = await api.get(`/doctors/user/${user?._id}`);
      return response;
    },
    enabled: !!user?._id && user?.role === 'doctor',
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data) => {
      const response = await api.put('/doctors/update-profile', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response;
    },
    onSuccess: () => {
      toast.success('Profile updated successfully!');
      queryClient.invalidateQueries(['doctorProfile']);
      setTimeout(() => {
        navigate('/doctor/profile');
      }, 1500);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    },
  });

  // Set form data when doctor data is loaded
  useEffect(() => {
    if (doctor) {
      setFormData({
        specialization: doctor?.specialization || '',
        experience: doctor?.experience || '',
        hospital: doctor?.hospital || '',
        consultationFee: doctor?.consultationFee || '',
        location: doctor?.location || '',
        bio: doctor?.bio || '',
        qualifications: doctor?.qualifications || []
      });
      if (doctor?.profileImage?.url) {
        setImagePreview(doctor.profileImage.url);
      }
    }
  }, [doctor]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
        return;
      }
      if (!file.type.startsWith('image/')) {
        toast.error('Please upload an image file');
        return;
      }
      setProfileImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const removeImage = () => {
    setProfileImage(null);
    setImagePreview(null);
  };

  const addQualification = () => {
    if (!newQualification.degree || !newQualification.institution || !newQualification.year) {
      toast.error('Please fill all qualification fields');
      return;
    }
    setFormData(prev => ({
      ...prev,
      qualifications: [...prev.qualifications, { ...newQualification }]
    }));
    setNewQualification({
      degree: '',
      institution: '',
      year: new Date().getFullYear()
    });
  };

  const removeQualification = (index) => {
    setFormData(prev => ({
      ...prev,
      qualifications: prev.qualifications.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.specialization || !formData.experience || !formData.hospital || 
        !formData.consultationFee || !formData.location) {
      toast.error('Please fill all required fields');
      return;
    }

    setIsSubmitting(true);
    
    const submitData = new FormData();
    submitData.append('specialization', formData.specialization);
    submitData.append('experience', formData.experience);
    submitData.append('hospital', formData.hospital);
    submitData.append('consultationFee', formData.consultationFee);
    submitData.append('location', formData.location);
    submitData.append('bio', formData.bio);
    submitData.append('qualifications', JSON.stringify(formData.qualifications));
    
    if (profileImage) {
      submitData.append('profileImage', profileImage);
    }
    
    await updateProfileMutation.mutateAsync(submitData);
    setIsSubmitting(false);
  };

  if (isLoading) {
    return (
      <div className="container max-w-4xl py-8">
        <div className="space-y-6">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  const specializations = [
    'Cardiologist', 'Dermatologist', 'Pediatrician', 'Neurologist',
    'Orthopedic', 'Gynecologist', 'Psychiatrist', 'Dentist',
    'General Physician', 'Ophthalmologist', 'ENT Specialist',
    'Urologist', 'Endocrinologist', 'Gastroenterologist', 'Pulmonologist'
  ];

  return (
    <div className="container max-w-4xl py-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate('/doctor/profile')}
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Edit Profile</h1>
          <p className="text-muted-foreground">Update your professional information</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Profile Information
            </CardTitle>
            <CardDescription>
              Update your profile picture and personal information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Profile Image */}
            <div className="space-y-3">
              <Label>Profile Image</Label>
              <div className="flex items-center gap-6">
                <div className="relative">
                  <Avatar className="h-24 w-24 border-2 border-primary">
                    <AvatarImage src={imagePreview} />
                    <AvatarFallback className="text-2xl bg-primary/10">
                      {doctor?.userId?.name?.charAt(0) || 'D'}
                    </AvatarFallback>
                  </Avatar>
                  {imagePreview && imagePreview !== doctor?.profileImage?.url && (
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute -top-2 -right-2 bg-destructive text-white rounded-full p-1 hover:bg-destructive/90"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
                <div className="flex-1">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="cursor-pointer"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    JPG, PNG or GIF. Max 5MB
                  </p>
                </div>
              </div>
            </div>

            {/* Basic Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="specialization">Specialization *</Label>
                <select
                  id="specialization"
                  name="specialization"
                  value={formData.specialization}
                  onChange={handleInputChange}
                  className="w-full rounded-md border border-input bg-background px-3 py-2"
                  required
                >
                  <option value="">Select Specialization</option>
                  {specializations.map(spec => (
                    <option key={spec} value={spec}>{spec}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="experience">Years of Experience *</Label>
                <div className="relative">
                  <Clock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="experience"
                    name="experience"
                    type="number"
                    placeholder="e.g., 5"
                    value={formData.experience}
                    onChange={handleInputChange}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="hospital">Hospital / Clinic *</Label>
                <div className="relative">
                  <Hospital className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="hospital"
                    name="hospital"
                    placeholder="Hospital name"
                    value={formData.hospital}
                    onChange={handleInputChange}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="consultationFee">Consultation Fee (₹) *</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="consultationFee"
                    name="consultationFee"
                    type="number"
                    placeholder="e.g., 500"
                    value={formData.consultationFee}
                    onChange={handleInputChange}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="location">Practice Location *</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="location"
                    name="location"
                    placeholder="City, State"
                    value={formData.location}
                    onChange={handleInputChange}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="bio">Professional Bio</Label>
                <Textarea
                  id="bio"
                  name="bio"
                  placeholder="Tell patients about your experience, expertise, and approach to care..."
                  value={formData.bio}
                  onChange={handleInputChange}
                  rows={5}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Qualifications Section */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5" />
              Qualifications
            </CardTitle>
            <CardDescription>
              Add your educational qualifications and certifications
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Add New Qualification */}
            <div className="p-4 border rounded-lg space-y-4">
              <h4 className="font-medium">Add New Qualification</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  placeholder="Degree (e.g., MBBS, MD)"
                  value={newQualification.degree}
                  onChange={(e) => setNewQualification({ ...newQualification, degree: e.target.value })}
                />
                <Input
                  placeholder="Institution"
                  value={newQualification.institution}
                  onChange={(e) => setNewQualification({ ...newQualification, institution: e.target.value })}
                />
                <div className="flex gap-2">
                  <Input
                    type="number"
                    placeholder="Year"
                    value={newQualification.year}
                    onChange={(e) => setNewQualification({ ...newQualification, year: parseInt(e.target.value) })}
                  />
                  <Button type="button" onClick={addQualification} size="icon">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Existing Qualifications */}
            {formData.qualifications.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-medium">Your Qualifications</h4>
                {formData.qualifications.map((qual, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div>
                      <p className="font-medium">{qual.degree}</p>
                      <p className="text-sm text-muted-foreground">{qual.institution} • {qual.year}</p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeQualification(index)}
                      className="text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Submit Buttons */}
        <div className="flex gap-4 mt-6">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600"
            size="lg"
          >
            {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/doctor/profile')}
            size="lg"
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}