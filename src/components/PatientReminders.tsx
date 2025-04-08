import React, { useEffect, useState } from 'react';
import { format, isPast, isToday } from 'date-fns';
import { Bell, CheckCircle, X, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface PatientRemindersProps {
  patientId: number;
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

export default function PatientReminders({ patientId, className = '' }: PatientRemindersProps) {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReminders();
    // Refresh every 5 minutes
    const interval = setInterval(fetchReminders, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [patientId]);

  const fetchReminders = async () => {
    try {
      const response = await fetch(`http://localhost:4353/api/reminders/patient/${patientId}`);
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
      const response = await fetch(
        `http://localhost:4353/api/reminders/${reminderId}/${action}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ patientId })
        }
      );
      
      if (!response.ok) throw new Error(`Failed to ${action} reminder`);
      fetchReminders();
    } catch (error) {
      console.error(`Error ${action}ing reminder:`, error);
    }
  };

  const getReminderStatus = (reminderDate: string) => {
    const date = new Date(reminderDate);
    if (isPast(date) && !isToday(date)) {
      return { label: 'Overdue', color: 'text-red-500', bgColor: 'bg-red-50', icon: AlertTriangle };
    }
    if (isToday(date)) {
      return { label: 'Due Today', color: 'text-yellow-500', bgColor: 'bg-yellow-50', icon: Bell };
    }
    return { label: 'Upcoming', color: 'text-green-500', bgColor: 'bg-green-50', icon: Bell };
  };

  if (loading) {
    return <div className="p-4">Loading reminders...</div>;
  }

  return (
    <div className={`bg-white rounded-lg shadow-md ${className}`}>
      <div className="p-4">
        <h2 className="text-lg font-semibold mb-4">Patient Reminders</h2>
        {reminders.length === 0 ? (
          <p className="text-gray-500">No upcoming reminders for this patient</p>
        ) : (
          <div className="space-y-3">
            {reminders.map((reminder) => {
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
                      <p className="text-sm text-gray-600">
                        {reminder.reminder_type}
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
        )}
      </div>
    </div>
  );
}