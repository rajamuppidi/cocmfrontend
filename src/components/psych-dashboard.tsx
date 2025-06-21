"use client";

import React, { useState, useEffect, useContext } from "react";
import { useSelector, useDispatch } from 'react-redux';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { RootState, AppDispatch } from '@/lib/store';
import { UserContext } from '@/context/UserContext';
import { Input } from "@/components/ui/input";

// Icon Components
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

function BarChartIcon(props: React.JSX.IntrinsicAttributes & React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" x2="12" y1="20" y2="10" />
      <line x1="18" x2="18" y1="20" y2="4" />
      <line x1="6" x2="6" y1="20" y2="16" />
    </svg>
  );
}

interface PsychData {
  assignedPatients: number;
  totalMinutesTracked: number;
  averageMinutesPerPatient: number;
  upcomingReferrals: number;
}

const PsychDashboard: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const user = useContext(UserContext);
  const selectedClinic = useSelector((state: RootState) => state.clinic.selectedClinic);
  const [psychData, setPsychData] = useState<PsychData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [recentPatients, setRecentPatients] = useState<Array<any>>([]);

  useEffect(() => {
    if (selectedClinic?.id && user?.id) {
      fetchPsychData(selectedClinic.id, user.id);
      fetchRecentPatients(user.id);
    }
  }, [selectedClinic, user]);

  const fetchPsychData = async (clinicId: number, userId: string | number) => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:4353/api/psych/dashboard/${userId}?clinicId=${clinicId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch psychiatric consultant data');
      }
      const data: PsychData = await response.json();
      setPsychData({
        assignedPatients: data.assignedPatients || 0,
        totalMinutesTracked: data.totalMinutesTracked || 0,
        averageMinutesPerPatient: data.averageMinutesPerPatient || 0,
        upcomingReferrals: data.upcomingReferrals || 0
      });
      setLoading(false);
    } catch (err) {
      console.error('Error fetching psychiatric consultant data:', err);
      setError('Error fetching psychiatric consultant data');
      setLoading(false);
    }
  };

  const fetchRecentPatients = async (userId: string | number) => {
    try {
      const response = await fetch(`http://localhost:4353/api/psych/recent-patients/${userId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch recent patients');
      }
      const data = await response.json();
      setRecentPatients(data);
    } catch (err) {
      console.error('Error fetching recent patients:', err);
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
        <h1 className="text-xl font-semibold">Psychiatric Consultant Dashboard</h1>
        <div className="text-sm">
          Current Clinic: <span className="font-medium">{selectedClinic?.name || 'None Selected'}</span>
        </div>
      </header>
      
      <main className="flex min-h-[calc(100vh_-_theme(spacing.16))] flex-1 flex-col gap-4 p-4 md:gap-8 md:p-10">
        {/* Key Metrics Section */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-white border border-gray-200 shadow-sm text-gray-900">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Assigned Patients</CardTitle>
              <UsersIcon className="w-6 h-6 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{psychData?.assignedPatients || 0}</div>
              <p className="text-xs text-gray-600">Patients assigned for consultation</p>
            </CardContent>
          </Card>

          <Card className="bg-white border border-gray-200 shadow-sm text-gray-900">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Minutes Tracked</CardTitle>
              <ClockIcon className="w-6 h-6 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{psychData?.totalMinutesTracked || 0}</div>
              <p className="text-xs text-gray-600">All time consultation minutes</p>
            </CardContent>
          </Card>

          <Card className="bg-white border border-gray-200 shadow-sm text-gray-900">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Avg Minutes per Patient</CardTitle>
              <BarChartIcon className="w-6 h-6 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{psychData?.averageMinutesPerPatient || 0}</div>
              <p className="text-xs text-gray-600">Average consultation time</p>
            </CardContent>
          </Card>

          <Card className="bg-white border border-gray-200 shadow-sm text-gray-900">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Upcoming Referrals</CardTitle>
              <CalendarIcon className="w-6 h-6 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{psychData?.upcomingReferrals || 0}</div>
              <p className="text-xs text-gray-600">Pending psychiatric consultations</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {/* Recent Patients Card */}
          <Card className="bg-white border border-gray-200 shadow-sm text-black md:col-span-2 lg:col-span-3">
            <CardHeader className="flex flex-row items-center justify-between pb-2 border-b">
              <CardTitle className="text-sm font-medium">Recent Patients</CardTitle>
              <UsersIcon className="w-6 h-6 text-blue-600" />
            </CardHeader>
            <CardContent className="p-4">
              {recentPatients.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left border-b bg-gray-50">
                        <th className="px-4 py-3 font-medium text-gray-700">Patient Name</th>
                        <th className="px-4 py-3 font-medium text-gray-700">Referral Date</th>
                        <th className="px-4 py-3 font-medium text-gray-700">Notes</th>
                        <th className="px-4 py-3 font-medium text-gray-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentPatients.map((patient) => (
                        <tr key={patient.id} className="border-b hover:bg-gray-50">
                          <td className="px-4 py-3">{patient.firstName} {patient.lastName}</td>
                          <td className="px-4 py-3">{patient.referralDate}</td>
                          <td className="px-4 py-3">{patient.notes}</td>
                          <td className="px-4 py-3">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="text-blue-600 border-blue-600 hover:bg-blue-50"
                              onClick={() => window.location.href = `/patients/${patient.id}`}
                            >
                              View
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-6 bg-gray-50 rounded-lg">
                  <p className="text-gray-500">No recent patients</p>
                </div>
              )}
              <div className="mt-4">
                <Button 
                  variant="outline" 
                  size="sm"
                  className="w-full text-blue-600 border-blue-600 hover:bg-blue-50" 
                  onClick={() => window.location.href = '/psych-patients'}
                >
                  View All Assigned Patients
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Date Range Selector */}
        <div className="flex items-center gap-4">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="flex-col items-start w-full h-auto p-4 bg-white border border-gray-200 shadow-sm">
                <span className="font-semibold uppercase text-[0.65rem] text-gray-500">Date Range</span>
                <span className="font-normal text-sm text-gray-900">Last 30 days</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="p-0 w-auto bg-white border border-gray-200 shadow-lg">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                initialFocus
                className="rounded-md"
              />
            </PopoverContent>
          </Popover>
        </div>
      </main>
    </div>
  );
};

export default PsychDashboard; 