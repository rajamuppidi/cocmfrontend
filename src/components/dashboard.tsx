"use client";

import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from 'react-redux';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { RootState, AppDispatch } from '@/lib/store';
import PatientEnrollment from '@/components/patient-enrollment';
import RemindersSection from '@/components/RemindersSection';

// Icon Components
function ActivityIcon(props: React.JSX.IntrinsicAttributes & React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2" />
    </svg>
  );
}

function BarChartIcon(props: React.JSX.IntrinsicAttributes & React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" x2="12" y1="20" y2="10" />
      <line x1="18" x2="18" y1="20" y2="4" />
      <line x1="6" x2="6" y1="20" y2="16" />
    </svg>
  );
}

function CalendarIcon(props: React.JSX.IntrinsicAttributes & React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 2v4" />
      <path d="M16 2v4" />
      <rect width="18" height="18" x="3" y="4" rx="2" />
      <path d="M3 10h18" />
    </svg>
  );
}

function ClockIcon(props: React.JSX.IntrinsicAttributes & React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function UsersIcon(props: React.JSX.IntrinsicAttributes & React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

interface DashboardProps {
  user: {
    id: string | number;
    name: string;
    role: string;
  };
}

interface ClinicData {
  totalPatients: number;
  activePatients: number;
  totalMinutesTracked: number;
  averageMinutesPerPatient: number;
  newPatients: number;
}

export const Dashboard: React.FC<DashboardProps> = ({ user }) => {
  const dispatch = useDispatch<AppDispatch>();
  const selectedClinic = useSelector((state: RootState) => state.clinic.selectedClinic);
  const [clinicData, setClinicData] = useState<ClinicData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showEnrollmentForm, setShowEnrollmentForm] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  useEffect(() => {
    if (selectedClinic?.id) {
      fetchClinicData(selectedClinic.id);
    }
  }, [selectedClinic]);

  const handleEnrollmentSuccess = () => {
    setShowEnrollmentForm(false);
    if (selectedClinic?.id) {
      fetchClinicData(selectedClinic.id);
    }
  };

  const fetchClinicData = async (clinicId: number) => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:4353/api/clinics/${clinicId}/data`);
      if (!response.ok) {
        throw new Error('Failed to fetch clinic data');
      }
      const data: ClinicData = await response.json();
      setClinicData({
        totalPatients: data.totalPatients || 0,
        activePatients: data.activePatients || 0,
        totalMinutesTracked: data.totalMinutesTracked || 0,
        averageMinutesPerPatient: data.averageMinutesPerPatient || 0,
        newPatients: data.newPatients || 0
      });
      setLoading(false);
    } catch (err) {
      setError('Error fetching clinic data');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading dashboard data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-red-500">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full min-h-screen bg-gray-50">
      <header className="flex items-center justify-between bg-gray-800 p-4 text-white">
        <h1 className="text-xl font-semibold">Dashboard</h1>
        <div className="text-sm">
          Current Clinic: <span className="font-medium">{selectedClinic?.name || 'None Selected'}</span>
        </div>
      </header>
      
      <main className="flex min-h-[calc(100vh_-_theme(spacing.16))] flex-1 flex-col gap-4 p-4 md:gap-8 md:p-10">
        {/* Key Metrics Section */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-blue-100 text-black">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
              <UsersIcon className="w-6 h-6 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{clinicData?.totalPatients || 0}</div>
              <p className="text-xs text-blue-600">All enrolled patients</p>
            </CardContent>
          </Card>

          <Card className="bg-green-100 text-black">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Active Patients</CardTitle>
              <ActivityIcon className="w-6 h-6 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{clinicData?.activePatients || 0}</div>
              <p className="text-xs text-green-600">Currently in treatment</p>
            </CardContent>
          </Card>

          <Card className="bg-yellow-100 text-black">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Minutes Tracked</CardTitle>
              <ClockIcon className="w-6 h-6 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{clinicData?.totalMinutesTracked || 0}</div>
              <p className="text-xs text-yellow-600">All time minutes</p>
            </CardContent>
          </Card>

          <Card className="bg-purple-100 text-black">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Avg Minutes per Patient</CardTitle>
              <BarChartIcon className="w-6 h-6 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{clinicData?.averageMinutesPerPatient || 0}</div>
              <p className="text-xs text-purple-600">Per active patient</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {/* Patient Enrollment Card */}
          <Card className="bg-white text-black">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Patient Enrollment</CardTitle>
              <UsersIcon className="w-6 h-6 text-gray-500" />
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="text-2xl font-bold">+{clinicData?.newPatients || 0}</div>
                <p className="text-xs text-gray-500">New patients this month</p>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setShowEnrollmentForm(true)}
                className="w-full"
              >
                Enroll New Patient
              </Button>
            </CardContent>
          </Card>

          {/* Calendar Card */}
          <Card className="bg-white text-black">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Upcoming Appointments</CardTitle>
              <CalendarIcon className="w-6 h-6 text-gray-500" />
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="w-full"
                classNames={{
                  head_cell: "text-muted-foreground font-normal text-xs",
                  cell: "text-center text-sm p-0 relative [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md",
                  day: "h-9 w-9 p-0 font-normal aria-selected:opacity-100",
                  day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
                  day_today: "bg-accent text-accent-foreground",
                  day_outside: "text-muted-foreground opacity-50",
                  day_disabled: "text-muted-foreground opacity-50",
                  day_range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
                  day_hidden: "invisible",
                }}
              />
            </CardContent>
          </Card>

          {/* Reminders Section */}
          <RemindersSection userId={user.id} className="bg-white" />
        </div>

        {/* Date Range Selector */}
        <div className="flex items-center gap-4">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="flex-col items-start w-full h-auto p-4">
                <span className="font-semibold uppercase text-[0.65rem] text-gray-500">Date Range</span>
                <span className="font-normal text-sm">Last 30 days</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="p-0 w-auto">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      </main>

      {/* Patient Enrollment Modal */}
      {showEnrollmentForm && (
        <PatientEnrollment
          onClose={() => setShowEnrollmentForm(false)}
          onEnrollmentSuccess={handleEnrollmentSuccess}
        />
      )}
    </div>
  );
};

export default Dashboard;
