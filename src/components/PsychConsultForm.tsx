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
  isMinimized?: boolean;
}

interface Patient {
  patientId: number;
  firstName: string;
  lastName: string;
  dob: string;
  mrn: string;
}

const PsychConsultForm: React.FC<PsychConsultFormProps> = ({ patientId, onSuccess, onCancel, isMinimized = false }) => {
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
      <div className="h-full flex items-center justify-center">
        <div className="text-center text-gray-600">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600 mx-auto mb-2"></div>
          <span className="text-sm">Loading patient information...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-y-auto">
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
              <p>{error}</p>
            </div>
          )}
          
          {/* Consultation Information */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
              <div className="w-2 h-4 bg-purple-600 rounded-full mr-2"></div>
              Consultation Info
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <Label htmlFor="companyName" className="text-xs font-medium text-gray-700">
                  Company/Organization *
                </Label>
                <Input
                  id="companyName"
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Enter company name"
                  required
                  className="h-8 text-sm"
                />
              </div>
              
              <div>
                <Label htmlFor="consultDate" className="text-xs font-medium text-gray-700">
                  Consultation Date *
                </Label>
                <Input
                  id="consultDate"
                  type="date"
                  value={consultDate}
                  onChange={(e) => setConsultDate(e.target.value)}
                  required
                  className="h-8 text-sm"
                />
              </div>

              <div>
                <Label className="text-xs font-medium text-gray-700">Consultant</Label>
                <Input 
                  value={user?.name || ''} 
                  disabled 
                  className="h-8 bg-gray-100 text-gray-600 text-sm"
                />
              </div>
              
              <div>
                <Label htmlFor="minutesSpent" className="text-xs font-medium text-gray-700">
                  Minutes Spent *
                </Label>
                <Input
                  id="minutesSpent"
                  type="number"
                  min="1"
                  value={minutesSpent}
                  onChange={(e) => setMinutesSpent(e.target.value)}
                  required
                  className="h-8 text-sm"
                />
              </div>
            </div>
          </div>

          {/* Patient Information */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
              <div className="w-2 h-4 bg-blue-600 rounded-full mr-2"></div>
              Patient Info
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-medium text-gray-700">Patient Name</Label>
                <Input 
                  value={`${patient.firstName} ${patient.lastName}`} 
                  disabled 
                  className="h-8 bg-gray-100 text-gray-600 text-sm font-medium"
                />
              </div>
              
              <div>
                <Label className="text-xs font-medium text-gray-700">Date of Birth</Label>
                <Input 
                  value={patient.dob ? format(new Date(patient.dob), 'MM/dd/yyyy') : 'N/A'} 
                  disabled 
                  className="h-8 bg-gray-100 text-gray-600 text-sm"
                />
              </div>
              
              <div>
                <Label className="text-xs font-medium text-gray-700">MRN</Label>
                <Input 
                  value={patient.mrn} 
                  disabled 
                  className="h-8 bg-gray-100 text-gray-600 text-sm font-mono"
                />
              </div>
              
              <div>
                <Label htmlFor="assessmentType" className="text-xs font-medium text-gray-700">
                  Assessment Type *
                </Label>
                <Select value={assessmentType} onValueChange={(value: 'Initial' | 'Follow-up') => setAssessmentType(value)}>
                  <SelectTrigger className="h-8 text-sm">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Initial">Initial Assessment</SelectItem>
                    <SelectItem value="Follow-up">Follow-up Assessment</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Clinical Documentation */}
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
              <div className="w-2 h-4 bg-green-600 rounded-full mr-2"></div>
              Clinical Documentation
            </h3>
            
            <div className="space-y-3">
              <div>
                <Label htmlFor="summary" className="text-xs font-medium text-gray-700">
                  Clinical Summary *
                </Label>
                <Textarea
                  id="summary"
                  rows={4}
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  placeholder="Provide clinical summary including patient presentation, mental status, and observations..."
                  required
                  className="text-sm resize-none"
                />
              </div>
              
              <div>
                <Label htmlFor="recommendations" className="text-xs font-medium text-gray-700">
                  Clinical Recommendations *
                </Label>
                <Textarea
                  id="recommendations"
                  rows={4}
                  value={recommendations}
                  onChange={(e) => setRecommendations(e.target.value)}
                  placeholder="Document specific recommendations including medications, therapy, follow-up care..."
                  required
                  className="text-sm resize-none"
                />
              </div>
            </div>
          </div>

          {/* Signature */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
              <div className="w-2 h-4 bg-indigo-600 rounded-full mr-2"></div>
              Digital Signature
            </h3>
            <div className="text-xs text-gray-500 mb-2">
              Electronic signature will be applied upon submission
            </div>
            <div className="text-xs text-gray-500">
              By submitting, I confirm the information is accurate and complete.
            </div>
          </div>
        </form>
      </div>
      
      {/* Action Buttons */}
      <div className="border-t border-gray-200 p-4 bg-white">
        <div className="flex justify-end space-x-2">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2 h-8 text-sm"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            onClick={handleSubmit}
            disabled={loading}
            className="px-4 py-2 h-8 bg-purple-600 hover:bg-purple-700 text-white text-sm"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1"></div>
                Submitting...
              </>
            ) : (
              'Submit Notes'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PsychConsultForm; 