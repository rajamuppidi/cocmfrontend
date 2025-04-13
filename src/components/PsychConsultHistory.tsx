"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface PsychConsult {
  id: number;
  consultDate: string;
  consultBy: string;
  consultByRole: string;
  minutes: number;
  recommendations: string;
  treatmentPlan: string | null;
  medications: string | null;
  followUpNeeded: boolean;
  nextFollowUpDate: string | null;
}

interface PsychConsultHistoryProps {
  patientId: number;
  canAddConsult?: boolean;
  onAddConsult?: () => void;
}

const PsychConsultHistory: React.FC<PsychConsultHistoryProps> = ({ 
  patientId, 
  canAddConsult = false,
  onAddConsult
}) => {
  const [consultations, setConsultations] = useState<PsychConsult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchConsultHistory();
  }, [patientId]);

  const fetchConsultHistory = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:4353/api/psych/consult-history/${patientId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch consultation history');
      }
      
      const data = await response.json();
      setConsultations(data);
    } catch (err) {
      console.error('Error fetching psychiatric consultation history:', err);
      setError('Failed to load consultation history');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Psychiatric Consultation History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">Loading consultation history...</div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Psychiatric Consultation History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6 text-red-500">{error}</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Psychiatric Consultation History</CardTitle>
        {canAddConsult && (
          <Button 
            onClick={onAddConsult}
            className="bg-purple-600 hover:bg-purple-700"
          >
            Add Consultation
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {consultations.length > 0 ? (
          <Accordion type="single" collapsible>
            {consultations.map((consult, index) => (
              <AccordionItem key={consult.id} value={`consult-${consult.id}`}>
                <AccordionTrigger className="hover:bg-gray-50 px-4 py-2">
                  <div className="flex justify-between w-full items-center">
                    <div className="font-medium">
                      Consultation on {format(new Date(consult.consultDate), 'MMMM d, yyyy')}
                    </div>
                    <div className="text-sm text-gray-500 mr-4">
                      {consult.consultBy} • {consult.minutes} min
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 py-2">
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Consultant</h4>
                      <p>{consult.consultBy} ({consult.consultByRole})</p>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Clinical Recommendations</h4>
                      <p className="whitespace-pre-line">{consult.recommendations}</p>
                    </div>
                    
                    {consult.treatmentPlan && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">Treatment Plan</h4>
                        <p className="whitespace-pre-line">{consult.treatmentPlan}</p>
                      </div>
                    )}
                    
                    {consult.medications && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">Medication Recommendations</h4>
                        <p className="whitespace-pre-line">{consult.medications}</p>
                      </div>
                    )}
                    
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Follow-up</h4>
                      {consult.followUpNeeded ? (
                        <p>
                          Follow-up needed. Next appointment: {consult.nextFollowUpDate 
                            ? format(new Date(consult.nextFollowUpDate), 'MMMM d, yyyy') 
                            : 'Not specified'}
                        </p>
                      ) : (
                        <p>No follow-up needed at this time.</p>
                      )}
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        ) : (
          <div className="text-center py-6 text-gray-500">
            No psychiatric consultations recorded for this patient.
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PsychConsultHistory; 