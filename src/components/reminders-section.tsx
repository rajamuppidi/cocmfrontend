"use client"

import React, { useEffect, useState } from 'react';
import { format, isPast, isToday } from 'date-fns';
import { Bell, CheckCircle, X, AlertTriangle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";

interface RemindersSectionProps {
  userId: string | number;
  className?: string;
}

interface Reminder {
  id: number;
  patient_id: number;
  reminder_type: string;
  reminder_date: string;
  description: string;
  status: string;
  first_name: string;
  last_name: string;
  mrn: string;
  clinic_name: string;
}

type ReminderStatus = 'all' | 'overdue' | 'today' | 'upcoming';

export default function RemindersSection({ userId, className = '' }: RemindersSectionProps) {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<ReminderStatus>('all');

  useEffect(() => {
    fetchReminders();
    // Refresh every 5 minutes
    const interval = setInterval(fetchReminders, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [userId]);

  const fetchReminders = async () => {
    try {
      const id = typeof userId === 'number' ? userId : parseInt(userId, 10);
      const response = await fetch(`http://localhost:4353/api/reminders/care-manager/${id}`);
      if (!response.ok) throw new Error('Failed to fetch reminders');
      const data = await response.json();
      setReminders(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching reminders:', error);
      setLoading(false);
    }
  };

  const handleAction = async (reminderId: number, action: 'complete' | 'dismiss') => {
    try {
      const id = typeof userId === 'number' ? userId : parseInt(userId, 10);
      const response = await fetch(
        `http://localhost:4353/api/reminders/${reminderId}/${action}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: id })
        }
      );
      
      if (!response.ok) throw new Error(`Failed to ${action} reminder`);
      fetchReminders();
    } catch (error) {
      console.error(`Error ${action}ing reminder:`, error);
    }
  };

  const getReminderStatus = (reminderDate: string): { label: ReminderStatus; color: string; bgColor: string; icon: React.ElementType } => {
    const date = new Date(reminderDate);
    if (isPast(date) && !isToday(date)) {
      return { label: 'overdue', color: 'text-red-500', bgColor: 'bg-red-50', icon: AlertTriangle };
    }
    if (isToday(date)) {
      return { label: 'today', color: 'text-yellow-500', bgColor: 'bg-yellow-50', icon: Bell };
    }
    return { label: 'upcoming', color: 'text-green-500', bgColor: 'bg-green-50', icon: Clock };
  };

  const filteredReminders = reminders.filter(reminder => {
    if (activeTab === 'all') return true;
    return getReminderStatus(reminder.reminder_date).label === activeTab;
  });

  const renderSkeletonLoader = () => (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex items-center space-x-4 p-3 rounded-lg bg-gray-50">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-[250px]" />
            <Skeleton className="h-4 w-[200px]" />
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Reminders</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as ReminderStatus)}>
          <TabsList className="grid w-full grid-cols-4 mb-4">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="overdue">Overdue</TabsTrigger>
            <TabsTrigger value="today">Today</TabsTrigger>
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          </TabsList>
          <TabsContent value={activeTab}>
            {loading ? (
              renderSkeletonLoader()
            ) : filteredReminders.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No {activeTab === 'all' ? '' : activeTab} reminders</p>
            ) : (
              <ScrollArea className="h-[300px] pr-4">
                <div className="space-y-3">
                  {filteredReminders.map((reminder) => {
                    const status = getReminderStatus(reminder.reminder_date);
                    const StatusIcon = status.icon;
                    
                    return (
                      <div 
                        key={reminder.id} 
                        className={`flex items-center justify-between p-3 rounded-lg ${status.bgColor}`}
                      >
                        <div className="flex items-start space-x-3">
                          <StatusIcon className={`w-5 h-5 mt-1 ${status.color}`} />
                          <div>
                            <p className="font-medium">
                              {reminder.first_name} {reminder.last_name}
                            </p>
                            <p className="text-sm text-gray-600">
                              {reminder.reminder_type}
                            </p>
                            <p className="text-sm text-gray-500">
                              MRN: {reminder.mrn}
                            </p>
                            <p className="text-sm text-gray-500">
                              Due: {format(new Date(reminder.reminder_date), 'MMM d, yyyy')}
                            </p>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleAction(reminder.id, 'complete')}
                                  className="hover:bg-green-100"
                                >
                                  <CheckCircle className="w-4 h-4" />
                                  <span className="sr-only">Mark as Completed</span>
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Mark as Completed</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>

                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleAction(reminder.id, 'dismiss')}
                                  className="hover:bg-red-100"
                                >
                                  <X className="w-4 h-4" />
                                  <span className="sr-only">Dismiss Reminder</span>
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Dismiss Reminder</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

