"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

interface PsychConsultation {
  id: number;
  consultDate: string;
  assessmentType: 'Initial' | 'Follow-up';
  summary: string;
  recommendations: string;
  minutes: number;
  companyName: string;
  consultantName: string;
  consultantPhone: string;
  treatmentPlan?: string;
  medications?: string;
  followUpNeeded?: boolean;
  nextFollowUpDate?: string;
}

interface PsychConsultHistoryProps {
  patientId: number;
  refreshTrigger?: number;
}

const PsychConsultHistory: React.FC<PsychConsultHistoryProps> = ({ patientId, refreshTrigger }) => {
  const [consultations, setConsultations] = useState<PsychConsultation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());
  const [exporting, setExporting] = useState<number | null>(null);

  useEffect(() => {
    fetchConsultations();
  }, [patientId, refreshTrigger]);

  const fetchConsultations = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`http://localhost:4353/api/psych/consultations/${patientId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch consultations');
      }
      const data = await response.json();
      console.log('Fetched consultations data:', data);
      setConsultations(Array.isArray(data) ? data : []);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching consultations:', err);
      setError('Failed to load consultation history');
      setLoading(false);
    }
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'Invalid Date';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Invalid Date';
      }
      return format(date, 'MMMM dd, yyyy');
    } catch (error) {
      console.error('Error formatting date:', dateString, error);
      return 'Invalid Date';
    }
  };

  const toggleExpanded = (id: number) => {
    const newExpanded = new Set(expandedIds);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedIds(newExpanded);
  };

  const handleExportPDF = async (consultationId: number) => {
    try {
      setExporting(consultationId);
      const response = await fetch(
        `http://localhost:4353/api/patients/${patientId}/psych-consultations/${consultationId}/export`,
        {
          method: 'GET',
        }
      );

      if (!response.ok) {
        throw new Error('Failed to export consultation');
      }

      // Create blob and download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `Psychiatric_Consultation_${format(new Date(), 'yyyy-MM-dd')}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Error exporting consultation:', err);
      alert('Failed to export consultation. Please try again.');
    } finally {
      setExporting(null);
    }
  };

  const truncateText = (text: string, maxLength: number = 150) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading consultation history...</div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-red-500">{error}</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Psychiatric Consultation History</span>
          <Badge variant="secondary" className="ml-2">
            {consultations.length} consultation{consultations.length !== 1 ? 's' : ''}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {consultations.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No psychiatric consultations recorded for this patient.
          </div>
        ) : (
          <div className="space-y-4">
            {consultations.map((consultation) => {
              if (!consultation || typeof consultation !== 'object') {
                console.error('Invalid consultation object:', consultation);
                return null;
              }
              
              return (
                <div key={consultation.id} className="border rounded-lg p-4 bg-gray-50">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-semibold text-lg">
                          {formatDate(consultation.consultDate)}
                        </h4>
                        <Badge 
                          variant={consultation.assessmentType === 'Initial' ? 'default' : 'secondary'}
                          className="text-xs"
                        >
                          {consultation.assessmentType || 'Unknown'} Assessment
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-600 mb-2">
                        <p><strong>Consultant:</strong> {consultation.consultantName || 'Unknown'}</p>
                        <p><strong>Company:</strong> {consultation.companyName || 'Not specified'}</p>
                        <p><strong>Duration:</strong> {consultation.minutes || 0} minutes</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleExpanded(consultation.id)}
                      >
                        {expandedIds.has(consultation.id) ? 'Collapse' : 'Expand'}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleExportPDF(consultation.id)}
                        disabled={exporting === consultation.id}
                        className="text-purple-600 border-purple-600 hover:bg-purple-50"
                      >
                        {exporting === consultation.id ? 'Exporting...' : 'Export PDF'}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <h5 className="font-medium text-gray-800 mb-1">Summary:</h5>
                      <p className="text-gray-700 text-sm leading-relaxed">
                        {expandedIds.has(consultation.id) 
                          ? (consultation.summary || 'No summary provided')
                          : truncateText(consultation.summary)
                        }
                      </p>
                    </div>

                    <div>
                      <h5 className="font-medium text-gray-800 mb-1">Recommendations:</h5>
                      <p className="text-gray-700 text-sm leading-relaxed">
                        {expandedIds.has(consultation.id) 
                          ? (consultation.recommendations || 'No recommendations provided')
                          : truncateText(consultation.recommendations)
                        }
                      </p>
                    </div>

                    {!expandedIds.has(consultation.id) && 
                      ((consultation.summary && consultation.summary.length > 150) || 
                       (consultation.recommendations && consultation.recommendations.length > 150)) && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleExpanded(consultation.id)}
                        className="text-purple-600 hover:text-purple-800 p-0 h-auto"
                      >
                        Click to read more...
                      </Button>
                    )}
                  </div>

                  <div className="mt-3 pt-3 border-t border-gray-200 text-xs text-gray-500">
                    Consultation Date: {formatDate(consultation.consultDate)}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PsychConsultHistory; 