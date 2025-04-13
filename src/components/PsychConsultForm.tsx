"use client";

import React, { useState, useContext } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { UserContext } from '@/context/UserContext';
import { format } from 'date-fns';

interface PsychConsultFormProps {
  patientId: number;
  onSuccess: () => void;
  onCancel: () => void;
}

const PsychConsultForm: React.FC<PsychConsultFormProps> = ({ patientId, onSuccess, onCancel }) => {
  const user = useContext(UserContext);
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [minutes, setMinutes] = useState('30');
  const [recommendations, setRecommendations] = useState('');
  const [treatmentPlan, setTreatmentPlan] = useState('');
  const [medications, setMedications] = useState('');
  const [followUpNeeded, setFollowUpNeeded] = useState(false);
  const [nextFollowUpDate, setNextFollowUpDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!date || !minutes || !recommendations) {
      setError('Please fill out all required fields.');
      return;
    }

    if (parseInt(minutes) <= 0) {
      setError('Minutes must be a positive number.');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const consultData = {
        patientId,
        userId: user?.id,
        consultDate: date,
        minutes: parseInt(minutes),
        recommendations,
        treatmentPlan: treatmentPlan || null,
        medications: medications || null,
        followUpNeeded,
        nextFollowUpDate: followUpNeeded ? nextFollowUpDate : null,
      };

      const response = await fetch('http://localhost:4353/api/psych/consult', {
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

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle className="text-xl font-bold">Document Psychiatric Consultation</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Consultation Date*</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="minutes">Minutes Spent*</Label>
              <Input
                id="minutes"
                type="number"
                min="1"
                value={minutes}
                onChange={(e) => setMinutes(e.target.value)}
                required
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="recommendations">Clinical Recommendations*</Label>
            <Textarea
              id="recommendations"
              rows={4}
              value={recommendations}
              onChange={(e) => setRecommendations(e.target.value)}
              placeholder="Enter clinical recommendations"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="treatmentPlan">Treatment Plan</Label>
            <Textarea
              id="treatmentPlan"
              rows={3}
              value={treatmentPlan}
              onChange={(e) => setTreatmentPlan(e.target.value)}
              placeholder="Enter treatment plan recommendations"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="medications">Medication Recommendations</Label>
            <Textarea
              id="medications"
              rows={3}
              value={medications}
              onChange={(e) => setMedications(e.target.value)}
              placeholder="Enter medication recommendations"
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="followUpNeeded"
              checked={followUpNeeded}
              onChange={(e) => setFollowUpNeeded(e.target.checked)}
              className="rounded border-gray-300"
            />
            <Label htmlFor="followUpNeeded">Follow-up consultation needed</Label>
          </div>
          
          {followUpNeeded && (
            <div className="space-y-2">
              <Label htmlFor="nextFollowUpDate">Next Follow-up Date</Label>
              <Input
                id="nextFollowUpDate"
                type="date"
                value={nextFollowUpDate}
                onChange={(e) => setNextFollowUpDate(e.target.value)}
                min={format(new Date(), 'yyyy-MM-dd')}
                required={followUpNeeded}
              />
            </div>
          )}
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {loading ? 'Submitting...' : 'Submit Consultation'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default PsychConsultForm; 