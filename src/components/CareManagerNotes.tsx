"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';

interface CareManagerNote {
  id: number;
  noteDate: string;
  content: string;
  referralNeeded: boolean;
  psychReferralNote: string;
  createdBy: string;
  userRole: string;
}

interface CareManagerNotesProps {
  patientId: number;
}

const CareManagerNotes: React.FC<CareManagerNotesProps> = ({ patientId }) => {
  const [notes, setNotes] = useState<CareManagerNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCareManagerNotes();
  }, [patientId]);

  const fetchCareManagerNotes = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:4353/api/psych/care-manager-notes/${patientId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch care manager notes');
      }
      
      const data = await response.json();
      setNotes(data);
    } catch (err) {
      console.error('Error fetching care manager notes:', err);
      setError('Failed to load care manager notes');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Care Manager Notes & Referrals</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">Loading notes...</div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Care Manager Notes & Referrals</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6 text-red-500">{error}</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Care Manager Notes & Referrals</CardTitle>
      </CardHeader>
      <CardContent>
        {notes.length > 0 ? (
          <div className="space-y-4">
            {notes.map((note) => (
              <div key={note.id} className="border p-4 rounded-md">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-medium">{format(new Date(note.noteDate), 'MMMM d, yyyy')}</h3>
                  <span className="text-sm text-gray-500">{note.createdBy} ({note.userRole})</span>
                </div>
                
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-500">Session Notes</h4>
                  <p className="whitespace-pre-line">{note.content}</p>
                </div>
                
                <div className="bg-purple-50 p-3 rounded-md border border-purple-100">
                  <h4 className="text-sm font-medium text-purple-700 mb-1">Psychiatric Referral Note</h4>
                  <p className="whitespace-pre-line text-purple-700">{note.psychReferralNote || 'No specific notes for psychiatric consultant.'}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-gray-500">
            No referral notes from care managers for this patient.
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CareManagerNotes; 