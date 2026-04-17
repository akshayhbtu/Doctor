import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { format, addDays, addWeeks, isBefore, startOfDay, setHours, setMinutes, addMinutes } from 'date-fns';
import { Clock, Save, Loader2, Lock, CheckCircle, CalendarIcon } from 'lucide-react';

const DoctorSlotManager = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [currentWeekSlots, setCurrentWeekSlots] = useState({});
  const [nextWeekSlots, setNextWeekSlots] = useState({});
  const [activeTab, setActiveTab] = useState('current');

  // Helper function to get UTC date without time
  const getUTCDate = (date) => {
    const d = new Date(date);
    return new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  };

  // Helper function to format date key consistently
  const getDateKey = (date) => {
    const d = new Date(date);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  // Generate 45 minutes time slots from 9 AM to 6 PM
  const generateTimeSlots = () => {
    const slotsList = [];
    let currentTime = setHours(setMinutes(new Date(), 0), 9);
    const endTime = setHours(setMinutes(new Date(), 0), 18);
    
    while (currentTime < endTime) {
      const start = format(currentTime, 'h:mm a');
      const nextTime = addMinutes(currentTime, 45);
      const end = format(nextTime, 'h:mm a');
      slotsList.push({ 
        startTime: start, 
        endTime: end, 
        display: `${start} - ${end}`,
        id: `${start}-${end}`
      });
      currentTime = nextTime;
    }
    return slotsList;
  };

  const timeSlots = generateTimeSlots();

  // Get current week dates (Monday to Sunday) in UTC
  const getCurrentWeekDates = () => {
    const today = new Date();
    const utcToday = getUTCDate(today);
    const currentDay = utcToday.getUTCDay();
    
    // Calculate days to Monday (1 = Monday)
    let daysToMonday;
    if (currentDay === 0) { // Sunday
      daysToMonday = 6;
    } else {
      daysToMonday = currentDay - 1;
    }
    
    const monday = new Date(utcToday);
    monday.setUTCDate(utcToday.getUTCDate() - daysToMonday);
    monday.setUTCHours(0, 0, 0, 0);
    
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(monday);
      date.setUTCDate(monday.getUTCDate() + i);
      date.setUTCHours(0, 0, 0, 0);
      dates.push(date);
    }
    return dates;
  };

  // Get next week dates
  const getNextWeekDates = () => {
    const currentWeekDates = getCurrentWeekDates();
    const nextWeekStart = new Date(currentWeekDates[0]);
    nextWeekStart.setUTCDate(currentWeekDates[0].getUTCDate() + 7);
    
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(nextWeekStart);
      date.setUTCDate(nextWeekStart.getUTCDate() + i);
      date.setUTCHours(0, 0, 0, 0);
      dates.push(date);
    }
    return dates;
  };

  const currentWeekDates = getCurrentWeekDates();
  const nextWeekDates = getNextWeekDates();

  // Fetch doctor's current profile
  const { data: doctor, isLoading, refetch } = useQuery({
    queryKey: ['doctorProfile', user?._id],
    queryFn: async () => {
      const response = await api.get(`/doctors/user/${user?._id}`);
      return response;
    },
    enabled: !!user?._id && user?.role === 'doctor',
  });

  // Add slots mutation
  const addSlotsMutation = useMutation({
    mutationFn: async (data) => {
      // Convert dates to UTC date strings before sending
      const convertedSlots = data.availableSlots.map(slot => ({
        date: new Date(Date.UTC(
          slot.date.getFullYear(),
          slot.date.getMonth(),
          slot.date.getDate()
        )),
        slots: slot.slots
      }));
      
      const response = await api.post('/doctors/availability', {
        availableSlots: convertedSlots
      });
      return response;
    },
    onSuccess: () => {
      toast.success('Slots saved successfully!');
      refetch();
      setCurrentWeekSlots({});
      setNextWeekSlots({});
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to save slots');
    },
  });

  // Delete slot mutation
  const deleteSlotMutation = useMutation({
    mutationFn: async ({ date, startTime, endTime }) => {
      // Convert date to UTC
      const utcDate = new Date(Date.UTC(
        date.getFullYear(),
        date.getMonth(),
        date.getDate()
      ));
      
      const response = await api.delete('/doctors/slot', { 
        data: { date: utcDate, startTime, endTime } 
      });
      return response;
    },
    onSuccess: () => {
      toast.success('Slot deleted successfully!');
      refetch();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete slot');
    },
  });

  // Get all saved slots from database
  const getSavedSlotsMap = () => {
    const savedMap = {};
    if (doctor?.availableSlots) {
      doctor.availableSlots.forEach(dateSlot => {
        // Parse UTC date from backend and normalize
        const backendDate = new Date(dateSlot.date);
        const utcDate = getUTCDate(backendDate);
        const dateKey = getDateKey(utcDate);
        savedMap[dateKey] = dateSlot.slots;
      });
    }
    return savedMap;
  };

  // Check if a slot is saved
  const isSlotSaved = (date, slot) => {
    const utcDate = getUTCDate(date);
    const dateKey = getDateKey(utcDate);
    const savedSlots = getSavedSlotsMap()[dateKey];
    if (!savedSlots) return false;
    return savedSlots.some(
      s => s.startTime === slot.startTime && s.endTime === slot.endTime
    );
  };

  // Check if a slot is booked
  const isSlotBooked = (date, slot) => {
    const utcDate = getUTCDate(date);
    const dateKey = getDateKey(utcDate);
    const savedSlots = getSavedSlotsMap()[dateKey];
    if (!savedSlots) return false;
    const foundSlot = savedSlots.find(
      s => s.startTime === slot.startTime && s.endTime === slot.endTime
    );
    return foundSlot?.isBooked === true;
  };

  // Check if slot is pending (in local state)
  const isSlotPending = (week, date, slot) => {
    const utcDate = getUTCDate(date);
    const dateKey = getDateKey(utcDate);
    if (week === 'current') {
      return currentWeekSlots[dateKey]?.some(s => s.startTime === slot.startTime && s.endTime === slot.endTime) || false;
    } else {
      return nextWeekSlots[dateKey]?.some(s => s.startTime === slot.startTime && s.endTime === slot.endTime) || false;
    }
  };

  // Toggle slot (add/remove from local state)
  const toggleSlot = (week, date, slot) => {
    const utcDate = getUTCDate(date);
    const dateKey = getDateKey(utcDate);
    const isSaved = isSlotSaved(utcDate, slot);
    
    if (isSaved) {
      toast.error('This slot is already saved! Double click to delete.');
      return;
    }
    
    if (week === 'current') {
      const currentSlots = currentWeekSlots[dateKey] || [];
      const exists = currentSlots.some(s => s.startTime === slot.startTime && s.endTime === slot.endTime);
      
      if (exists) {
        setCurrentWeekSlots({
          ...currentWeekSlots,
          [dateKey]: currentSlots.filter(s => !(s.startTime === slot.startTime && s.endTime === slot.endTime))
        });
      } else {
        setCurrentWeekSlots({
          ...currentWeekSlots,
          [dateKey]: [...currentSlots, { startTime: slot.startTime, endTime: slot.endTime, isBooked: false }]
        });
      }
    } else {
      const nextSlots = nextWeekSlots[dateKey] || [];
      const exists = nextSlots.some(s => s.startTime === slot.startTime && s.endTime === slot.endTime);
      
      if (exists) {
        setNextWeekSlots({
          ...nextWeekSlots,
          [dateKey]: nextSlots.filter(s => !(s.startTime === slot.startTime && s.endTime === slot.endTime))
        });
      } else {
        setNextWeekSlots({
          ...nextWeekSlots,
          [dateKey]: [...nextSlots, { startTime: slot.startTime, endTime: slot.endTime, isBooked: false }]
        });
      }
    }
  };

  // Handle delete slot (double click)
  const handleDeleteSlot = async (date, slot) => {
    const utcDate = getUTCDate(date);
    
    if (isSlotBooked(utcDate, slot)) {
      toast.error('Cannot delete a booked slot!');
      return;
    }
    
    if (!isSlotSaved(utcDate, slot)) {
      toast.error('Slot not found in database!');
      return;
    }
    
    await deleteSlotMutation.mutateAsync({
      date: utcDate,
      startTime: slot.startTime,
      endTime: slot.endTime
    });
  };

  // Save all pending slots for current week
  const handleSaveCurrentWeek = () => {
    const allSlotsToSave = [];
    
    Object.entries(currentWeekSlots).forEach(([dateKey, slots]) => {
      if (slots.length > 0) {
        const [year, month, day] = dateKey.split('-');
        const date = new Date(Date.UTC(parseInt(year), parseInt(month) - 1, parseInt(day)));
        allSlotsToSave.push({
          date: date,
          slots: slots
        });
      }
    });
    
    if (allSlotsToSave.length === 0) {
      toast.error('No pending slots to save!');
      return;
    }
    
    addSlotsMutation.mutate({
      availableSlots: allSlotsToSave
    });
  };

  // Save all pending slots for next week
  const handleSaveNextWeek = () => {
    const allSlotsToSave = [];
    
    Object.entries(nextWeekSlots).forEach(([dateKey, slots]) => {
      if (slots.length > 0) {
        const [year, month, day] = dateKey.split('-');
        const date = new Date(Date.UTC(parseInt(year), parseInt(month) - 1, parseInt(day)));
        allSlotsToSave.push({
          date: date,
          slots: slots
        });
      }
    });
    
    if (allSlotsToSave.length === 0) {
      toast.error('No pending slots to save!');
      return;
    }
    
    addSlotsMutation.mutate({
      availableSlots: allSlotsToSave
    });
  };

  // Get pending count for a week
  const getPendingCount = (week) => {
    let total = 0;
    if (week === 'current') {
      Object.values(currentWeekSlots).forEach(slots => total += slots.length);
    } else {
      Object.values(nextWeekSlots).forEach(slots => total += slots.length);
    }
    return total;
  };

  // Check if date is past
  const isPastDate = (date) => {
    const today = getUTCDate(new Date());
    const checkDate = getUTCDate(date);
    return checkDate < today;
  };

  // Render week table
  const renderWeekTable = (weekDates, weekType, onSave) => {
    const pendingCount = getPendingCount(weekType);
    
    return (
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-muted/50">
              <th className="border p-2 text-left sticky left-0 bg-muted/50">Time / Date</th>
              {weekDates.map((date, idx) => (
                <th key={idx} className="border p-2 text-center min-w-[100px]">
                  <div className="font-semibold">{format(date, 'EEEE')}</div>
                  <div className="text-xs text-muted-foreground">{format(date, 'dd MMM')}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {timeSlots.map((slot, rowIdx) => (
              <tr key={rowIdx} className="hover:bg-muted/30">
                <td className="border p-2 text-sm font-medium sticky left-0 bg-background">
                  <Clock className="h-3 w-3 inline mr-1" />
                  {slot.display}
                </td>
                {weekDates.map((date, colIdx) => {
                  const isSaved = isSlotSaved(date, slot);
                  const isBooked = isSlotBooked(date, slot);
                  const isPending = isSlotPending(weekType, date, slot);
                  const pastDate = isPastDate(date);
                  
                  let bgColor = 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700';
                  let textColor = 'text-gray-700 dark:text-gray-300';
                  let cursor = 'cursor-pointer';
                  let onClick = () => !pastDate && !isSaved && !isBooked && toggleSlot(weekType, date, slot);
                  let onDoubleClick = null;
                  
                  if (pastDate) {
                    bgColor = 'bg-gray-300 dark:bg-gray-700';
                    textColor = 'text-gray-400';
                    cursor = 'cursor-not-allowed';
                    onClick = null;
                  } else if (isBooked) {
                    bgColor = 'bg-red-500';
                    textColor = 'text-white';
                    cursor = 'cursor-not-allowed';
                    onClick = null;
                  } else if (isSaved) {
                    bgColor = 'bg-green-500';
                    textColor = 'text-white';
                    cursor = 'cursor-pointer';
                    onDoubleClick = () => handleDeleteSlot(date, slot);
                  } else if (isPending) {
                    bgColor = 'bg-blue-500';
                    textColor = 'text-white';
                    cursor = 'cursor-pointer';
                    onClick = () => toggleSlot(weekType, date, slot);
                  }
                  
                  return (
                    <td 
                      key={colIdx} 
                      className={`border p-2 text-center text-sm ${bgColor} ${textColor} ${cursor} transition-all duration-200`}
                      onClick={onClick}
                      onDoubleClick={onDoubleClick}
                    >
                      <div className="flex items-center justify-center gap-1">
                        {isBooked && <Lock className="h-3 w-3" />}
                        {(isSaved || isPending) && !isBooked && <CheckCircle className="h-3 w-3" />}
                        {!isSaved && !isBooked && !isPending && !pastDate && 
                          <span className="text-xs opacity-50">+</span>
                        }
                        {pastDate && <span className="text-xs">-</span>}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
        
        {pendingCount > 0 && (
          <div className="mt-4">
            <Button 
              onClick={onSave}
              disabled={addSlotsMutation.isPending}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              {addSlotsMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              <Save className="h-4 w-4 mr-2" />
              Save {pendingCount} Pending Slot(s)
            </Button>
          </div>
        )}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container max-w-full py-4 px-2">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl text-white py-3 px-2 rounded-lg bg-black flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Manage Your Availability
          </CardTitle>
          <CardDescription className="text-sm text-muted-foreground mt-5">
            <div className="flex flex-wrap gap-4 text-xs">
              <span className="flex items-center gap-1">
                <div className="w-3 h-3 rounded bg-green-500"></div>
                Saved Slot (Double click to delete)
              </span>
              <span className="flex items-center gap-1">
                <div className="w-3 h-3 rounded bg-red-500"></div>
                Booked by Patient (Cannot delete)
              </span>
              <span className="flex items-center gap-1">
                <div className="w-3 h-3 rounded bg-blue-500"></div>
                Pending to Save (Click to remove)
              </span>
              <span className="flex items-center gap-1">
                <div className="w-3 h-3 rounded bg-gray-300"></div>
                Available (Click to add)
              </span>
            </div>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8 w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="current" className="gap-2">
                <CalendarIcon className="h-4 w-4" />
                Current Week ({format(currentWeekDates[0], 'dd MMM')} - {format(currentWeekDates[6], 'dd MMM')})
                {getPendingCount('current') > 0 && (
                  <Badge variant="secondary" className="ml-2 bg-blue-500 text-white">
                    {getPendingCount('current')}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="next" className="gap-2">
                <CalendarIcon className="h-4 w-4" />
                Next Week ({format(nextWeekDates[0], 'dd MMM')} - {format(nextWeekDates[6], 'dd MMM')})
                {getPendingCount('next') > 0 && (
                  <Badge variant="secondary" className="ml-2 bg-blue-500 text-white">
                    {getPendingCount('next')}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="current" className="space-y-4">
              {renderWeekTable(currentWeekDates, 'current', handleSaveCurrentWeek)}
            </TabsContent>

            <TabsContent value="next" className="space-y-4">
              {renderWeekTable(nextWeekDates, 'next', handleSaveNextWeek)}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default DoctorSlotManager;