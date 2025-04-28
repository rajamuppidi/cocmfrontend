"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

// Helper function to format camelCase to Title Case
const formatLabel = (text: string): string => {
  // Handle special abbreviations like 'htn' to 'HTN'
  const specialAbbreviations: Record<string, string> = {
    'htn': 'HTN',
    'copdAsthma': 'COPD/Asthma',
  };
  
  if (specialAbbreviations[text]) {
    return specialAbbreviations[text];
  }
  
  // Normal camelCase to Title Case conversion
  return text
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (str) => str.toUpperCase())
    .trim();
};

interface SymptomsState {
  depressedMood: boolean;
  littlePleasureInterest: boolean;
  lowEnergyMotivation: boolean;
  lowOrIncreasedAppetite: boolean;
  changeInSleep: boolean;
  suicidalThoughts: boolean;
  feelingGuiltyBad: boolean;
  troubleConcentrating: boolean;
  elevatedEuphoricMood: boolean;
  severeIrritability: boolean;
  impulsivityOutOfCharacter: boolean;
  talkingTooFast: boolean;
  constantWorrying: boolean;
  muscleTension: boolean;
  fatigueFromWorrying: boolean;
  troubleSleepingDueToWorry: boolean;
  unableToControlWorrying: boolean;
  worryingAboutJudgment: boolean;
  avoidingSocialSituations: boolean;
  avoidingPanicAttackTriggers: boolean;
  historyOfTrauma: boolean;
  recurrentUnwantedThoughts: boolean;
  flashbacks: boolean;
  nightmares: boolean;
  compulsiveBehaviors: boolean;
  avoidingTraumaTriggers: boolean;
  fearfulOnEdge: boolean;
  hearingSeeingThings: boolean;
  difficultyTrusting: boolean;
  paranoia: boolean;
}

interface PastMentalHealthState {
  suicideAttempt: boolean;
  therapyCounselingCurrent: boolean;
  therapyCounselingPast: boolean;
  substanceUseTreatmentResidential: boolean;
  substanceUseTreatmentOutpatient: boolean;
}

interface SubstanceUseState {
  alcohol: { current: boolean; past: boolean };
  cannabis: { current: boolean; past: boolean };
  painPills: { current: boolean; past: boolean };
  heroinFentanyl: { current: boolean; past: boolean };
  methamphetamine: { current: boolean; past: boolean };
  prescriptionMisuse: { current: boolean; past: boolean };
  cocaine: { current: boolean; past: boolean };
  [key: string]: { current: boolean; past: boolean };
}

interface MedicalHistoryState {
  thyroid: boolean;
  htn: boolean;
  dyslipemia: boolean;
  diabetes: boolean;
  copdAsthma: boolean;
  drugAllergies: boolean;
}

interface FamilyMentalHealthState {
  depression: boolean;
  bipolarDisorder: boolean;
  anxiety: boolean;
  schizophrenia: boolean;
  substanceUse: boolean;
}

interface SocialSituationState {
  livingSituation: string;
  maritalStatus: string;
  children: string;
  employment: string;
}

interface IntakeFormProps {
  patientId: string;
  careManagerId: string;
  onClose: () => void;
  onSuccess: () => void;
  initialData?: any;
  patientName: string;
  mrn: string;
  clinicName: string;
  enrollmentDate: string;
  dob: string;
}

export default function IntakeForm({
  patientId,
  careManagerId,
  onClose,
  onSuccess,
  initialData,
  patientName,
  mrn,
  clinicName,
  enrollmentDate,
  dob,
}: IntakeFormProps) {
  const [symptoms, setSymptoms] = useState<SymptomsState>({
    depressedMood: false,
    littlePleasureInterest: false,
    lowEnergyMotivation: false,
    lowOrIncreasedAppetite: false,
    changeInSleep: false,
    suicidalThoughts: false,
    feelingGuiltyBad: false,
    troubleConcentrating: false,
    elevatedEuphoricMood: false,
    severeIrritability: false,
    impulsivityOutOfCharacter: false,
    talkingTooFast: false,
    constantWorrying: false,
    muscleTension: false,
    fatigueFromWorrying: false,
    troubleSleepingDueToWorry: false,
    unableToControlWorrying: false,
    worryingAboutJudgment: false,
    avoidingSocialSituations: false,
    avoidingPanicAttackTriggers: false,
    historyOfTrauma: false,
    recurrentUnwantedThoughts: false,
    flashbacks: false,
    nightmares: false,
    compulsiveBehaviors: false,
    avoidingTraumaTriggers: false,
    fearfulOnEdge: false,
    hearingSeeingThings: false,
    difficultyTrusting: false,
    paranoia: false,
  });
  const [columbiaSuicideSeverity, setColumbiaSuicideSeverity] = useState<string>("");
  const [anxietyPanicAttacks, setAnxietyPanicAttacks] = useState<string>("");
  const [pastMentalHealth, setPastMentalHealth] = useState<PastMentalHealthState>({
    suicideAttempt: false,
    therapyCounselingCurrent: false,
    therapyCounselingPast: false,
    substanceUseTreatmentResidential: false,
    substanceUseTreatmentOutpatient: false,
  });
  const [psychiatricHospitalizations, setPsychiatricHospitalizations] = useState<string>("");
  const [substanceUse, setSubstanceUse] = useState<SubstanceUseState>({
    alcohol: { current: false, past: false },
    cannabis: { current: false, past: false },
    painPills: { current: false, past: false },
    heroinFentanyl: { current: false, past: false },
    methamphetamine: { current: false, past: false },
    prescriptionMisuse: { current: false, past: false },
    cocaine: { current: false, past: false },
  });
  const [medicalHistory, setMedicalHistory] = useState<MedicalHistoryState>({
    thyroid: false,
    htn: false,
    dyslipemia: false,
    diabetes: false,
    copdAsthma: false,
    drugAllergies: false,
  });
  const [otherMedicalHistory, setOtherMedicalHistory] = useState<string>("");
  const [familyMentalHealth, setFamilyMentalHealth] = useState<FamilyMentalHealthState>({
    depression: false,
    bipolarDisorder: false,
    anxiety: false,
    schizophrenia: false,
    substanceUse: false,
  });
  const [socialSituation, setSocialSituation] = useState<SocialSituationState>({
    livingSituation: "",
    maritalStatus: "",
    children: "",
    employment: "",
  });
  const [currentMedications, setCurrentMedications] = useState<string>("");
  const [pastMedications, setPastMedications] = useState<string>("");
  const [narrative, setNarrative] = useState<string>("");
  const [minutes, setMinutes] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setSymptoms(initialData.symptoms || symptoms);
      setColumbiaSuicideSeverity(initialData.columbiaSuicideSeverity || "");
      setAnxietyPanicAttacks(initialData.anxietyPanicAttacks || "");
      setPastMentalHealth(initialData.pastMentalHealth || pastMentalHealth);
      setPsychiatricHospitalizations(initialData.psychiatricHospitalizations || "");
      setSubstanceUse(initialData.substanceUse || substanceUse);
      setMedicalHistory(initialData.medicalHistory || medicalHistory);
      setOtherMedicalHistory(initialData.otherMedicalHistory || "");
      setFamilyMentalHealth(initialData.familyMentalHealth || familyMentalHealth);
      setSocialSituation(initialData.socialSituation || socialSituation);
      setCurrentMedications(initialData.currentMedications || "");
      setPastMedications(initialData.pastMedications || "");
      setNarrative(initialData.narrative || "");
      setMinutes(initialData.minutes ? String(initialData.minutes) : "");
    }
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Reset messages
    setError(null);
    setSuccessMessage(null);

    // Validation
    if (!minutes || parseInt(minutes, 10) <= 0) {
      setError("Please enter a valid number of minutes spent.");
      return;
    }

    const data = {
      patientId,
      createdBy: careManagerId,
      contactDate: new Date().toISOString().split("T")[0],
      symptoms,
      columbiaSuicideSeverity,
      anxietyPanicAttacks,
      pastMentalHealth,
      psychiatricHospitalizations,
      substanceUse,
      medicalHistory,
      otherMedicalHistory,
      familyMentalHealth,
      socialSituation,
      currentMedications,
      pastMedications,
      narrative,
      minutes: parseInt(minutes, 10),
    };

    console.log("Submitting intake form with data:", data);

    try {
      const response = await fetch("http://localhost:4353/api/patient-intake", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to submit intake form");
      }
      
      const responseData = await response.json();
      console.log("Intake form submission successful:", responseData);
      
      // Show success message
      setSuccessMessage("Patient intake form submitted successfully!");
      
      // Wait 1.5 seconds before closing the form to allow the user to see the success message
      setTimeout(() => {
        onSuccess();
      }, 1500);
    } catch (error) {
      console.error("Error submitting intake form:", error);
      setError(error instanceof Error ? error.message : "An unknown error occurred");
    }
  };

  const handleCheckboxChange = (
    obj: React.Dispatch<React.SetStateAction<any>>, 
    key: string, 
    subKey?: string
  ): void => {
    if (subKey) {
      setSubstanceUse((prev) => {
        // Use type assertion to handle the indexing
        const substance = prev[key as keyof SubstanceUseState];
        
        return {
          ...prev,
          [key]: { 
            ...substance, 
            [subKey]: !substance[subKey as keyof typeof substance] 
          },
        };
      });
    } else {
      obj((prev: any) => ({ ...prev, [key]: !prev[key] }));
    }
  };

  const handleTextChange = (
    obj: React.Dispatch<React.SetStateAction<any>>, 
    key: string, 
    value: string
  ): void => {
    obj((prev: any) => ({ ...prev, [key]: value }));
  };

  const calculateAge = (dob: string): number => {
    return new Date().getFullYear() - new Date(dob).getFullYear();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-5xl mx-auto pb-8">
      {/* Patient Verification Section */}
      <Card className="border-2 border-gray-200 shadow-sm">
        <CardHeader className="bg-slate-50">
          <CardTitle className="text-xl text-slate-800">Patient Information</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
          <div>
            <p className="text-sm text-gray-500">Name</p>
            <p className="font-medium">{patientName}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">MRN</p>
            <p className="font-medium">{mrn}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Primary Clinic</p>
            <p className="font-medium">{clinicName}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Enrollment Date</p>
            <p className="font-medium">{enrollmentDate}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Date of Birth</p>
            <p className="font-medium">{dob}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Age</p>
            <p className="font-medium">{calculateAge(dob)} years</p>
          </div>
        </CardContent>
      </Card>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded">
          {error}
        </div>
      )}

      {successMessage && (
        <div className="bg-green-50 border border-green-200 text-green-600 p-4 rounded">
          {successMessage}
        </div>
      )}

      <Card>
        <CardHeader className="bg-slate-50">
          <CardTitle className="text-xl text-slate-800">Current Symptoms</CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2">
            {Object.keys(symptoms).map((key) => (
              <div key={key} className="flex items-center space-x-2 py-1">
                <Checkbox
                  id={key}
                  checked={symptoms[key as keyof SymptomsState]}
                  onCheckedChange={(checked) => {
                    if (checked === true || checked === false) {
                      handleCheckboxChange(setSymptoms, key);
                    }
                  }}
                />
                <Label htmlFor={key} className="font-medium cursor-pointer">
                  {formatLabel(key)}
                </Label>
              </div>
            ))}
          </div>
          
          <div className="mt-6 space-y-4">
            <div>
              <Label htmlFor="columbiaSuicideSeverity" className="text-sm font-semibold block mb-1">
                Columbia Suicide Severity Rating Scale Results
              </Label>
              <Input
                id="columbiaSuicideSeverity"
                value={columbiaSuicideSeverity}
                onChange={(e) => setColumbiaSuicideSeverity(e.target.value)}
                placeholder="Enter results"
                className="w-full"
              />
            </div>
            
            <div>
              <Label htmlFor="anxietyPanicAttacks" className="text-sm font-semibold block mb-1">
                Anxiety or Panic Attacks
              </Label>
              <Textarea
                id="anxietyPanicAttacks"
                value={anxietyPanicAttacks}
                onChange={(e) => setAnxietyPanicAttacks(e.target.value)}
                placeholder="Describe anxiety or panic attacks"
                className="w-full resize-y min-h-[100px]"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="bg-slate-50">
          <CardTitle className="text-xl text-slate-800">Past Mental Health History</CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2">
            {Object.keys(pastMentalHealth).map((key) => (
              <div key={key} className="flex items-center space-x-2 py-1">
                <Checkbox
                  id={key}
                  checked={pastMentalHealth[key as keyof PastMentalHealthState]}
                  onCheckedChange={(checked) => {
                    if (checked === true || checked === false) {
                      handleCheckboxChange(setPastMentalHealth, key);
                    }
                  }}
                />
                <Label htmlFor={key} className="font-medium cursor-pointer">
                  {formatLabel(key)}
                </Label>
              </div>
            ))}
          </div>
          
          <div className="mt-6">
            <Label htmlFor="psychiatricHospitalizations" className="text-sm font-semibold block mb-1">
              Psychiatric Hospitalizations
            </Label>
            <Textarea
              id="psychiatricHospitalizations"
              value={psychiatricHospitalizations}
              onChange={(e) => setPsychiatricHospitalizations(e.target.value)}
              placeholder="Enter details"
              className="w-full resize-y min-h-[100px]"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="bg-slate-50">
          <CardTitle className="text-xl text-slate-800">Substance Use</CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.keys(substanceUse).map((key) => (
              <div key={key} className="border rounded p-3 bg-white">
                <Label className="font-semibold mb-2 block">{formatLabel(key)}</Label>
                <div className="flex justify-between mt-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={`${key}-current`}
                      checked={substanceUse[key as keyof SubstanceUseState].current}
                      onCheckedChange={(checked) => {
                        if (checked === true || checked === false) {
                          handleCheckboxChange(setSubstanceUse, key, "current");
                        }
                      }}
                    />
                    <Label htmlFor={`${key}-current`} className="cursor-pointer">Current</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={`${key}-past`}
                      checked={substanceUse[key as keyof SubstanceUseState].past}
                      onCheckedChange={(checked) => {
                        if (checked === true || checked === false) {
                          handleCheckboxChange(setSubstanceUse, key, "past");
                        }
                      }}
                    />
                    <Label htmlFor={`${key}-past`} className="cursor-pointer">Past</Label>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="bg-slate-50">
          <CardTitle className="text-xl text-slate-800">Medical History</CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2">
            {Object.keys(medicalHistory).map((key) => (
              <div key={key} className="flex items-center space-x-2 py-1">
                <Checkbox
                  id={key}
                  checked={medicalHistory[key as keyof MedicalHistoryState]}
                  onCheckedChange={(checked) => {
                    if (checked === true || checked === false) {
                      handleCheckboxChange(setMedicalHistory, key);
                    }
                  }}
                />
                <Label htmlFor={key} className="font-medium cursor-pointer">
                  {formatLabel(key)}
                </Label>
              </div>
            ))}
          </div>
          
          <div className="mt-6">
            <Label htmlFor="otherMedicalHistory" className="text-sm font-semibold block mb-1">
              Other Medical History
            </Label>
            <Textarea
              id="otherMedicalHistory"
              value={otherMedicalHistory}
              onChange={(e) => setOtherMedicalHistory(e.target.value)}
              placeholder="Enter other medical history"
              className="w-full resize-y min-h-[100px]"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="bg-slate-50">
          <CardTitle className="text-xl text-slate-800">Family Mental Health History</CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2">
            {Object.keys(familyMentalHealth).map((key) => (
              <div key={key} className="flex items-center space-x-2 py-1">
                <Checkbox
                  id={key}
                  checked={familyMentalHealth[key as keyof FamilyMentalHealthState]}
                  onCheckedChange={(checked) => {
                    if (checked === true || checked === false) {
                      handleCheckboxChange(setFamilyMentalHealth, key);
                    }
                  }}
                />
                <Label htmlFor={key} className="font-medium cursor-pointer">
                  {formatLabel(key)}
                </Label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="bg-slate-50">
          <CardTitle className="text-xl text-slate-800">Social Situation</CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {Object.keys(socialSituation).map((key) => (
              <div key={key}>
                <Label htmlFor={key} className="text-sm font-semibold block mb-1">
                  {formatLabel(key)}
                </Label>
                <Input
                  id={key}
                  value={socialSituation[key as keyof SocialSituationState]}
                  onChange={(e) => handleTextChange(setSocialSituation, key, e.target.value)}
                  placeholder={`Enter ${formatLabel(key).toLowerCase()}`}
                  className="w-full"
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="bg-slate-50">
          <CardTitle className="text-xl text-slate-800">Medications</CardTitle>
        </CardHeader>
        <CardContent className="pt-4 space-y-6">
          <div>
            <Label htmlFor="currentMedications" className="text-sm font-semibold block mb-1">
              Current Medications
            </Label>
            <Textarea
              id="currentMedications"
              value={currentMedications}
              onChange={(e) => setCurrentMedications(e.target.value)}
              placeholder="List current medications"
              className="w-full resize-y min-h-[100px]"
            />
          </div>
          
          <div>
            <Label htmlFor="pastMedications" className="text-sm font-semibold block mb-1">
              Past Medications Tried
            </Label>
            <Textarea
              id="pastMedications"
              value={pastMedications}
              onChange={(e) => setPastMedications(e.target.value)}
              placeholder="List past medications"
              className="w-full resize-y min-h-[100px]"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="bg-slate-50">
          <CardTitle className="text-xl text-slate-800">Session Notes</CardTitle>
        </CardHeader>
        <CardContent className="pt-4 space-y-6">
          <div>
            <Label htmlFor="narrative" className="text-sm font-semibold block mb-1">
              Narrative (Optional)
            </Label>
            <Textarea
              id="narrative"
              value={narrative}
              onChange={(e) => setNarrative(e.target.value)}
              placeholder="Optional summary or observations"
              className="w-full resize-y min-h-[120px]"
            />
          </div>
          
          <div>
            <Label htmlFor="minutes" className="text-sm font-semibold block mb-1">
              Minutes Spent
            </Label>
            <Input
              id="minutes"
              type="number"
              value={minutes}
              onChange={(e) => setMinutes(e.target.value)}
              placeholder="Enter minutes"
              min="1"
              required
              className="w-full max-w-[200px]"
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end space-x-4 pt-4">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onClose}
          className="px-6"
        >
          Cancel
        </Button>
        <Button 
          type="submit" 
          className="bg-blue-600 hover:bg-blue-700 text-white px-6"
        >
          Submit Intake Form
        </Button>
      </div>
    </form>
  );
} 