"use client";

import React, { useState, useContext, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserContext } from '@/context/UserContext';
import { useSelector } from 'react-redux';
import { RootState } from '@/lib/store';
import { format } from 'date-fns';

interface PsychConsultFormProps {
  patientId: number;
  onSuccess: () => void;
  onCancel: () => void;
}

interface Patient {
  patientId: number;
  firstName: string;
  lastName: string;
  dob: string;
  mrn: string;
}

const PsychConsultForm: React.FC<PsychConsultFormProps> = ({ patientId, onSuccess, onCancel }) => {
  const user = useContext(UserContext);
  const selectedClinic = useSelector((state: RootState) => state.clinic.selectedClinic);
  
  // Form fields
  const [companyName, setCompanyName] = useState('');
  const [consultDate, setConsultDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [assessmentType, setAssessmentType] = useState<'Initial' | 'Follow-up'>('Initial');
  const [summary, setSummary] = useState('');
  const [recommendations, setRecommendations] = useState('');
  const [minutesSpent, setMinutesSpent] = useState('30');
  
  // Patient data
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPatientData();
  }, [patientId]);

  const fetchPatientData = async () => {
    try {
      const response = await fetch(`http://localhost:4353/api/patients/${patientId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch patient data');
      }
      const data = await response.json();
      setPatient(data);
    } catch (err) {
      console.error('Error fetching patient data:', err);
      setError('Failed to load patient information');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!companyName.trim() || !summary.trim() || !recommendations.trim()) {
      setError('Please fill out all required fields.');
      return;
    }

    if (parseInt(minutesSpent) <= 0) {
      setError('Minutes must be a positive number.');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const consultData = {
        patientId,
        consultantId: user?.id,
        companyName: companyName.trim(),
        consultDate,
        assessmentType,
        summary: summary.trim(),
        recommendations: recommendations.trim(),
        minutes: parseInt(minutesSpent),
      };

      const response = await fetch('http://localhost:4353/api/psych/consultations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(consultData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit consultation');
      }

      onSuccess();
    } catch (err) {
      console.error('Error submitting psychiatric consultation:', err);
      setError('Failed to submit consultation. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!patient) {
    return (
      <div className="w-full max-w-5xl mx-auto">
        <Card className="shadow-lg border-0">
          <CardContent className="p-8">
            <div className="text-center text-gray-600">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
              Loading patient information...
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto">
      <Card className="shadow-2xl border-0 overflow-hidden">
        {/* Professional Header */}
        <CardHeader className="bg-blue-700 text-white p-0">
          <div className="px-8 py-6">
            <CardTitle className="text-3xl font-bold text-center mb-2">
              Psychiatric Consulting Notes
            </CardTitle>
            <div className="text-center text-blue-100 text-sm">
              Confidential Medical Documentation
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <form onSubmit={handleSubmit} className="space-y-0">
            {error && (
              <div className="mx-8 mt-6 p-4 bg-red-50 border-l-4 border-red-400 text-red-700 rounded-r-md">
                <div className="flex">
                  <div className="ml-3">
                    <p className="text-sm font-medium">{error}</p>
                  </div>
                </div>
              </div>
            )}
            
            {/* Header Information Section */}
            <div className="bg-gray-50 border-b border-gray-200 px-8 py-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <div className="w-2 h-6 bg-purple-600 rounded-full mr-3"></div>
                Consultation Information
              </h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="companyName" className="text-sm font-medium text-gray-700">
                    Company/Organization Name *
                  </Label>
                  <Input
                    id="companyName"
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="Enter your company/organization name"
                    required
                    className="h-11 border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="consultDate" className="text-sm font-medium text-gray-700">
                    Consultation Date *
                  </Label>
                  <Input
                    id="consultDate"
                    type="date"
                    value={consultDate}
                    onChange={(e) => setConsultDate(e.target.value)}
                    required
                    className="h-11 border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Consultant</Label>
                  <Input 
                    value={user?.name || ''} 
                    disabled 
                    className="h-11 bg-gray-100 border-gray-300 text-gray-600"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Phone Number</Label>
                  <Input 
                    value={(user as any)?.phone_number || 'Not provided'} 
                    disabled 
                    className="h-11 bg-gray-100 border-gray-300 text-gray-600"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Clinic Name</Label>
                  <Input 
                    value={selectedClinic?.name || 'No clinic selected'} 
                    disabled 
                    className="h-11 bg-gray-100 border-gray-300 text-gray-600"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="minutesSpent" className="text-sm font-medium text-gray-700">
                    Minutes Spent *
                  </Label>
                  <Input
                    id="minutesSpent"
                    type="number"
                    min="1"
                    value={minutesSpent}
                    onChange={(e) => setMinutesSpent(e.target.value)}
                    required
                    className="h-11 border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                  />
                </div>
              </div>
            </div>

            {/* Patient Information Section */}
            <div className="bg-blue-50 border-b border-blue-200 px-8 py-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <div className="w-2 h-6 bg-blue-600 rounded-full mr-3"></div>
                Patient Information
              </h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Patient Name</Label>
                  <Input 
                    value={`${patient.firstName} ${patient.lastName}`} 
                    disabled 
                    className="h-11 bg-gray-100 border-gray-300 text-gray-600 font-medium"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Date of Birth</Label>
                  <Input 
                    value={patient.dob ? format(new Date(patient.dob), 'MM/dd/yyyy') : 'N/A'} 
                    disabled 
                    className="h-11 bg-gray-100 border-gray-300 text-gray-600"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Medical Record Number</Label>
                  <Input 
                    value={patient.mrn} 
                    disabled 
                    className="h-11 bg-gray-100 border-gray-300 text-gray-600 font-mono"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="assessmentType" className="text-sm font-medium text-gray-700">
                    Referred from Assessment Type *
                  </Label>
                  <Select value={assessmentType} onValueChange={(value: 'Initial' | 'Follow-up') => setAssessmentType(value)}>
                    <SelectTrigger className="h-11 w-full border-gray-300 bg-white hover:border-gray-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 focus:ring-opacity-50 transition-all duration-200 shadow-sm">
                      <SelectValue placeholder="Select assessment type" className="text-gray-700" />
                    </SelectTrigger>
                    <SelectContent className="border-gray-200 shadow-lg">
                      <SelectItem value="Initial" className="hover:bg-purple-50 focus:bg-purple-50 cursor-pointer py-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <span className="font-medium">Initial Assessment</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="Follow-up" className="hover:bg-purple-50 focus:bg-purple-50 cursor-pointer py-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="font-medium">Follow-up Assessment</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Clinical Content Section */}
            <div className="px-8 py-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center">
                <div className="w-2 h-6 bg-green-600 rounded-full mr-3"></div>
                Clinical Documentation
              </h3>
              
              <div className="space-y-6">
                <div className="space-y-3">
                  <Label htmlFor="summary" className="text-sm font-medium text-gray-700">
                    Clinical Summary *
                  </Label>
                  <Textarea
                    id="summary"
                    rows={6}
                    value={summary}
                    onChange={(e) => setSummary(e.target.value)}
                    placeholder="Provide a comprehensive clinical summary of the consultation, including patient presentation, mental status examination findings, diagnostic impressions, and clinical observations..."
                    required
                    className="min-h-[150px] border-gray-300 focus:border-green-500 focus:ring-green-500 resize-none"
                  />
                  <div className="text-xs text-gray-500">
                    Include patient presentation, symptoms, mental status, and clinical observations
                  </div>
                </div>
                
                <div className="space-y-3">
                  <Label htmlFor="recommendations" className="text-sm font-medium text-gray-700">
                    Clinical Recommendations *
                  </Label>
                  <Textarea
                    id="recommendations"
                    rows={6}
                    value={recommendations}
                    onChange={(e) => setRecommendations(e.target.value)}
                    placeholder="Document specific clinical recommendations including medication adjustments, therapy recommendations, follow-up care, safety planning, and coordination with other providers..."
                    required
                    className="min-h-[150px] border-gray-300 focus:border-green-500 focus:ring-green-500 resize-none"
                  />
                  <div className="text-xs text-gray-500">
                    Include medication recommendations, therapy suggestions, and follow-up plans
                  </div>
                </div>
              </div>
            </div>

            {/* Signature Section */}
            <div className="bg-gray-50 border-t border-gray-200 px-8 py-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <div className="w-2 h-6 bg-indigo-600 rounded-full mr-3"></div>
                Consultant Signature
              </h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Consultant Name</Label>
                  <Input 
                    value={user?.name || ''} 
                    disabled 
                    className="h-11 bg-gray-100 border-gray-300 text-gray-600 font-medium"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Digital Signature</Label>
                  <div className="h-11 border-2 border-dashed border-gray-300 rounded-md flex items-center justify-center text-sm text-gray-500 bg-gray-50">
                    Electronic signature will be applied upon submission
                  </div>
                </div>
              </div>
              <div className="mt-4 text-xs text-gray-500">
                By submitting this form, I confirm that the information provided is accurate and complete to the best of my knowledge.
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="px-8 py-6 bg-white border-t border-gray-200">
              <div className="flex justify-end space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancel}
                  disabled={loading}
                  className="px-6 py-2 h-11 border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="px-8 py-2 h-11 bg-blue-700 hover:bg-blue-800 text-white font-medium shadow-lg"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Submitting...
                    </>
                  ) : (
                    'Submit Consultation Notes'
                  )}
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default PsychConsultForm; 