"use client";

import React, { useState, useEffect, useContext } from "react";
import { useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserContext } from '@/context/UserContext';
import { RootState } from '@/lib/store';
import { format } from 'date-fns';

interface Patient {
  id: number;
  firstName: string;
  lastName: string;
  mrn: string;
  dob: string;
  referralDate: string;
  status: string;
  phq9Score: number | null;
  gad7Score: number | null;
  referralReason: string;
  careManagerName: string;
}

const PsychPatients: React.FC = () => {
  const router = useRouter();
  const user = useContext(UserContext);
  const selectedClinic = useSelector((state: RootState) => state.clinic.selectedClinic);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user?.id && selectedClinic?.id) {
      fetchAssignedPatients();
    }
  }, [user, selectedClinic]);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredPatients(patients);
    } else {
      const lowerCaseSearch = searchTerm.toLowerCase();
      const filtered = patients.filter(
        patient =>
          `${patient.firstName} ${patient.lastName}`.toLowerCase().includes(lowerCaseSearch) ||
          patient.mrn.toLowerCase().includes(lowerCaseSearch)
      );
      setFilteredPatients(filtered);
    }
  }, [searchTerm, patients]);

  const fetchAssignedPatients = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:4353/api/psych/assigned-patients/${user?.id}?clinicId=${selectedClinic?.id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch assigned patients');
      }
      const data = await response.json();
      setPatients(data);
      setFilteredPatients(data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching assigned patients:', err);
      setError('Failed to load assigned patients');
      setLoading(false);
    }
  };

  const handleViewPatient = (patientId: number) => {
    router.push(`/patients/${patientId}`);
  };

  const getScoreSeverity = (score: number | null, type: 'PHQ-9' | 'GAD-7') => {
    if (score === null) return 'Not assessed';
    
    if (type === 'PHQ-9') {
      if (score <= 4) return 'Minimal';
      if (score <= 9) return 'Mild';
      if (score <= 14) return 'Moderate';
      if (score <= 19) return 'Moderately Severe';
      return 'Severe';
    } else {
      if (score <= 4) return 'Minimal';
      if (score <= 9) return 'Mild';
      if (score <= 14) return 'Moderate';
      return 'Severe';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading patients...</div>
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
      <header className="flex items-center justify-between bg-purple-800 p-4 text-white">
        <h1 className="text-xl font-semibold">Assigned Patients</h1>
        <div className="text-sm">
          Current Clinic: <span className="font-medium">{selectedClinic?.name || 'None Selected'}</span>
        </div>
      </header>
      
      <main className="flex min-h-[calc(100vh_-_theme(spacing.16))] flex-1 flex-col gap-4 p-4 md:gap-8 md:p-10">
        <Card className="bg-white p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Patients Assigned for Psychiatric Consultation</h2>
            <div className="w-1/3">
              <Input
                type="search"
                placeholder="Search by name or MRN"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
          </div>
          <CardContent className="p-0">
            {filteredPatients.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left">Patient Name</th>
                      <th className="px-6 py-3 text-left">MRN</th>
                      <th className="px-6 py-3 text-left">DOB</th>
                      <th className="px-6 py-3 text-left">Referral Date</th>
                      <th className="px-6 py-3 text-left">PHQ-9</th>
                      <th className="px-6 py-3 text-left">GAD-7</th>
                      <th className="px-6 py-3 text-left">Care Manager</th>
                      <th className="px-6 py-3 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPatients.map((patient) => (
                      <tr key={patient.id} className="bg-white border-b hover:bg-gray-50">
                        <td className="px-6 py-4">
                          {patient.firstName} {patient.lastName}
                        </td>
                        <td className="px-6 py-4">{patient.mrn}</td>
                        <td className="px-6 py-4">{format(new Date(patient.dob), 'MM/dd/yyyy')}</td>
                        <td className="px-6 py-4">{format(new Date(patient.referralDate), 'MM/dd/yyyy')}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            patient.phq9Score === null
                              ? 'bg-gray-100 text-gray-800'
                              : patient.phq9Score > 14
                              ? 'bg-red-100 text-red-800'
                              : patient.phq9Score > 9
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {patient.phq9Score !== null ? `${patient.phq9Score} - ${getScoreSeverity(patient.phq9Score, 'PHQ-9')}` : 'Not assessed'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            patient.gad7Score === null
                              ? 'bg-gray-100 text-gray-800'
                              : patient.gad7Score > 14
                              ? 'bg-red-100 text-red-800'
                              : patient.gad7Score > 9
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {patient.gad7Score !== null ? `${patient.gad7Score} - ${getScoreSeverity(patient.gad7Score, 'GAD-7')}` : 'Not assessed'}
                          </span>
                        </td>
                        <td className="px-6 py-4">{patient.careManagerName}</td>
                        <td className="px-6 py-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewPatient(patient.id)}
                          >
                            View Details
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No patients are currently assigned to you for psychiatric consultation.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default PsychPatients; 