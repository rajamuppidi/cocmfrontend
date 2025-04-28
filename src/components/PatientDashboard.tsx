"use client";

import { useEffect, useState, useContext } from "react";
import InitialAssessmentForm from "./InitialAssessmentForm";
import FollowUpAssessmentForm from "./FollowUpAssessmentForm";
import ContactAttemptForm from "./ContactAttemptForm";
import PatientDocuments from "./PatientDocuments";
import IntakeForm from "./IntakeForm";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import ScoreChart from "./scorechart";
import { UserContext } from "@/context/UserContext";
import PatientReminders from "./PatientReminders";
import { FaFolder } from "react-icons/fa";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Provider {
  id?: number;
  providerType: string;
  name: string;
  phone: string;
  email: string;
  serviceBeginDate: string;
  serviceEndDate: string | null;
}

interface PatientData {
  patientId: number;
  clinicId: number;
  mrn: string;
  firstName: string;
  lastName: string;
  dob: string;
  enrollmentDate: string;
  clinicName: string;
  status: string;
  phq9First: number | null;
  phq9Last: number | null;
  gad7First: number | null;
  gad7Last: number | null;
  providers: Provider[];
}

interface PatientDashboardProps {
  params: { patientId: string };
}

interface TreatmentHistoryEntry {
  assessment_date: string;
  assessment_by: string;
  user_role: string;
  assessment_type: string;
  phq9_score: number | null;
  gad7_score: number | null;
  psych_consultation_recommended: string;
  interaction_mode: string;
  duration_minutes: number | null;
}

interface ScoreHistoryData {
  assessmentDate: string;
  formattedDate: string;
  score: number;
}

interface LastUpdateInfo {
  updatedBy: string;
  updatedDate: string;
  score: number | null;
}

interface LastContactInfo {
  contactDate: string;
  contactType: string;
  contactPerson: string;
  clinicName: string;
}

interface IntakeFormData {
  contactDate: string;
  symptoms: Record<string, boolean>;
  columbiaSuicideSeverity: string;
  anxietyPanicAttacks: string;
  pastMentalHealth: Record<string, boolean>;
  psychiatricHospitalizations: string;
  substanceUse: Record<string, { current: boolean; past: boolean }>;
  medicalHistory: Record<string, boolean>;
  otherMedicalHistory: string;
  familyMentalHealth: Record<string, boolean>;
  socialSituation: Record<string, string>;
  currentMedications: string;
  pastMedications: string;
  narrative: string;
  safetyPlanDiscussed: boolean;
  minutes: number;
}

interface ContactAttempt {
  id: number;
  attemptDate: string;
  attemptedBy: string;
  userRole: string;
  minutes: number;
  notes: string;
}

export default function PatientDashboard({ params }: PatientDashboardProps) {
  const { patientId } = params;
  const user = useContext(UserContext); // Get logged-in user from context
  const [patientData, setPatientData] = useState<PatientData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [flags, setFlags] = useState<string[]>([]);
  const [showInitialAssessment, setShowInitialAssessment] = useState(false);
  const [showFollowUpAssessment, setShowFollowUpAssessment] = useState(false);
  const [showContactAttempt, setShowContactAttempt] = useState(false);
  const [showDocuments, setShowDocuments] = useState(false);
  const [showIntakeForm, setShowIntakeForm] = useState(false);
  const [showIntakeFormWarning, setShowIntakeFormWarning] = useState(false);
  const [expandedPHQ9, setExpandedPHQ9] = useState(false);
  const [expandedGAD7, setExpandedGAD7] = useState(false);
  const [phq9Data, setPHQ9Data] = useState<Array<{ date: string; score: number }>>([]);
  const [gad7Data, setGAD7Data] = useState<Array<{ date: string; score: number }>>([]);
  const [phq9TimeFilter, setPHQ9TimeFilter] = useState<"weekly" | "monthly" | "yearly">("weekly");
  const [gad7TimeFilter, setGAD7TimeFilter] = useState<"weekly" | "monthly" | "yearly">("weekly");
  const [phq9LastUpdate, setPHQ9LastUpdate] = useState<LastUpdateInfo>({
    updatedBy: "N/A",
    updatedDate: "N/A",
    score: null,
  });
  const [gad7LastUpdate, setGAD7LastUpdate] = useState<LastUpdateInfo>({
    updatedBy: "N/A",
    updatedDate: "N/A",
    score: null,
  });
  const [lastContactInfo, setLastContactInfo] = useState<LastContactInfo | null>(null);
  const [treatmentHistory, setTreatmentHistory] = useState<TreatmentHistoryEntry[]>([]);
  const [latestIntakeForm, setLatestIntakeForm] = useState<IntakeFormData | null>(null);
  const [attempts, setAttempts] = useState<ContactAttempt[]>([]);
  const [attemptPage, setAttemptPage] = useState(1);
  const itemsPerPage = 5;

  const fetchTreatmentHistory = async () => {
    if (!patientData) return;
    try {
      const response = await fetch(`http://localhost:4353/api/patients/${patientData.patientId}/treatment-history`);
      if (!response.ok) throw new Error("Failed to fetch treatment history");
      const data: TreatmentHistoryEntry[] = await response.json();
      setTreatmentHistory(data);
    } catch (error) {
      console.error("Error fetching treatment history:", error);
    }
  };

  const fetchPatientData = async (id: string) => {
    try {
      const response = await fetch(`http://localhost:4353/api/patients/${id}`);
      if (!response.ok) throw new Error("Failed to fetch patient data");
      const data = await response.json();
      console.log("Fetched patient data:", data);
      console.log("Clinic ID:", data.clinicId);
      setPatientData(data);
      setLoading(false);
    } catch (err) {
      setError((err as Error).message);
      setLoading(false);
    }
  };

  const fetchPatientFlags = async (id: string) => {
    try {
      const response = await fetch(`http://localhost:4353/api/patients/${id}/flags`);
      if (!response.ok) throw new Error("Failed to fetch patient flags");
      const data = await response.json();
      console.log("🚀 Flags Fetched:", data.flags);
      const formattedFlags = data.flags.map((f: { flag: string }) => f.flag);
      console.log("🚀 Formatted Flags:", formattedFlags);
      setFlags(formattedFlags);
    } catch (err) {
      console.error("Error fetching patient flags:", err);
    }
  };

  const fetchLastContactInfo = async () => {
    if (!patientData) return;
    try {
      const response = await fetch(`http://localhost:4353/api/patients/${patientData.patientId}/last-contact`);
      if (!response.ok) throw new Error("Failed to fetch last contact information");
      const data = await response.json();
      setLastContactInfo(data);
    } catch (error) {
      console.error("Error fetching last contact info:", error);
    }
  };

  const fetchScoreHistory = async (type: "PHQ-9" | "GAD-7", timeframe: string) => {
    if (!patientData) return;
    try {
      const response = await fetch(
        `http://localhost:4353/api/patients/${patientData.patientId}/assessment-history?type=${type}`
      );
      if (!response.ok) throw new Error("Failed to fetch history");
      const data = await response.json();
      if (type === "PHQ-9") setPHQ9Data(data);
      else setGAD7Data(data);
    } catch (error) {
      console.error(`Error fetching ${type} history:`, error);
    }
  };

  const fetchLastUpdateInfo = async (type: "PHQ-9" | "GAD-7") => {
    if (!patientData) return;
    try {
      const response = await fetch(
        `http://localhost:4353/api/patients/${patientData.patientId}/last-update?type=${type}`
      );
      if (!response.ok) throw new Error("Failed to fetch last update info");
      const data = await response.json();
      if (type === "PHQ-9") setPHQ9LastUpdate(data);
      else setGAD7LastUpdate(data);
    } catch (error) {
      console.error(`Error fetching ${type} last update info:`, error);
    }
  };

  const fetchLatestIntakeForm = async () => {
    if (!patientData) return;
    try {
      console.log("Fetching latest intake form for patient ID:", patientData.patientId);
      const url = `http://localhost:4353/api/patient-intake/${patientData.patientId}/latest`;
      console.log("Fetch URL:", url);
      
      const response = await fetch(url);
      console.log("Fetch response status:", response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log("Latest intake form data received:", data);
        setLatestIntakeForm(data);
      } else {
        console.log("No intake form found or error fetching form. Status:", response.status);
        if (response.status === 404 && patientData.status === "A") {
          console.log("Creating dummy intake form for Active patient");
          setLatestIntakeForm({
            contactDate: new Date().toISOString().split('T')[0],
            symptoms: {},
            columbiaSuicideSeverity: "",
            anxietyPanicAttacks: "",
            pastMentalHealth: {},
            psychiatricHospitalizations: "",
            substanceUse: {},
            medicalHistory: {},
            otherMedicalHistory: "",
            familyMentalHealth: {},
            socialSituation: {},
            currentMedications: "",
            pastMedications: "",
            narrative: "",
            safetyPlanDiscussed: true,
            minutes: 0
          });
        }
      }
    } catch (error) {
      console.error("Error fetching intake form:", error);
    }
  };

  const fetchContactAttempts = async () => {
    if (!patientData) return;
    try {
      const response = await fetch(`http://localhost:4353/api/contact-attempts/${patientData.patientId}`);
      if (!response.ok) throw new Error("Failed to fetch contact attempts");
      const data: ContactAttempt[] = await response.json();
      setAttempts(data);
    } catch (error) {
      console.error("Error fetching contact attempts:", error);
    }
  };

  const handleInitialAssessmentSuccess = () => {
    setShowInitialAssessment(false);
    if (patientId) {
      fetchPatientData(patientId);
      fetchPatientFlags(patientId);
      fetchTreatmentHistory();
      fetchLastUpdateInfo("PHQ-9");
      fetchLastUpdateInfo("GAD-7");
    }
  };

  const handleFollowUpAssessmentSuccess = () => {
    setShowFollowUpAssessment(false);
    if (patientId) {
      fetchPatientData(patientId);
      fetchPatientFlags(patientId);
      fetchTreatmentHistory();
      fetchLastUpdateInfo("PHQ-9");
      fetchLastUpdateInfo("GAD-7");
    }
  };

  const handleContactAttemptSuccess = () => {
    setShowContactAttempt(false);
    if (patientId) {
      fetchPatientData(patientId);
      fetchTreatmentHistory();
      fetchContactAttempts(); // Refresh contact attempts
    }
  };

  const handleIntakeFormSuccess = () => {
    setShowIntakeForm(false);
    setShowIntakeFormWarning(false);
    
    console.log("Intake form completed successfully, refreshing data...");
    
    if (patientId) {
      // Immediately update local patient data status to show UI changes
      if (patientData) {
        const updatedPatientData = { ...patientData, status: "A" };
        console.log("Updating patient status to Active in local state");
        setPatientData(updatedPatientData);
      }
      
      // Refresh all data from the server
      fetchPatientData(patientId);
      fetchPatientFlags(patientId);
      fetchLatestIntakeForm();
      fetchTreatmentHistory();
      fetchLastUpdateInfo("PHQ-9");
      fetchLastUpdateInfo("GAD-7");
      fetchLastContactInfo();
      
      // Delayed verification to ensure all data is refreshed
      setTimeout(() => {
        console.log("Verifying patient data after refresh");
        
        // Force a refetch of the latest intake form to ensure we have the most current data
        fetch(`http://localhost:4353/api/patient-intake/${patientId}/latest`)
          .then(response => {
            if (response.ok) return response.json();
            throw new Error("Failed to fetch updated intake form data");
          })
          .then(data => {
            console.log("Verified latest intake form:", data);
            
            setLatestIntakeForm(data);
            
            // Get fresh patient data to verify status
            return fetch(`http://localhost:4353/api/patients/${patientId}`);
          })
          .then(response => {
            if (response.ok) return response.json();
            throw new Error("Failed to fetch updated patient data");
          })
          .then(patientData => {
            console.log("Verified patient data:", patientData);
            console.log("Verified patient status:", patientData?.status);
            
            setPatientData(patientData);
            
            // Only show the prompt if the intake form exists
            if (latestIntakeForm) {
              if (confirm("Patient Intake completed. Would you like to proceed with the Initial Assessment?")) {
                setShowInitialAssessment(true);
              }
            }
          })
          .catch(error => {
            console.error("Error in verification process:", error);
          });
      }, 1500); // Increase timeout to ensure data is refreshed
    }
  };

  useEffect(() => {
    if (patientId) fetchPatientData(patientId);
    else {
      setError("No patient ID provided");
      setLoading(false);
    }
  }, [patientId]);

  useEffect(() => {
    if (patientData) {
      fetchPatientFlags(patientData.patientId.toString());
      fetchLastUpdateInfo("PHQ-9");
      fetchLastUpdateInfo("GAD-7");
      fetchLastContactInfo();
      fetchTreatmentHistory();
      fetchLatestIntakeForm();
      fetchContactAttempts();
    }
  }, [patientData]);

  useEffect(() => {
    if (expandedPHQ9) fetchScoreHistory("PHQ-9", phq9TimeFilter);
  }, [expandedPHQ9]);

  useEffect(() => {
    if (expandedGAD7) fetchScoreHistory("GAD-7", gad7TimeFilter);
  }, [expandedGAD7]);

  useEffect(() => {
    // Don't show warning if patient is already in Active status or if intake form exists
    if (patientData?.status === "A" || latestIntakeForm) {
      setShowIntakeFormWarning(false);
    } else {
      setShowIntakeFormWarning(true);
    }
    
    // Add debug logging
    console.log("Latest intake form updated:", latestIntakeForm);
    console.log("Patient status:", patientData?.status);
    console.log("Showing intake warning:", !(patientData?.status === "A") && !latestIntakeForm);
  }, [latestIntakeForm, patientData]);

  if (loading) return <p>Loading patient data...</p>;
  if (error) return <p className="text-red-500">Error: {error}</p>;
  if (!patientData) return <p>No patient data available.</p>;

  console.log("logged-in user:", user);
  console.log("Patient providers:", patientData.providers);

  const validRoles = ["Admin", "BHCM", "Psychiatric Consultant"];
  if (!user || !validRoles.includes(user.role)) {
    return (
      <p className="text-red-500">
        Access Denied: You must be logged in as an Admin, BHCM, or Psychiatric Consultant to view this dashboard.
      </p>
    );
  }

  if (user.role === "Psychiatric Consultant") {
    const isPsychiatricConsultantAssigned = patientData.providers.some(
      p => p.providerType === "Psychiatric Consultant" && p.id === user.id
    );
    
    if (!isPsychiatricConsultantAssigned) {
      return (
        <p className="text-red-500">
          Access Denied: You are not assigned as the Psychiatric Consultant for this patient.
        </p>
      );
    }
  } else if (user.role === "BHCM") {
  const careManager = patientData.providers.find((p) => p.providerType === "BHCM" && p.id === user.id);
  if (!careManager) {
    return (
      <p className="text-red-500">
        Access Denied: You are not assigned as the Behavioral Health Care Manager (BHCM) for this patient.
      </p>
    );
  }
  }

  const careManager = patientData.providers.find((p) => p.providerType === "BHCM" && p.id === user.id);
  const careManagerId = careManager?.id || 0;
  
  const userRoleIsCareManager = user?.role?.toUpperCase() === "BHCM" || 
                               user?.role?.toLowerCase() === "bhcm" ||
                               user?.role?.includes("Care Manager");
  
  const patientStatusAllowsAssessment = patientData?.status === "E" || patientData?.status === "A";
  
  // If intake form exists or patient is already Active, consider intake completed
  const hasCompletedIntakeForm = Boolean(latestIntakeForm) || patientData?.status === "A";
  
  // Determine if an initial assessment exists in treatment history
  const hasInitialAssessment = treatmentHistory.some(entry => 
    entry.assessment_type === "Initial Assessment"
  );
  
  // Update to show initial assessment button only if they haven't already done one
  const showInitialAssessmentButton = patientStatusAllowsAssessment && 
    patientData?.clinicName && userRoleIsCareManager && hasCompletedIntakeForm && 
    !hasInitialAssessment; // Don't show if they already have an initial assessment
  
  // Debug the button visibility
  console.log("Initial assessment button conditions:");
  console.log("- Patient status:", patientData?.status);
  console.log("- Status allows assessment:", patientStatusAllowsAssessment);
  console.log("- Has completed intake form:", hasCompletedIntakeForm);
  console.log("- Is care manager:", userRoleIsCareManager);
  console.log("- Has clinic name:", Boolean(patientData?.clinicName));
  console.log("- Has initial assessment:", hasInitialAssessment);
  console.log("Show initial assessment button:", showInitialAssessmentButton);
  
  const showFollowUpAssessmentButton = patientData?.status === "A" && 
    patientData?.clinicName && user?.role === "BHCM" && hasInitialAssessment;
  
  const showIntakeFormButton = patientData?.status === "E" && patientData?.clinicName && user?.role === "BHCM" && !hasCompletedIntakeForm;

  const totalAttemptPages = Math.ceil(attempts.length / itemsPerPage);
  const paginatedAttempts = attempts.slice((attemptPage - 1) * itemsPerPage, attemptPage * itemsPerPage);

  return (
    <div className="min-h-screen bg-gray-100 overflow-y-auto">
      {/* Header */}
      <div className="bg-blue-600 text-white p-4 relative">
        <h1 className="text-2xl font-bold">Clinical Dashboard</h1>
        <p className="text-sm">
          {patientData.lastName}, {patientData.firstName} | Status: {patientData.status}
          <br />
          Patient ID: {patientData.patientId} | MRN: {patientData.mrn}
          <br />
          Age: {new Date().getFullYear() - new Date(patientData.dob).getFullYear()} | DOB: {patientData.dob}
        </p>
        <div className="absolute top-4 right-4 flex space-x-2">
          {flags.includes("Pediatric Patient") && (
            <div className="bg-yellow-400 text-black px-4 py-2 rounded-lg font-semibold">Pediatric Patient</div>
          )}
          {flags.includes("Psychiatric Consult") && (
            <div className="bg-black text-white px-4 py-2 rounded-lg font-semibold">On Psychiatric Consultation</div>
          )}
          {flags.includes("Safety Plan") && (
            <div className="bg-red-600 text-white px-4 py-2 rounded-lg font-semibold">Safety Plan</div>
          )}
        </div>
      </div>

      <div className="p-4 flex">
        {/* Sidebar */}
        <div className="w-1/4 pr-4">
          <div className="bg-white rounded-lg shadow-md p-4 mb-4">
            <h2 className="text-lg font-semibold mb-2">Customize Dashboard View</h2>
            <div className="space-y-2">
              {["Patient Information", "Clinical Measures", "Treatment History", "Patient Documents"].map(
                (item, index) => (
                  <div key={index} className="flex items-center">
                    <Checkbox id={item.toLowerCase().replace(/\s/g, "-")} defaultChecked />
                    <Label htmlFor={item.toLowerCase().replace(/\s/g, "-")} className="ml-2">
                      {item}
                    </Label>
                  </div>
                )
              )}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4 mb-4">
            <PatientReminders patientId={patientData.patientId} />
          </div>
          <div className="bg-white rounded-lg shadow-md p-4 mb-4">
            <h2 className="text-lg font-semibold mb-2">Last Contact</h2>
            {lastContactInfo ? (
              <>
                <p>
                  {new Date(lastContactInfo.contactDate).toLocaleString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true,
                  })}
                </p>
                <p>
                  with {lastContactInfo.contactPerson}, {lastContactInfo.clinicName}
                </p>
                <p>Type: {lastContactInfo.contactType}</p>
              </>
            ) : (
              <p>No recent contact information available.</p>
            )}
          </div>
          <div className="bg-white rounded-lg shadow-md p-4 mb-4">
            <h2 className="text-lg font-semibold mb-2">Contact Attempt History</h2>
            <p className="text-sm font-medium text-gray-700">
              Total Minutes: {attempts.reduce((sum, attempt) => sum + attempt.minutes, 0)}
            </p>
            {attempts.length > 0 ? (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Contacted By</TableHead>
                      <TableHead>Minutes</TableHead>
                      <TableHead>Notes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedAttempts.map((attempt) => (
                      <TableRow key={attempt.id}>
                        <TableCell>{attempt.attemptDate}</TableCell>
                        <TableCell>{attempt.attemptedBy}</TableCell>
                        <TableCell>{attempt.minutes}</TableCell>
                        <TableCell>{attempt.notes}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <div className="flex justify-between mt-4">
                  <Button
                    onClick={() => setAttemptPage((prev) => Math.max(prev - 1, 1))}
                    disabled={attemptPage === 1}
                  >
                    Previous
                  </Button>
                  <span>
                    Page {attemptPage} of {totalAttemptPages}
                  </span>
                  <Button
                    onClick={() => setAttemptPage((prev) => Math.min(prev + 1, totalAttemptPages))}
                    disabled={attemptPage === totalAttemptPages}
                  >
                    Next
                  </Button>
                </div>
              </>
            ) : (
              <p>No contact attempts recorded.</p>
            )}
          </div>
          <div className="bg-white rounded-lg shadow-md p-4">
            <h2 className="text-lg font-semibold mb-2">Flags</h2>
            <p>
              <strong>Psychiatric Consult:</strong> {flags.includes("Psychiatric Consult") ? "Yes" : "No"}
            </p>
            <p>
              <strong>Pediatric Patient:</strong> {flags.includes("Pediatric Patient") ? "Yes" : "No"}
            </p>
            <p>
              <strong>Safety Plan:</strong> {flags.includes("Safety Plan") ? "Yes" : "No"}
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="w-3/4">
          <div className="flex space-x-2 mb-4">
            {showIntakeFormButton && (
              <Button
                onClick={() => setShowIntakeForm(true)}
                className="bg-purple-500 hover:bg-purple-600 text-white"
              >
                Start Patient Intake
              </Button>
            )}
            {showInitialAssessmentButton && (
              <Button
                onClick={() => setShowInitialAssessment(true)}
                className="bg-green-500 hover:bg-green-600 text-white"
              >
                Start Initial Assessment
              </Button>
            )}
            {showFollowUpAssessmentButton && (
              <Button
                onClick={() => setShowFollowUpAssessment(true)}
                className="bg-green-500 hover:bg-green-600 text-white"
              >
                Start Follow-up Assessment
              </Button>
            )}
            <Button
              onClick={() => setShowContactAttempt(true)}
              className="bg-yellow-500 hover:bg-yellow-600 text-white"
            >
              Record Contact Attempt
            </Button>
            <Button
              onClick={() => setShowDocuments(true)}
              className="bg-blue-500 hover:bg-blue-600 text-white flex items-center"
            >
              <FaFolder className="mr-2" /> View Patient Documents
            </Button>
          </div>

          {/* Add workflow progress indicator for enrolled patients */}
          {patientData.status === "E" && (
            <div className="mb-4 bg-blue-50 p-4 rounded-lg border border-blue-100">
              <h3 className="text-lg font-semibold mb-2">Enrollment Workflow</h3>
              <div className="flex items-center">
                <div className={`rounded-full w-8 h-8 flex items-center justify-center text-white ${hasCompletedIntakeForm ? 'bg-green-500' : 'bg-blue-500'}`}>
                  1
                </div>
                <div className="h-1 w-12 bg-gray-300 mx-2"></div>
                <div className={`rounded-full w-8 h-8 flex items-center justify-center text-white ${showInitialAssessmentButton ? 'bg-blue-500' : 'bg-gray-400'}`}>
                  2
                </div>
                <div className="h-1 w-12 bg-gray-300 mx-2"></div>
                <div className="rounded-full w-8 h-8 flex items-center justify-center text-white bg-gray-400">
                  3
                </div>
                <div className="ml-4">
                  <div className="flex flex-col text-sm">
                    <span className={`font-medium ${hasCompletedIntakeForm ? 'text-green-600' : 'text-blue-600'}`}>
                      1. Complete Patient Intake {hasCompletedIntakeForm && '✓'}
                    </span>
                    <span className={`font-medium ${showInitialAssessmentButton ? 'text-blue-600' : 'text-gray-500'}`}>
                      2. Complete Initial Assessment
                    </span>
                    <span className="font-medium text-gray-500">
                      3. Begin Treatment
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Add workflow progress indicator for active patients */}
          {patientData.status === "A" && (
            <div className="mb-4 bg-blue-50 p-4 rounded-lg border border-blue-100">
              <h3 className="text-lg font-semibold mb-2">Treatment Workflow</h3>
              <div className="flex items-center">
                <div className="rounded-full w-8 h-8 flex items-center justify-center text-white bg-green-500">
                  1
                </div>
                <div className="h-1 w-12 bg-gray-300 mx-2"></div>
                <div className={`rounded-full w-8 h-8 flex items-center justify-center text-white ${hasInitialAssessment ? 'bg-green-500' : (showInitialAssessmentButton ? 'bg-blue-500' : 'bg-gray-400')}`}>
                  2
                </div>
                <div className="h-1 w-12 bg-gray-300 mx-2"></div>
                <div className={`rounded-full w-8 h-8 flex items-center justify-center text-white ${showFollowUpAssessmentButton ? 'bg-blue-500' : 'bg-gray-400'}`}>
                  3
                </div>
                <div className="ml-4">
                  <div className="flex flex-col text-sm">
                    <span className="font-medium text-green-600">
                      1. Complete Patient Intake ✓
                    </span>
                    <span className={`font-medium ${hasInitialAssessment ? 'text-green-600' : (showInitialAssessmentButton ? 'text-blue-600' : 'text-gray-500')}`}>
                      2. Complete Initial Assessment {hasInitialAssessment && '✓'}
                    </span>
                    <span className={`font-medium ${showFollowUpAssessmentButton ? 'text-blue-600' : 'text-gray-500'}`}>
                      3. Continue with Follow-up Assessments {hasInitialAssessment && showFollowUpAssessmentButton && '→'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Patient Information */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Patient Information</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold">Enrollment</h3>
                <p>
                  <strong>Primary Clinic:</strong> {patientData.clinicName}
                </p>
                <p>
                  <strong>MRN:</strong> {patientData.mrn}
                </p>
                <p>
                  <strong>Enrollment Date:</strong> {patientData.enrollmentDate}
                </p>
                <p>
                  <strong>Patient ID:</strong> {patientData.patientId}
                </p>
              </div>
              <div>
                <h3 className="font-semibold">Demographic Information</h3>
                <p>
                  <strong>Last Name:</strong> {patientData.lastName}
                </p>
                <p>
                  <strong>First Name:</strong> {patientData.firstName}
                </p>
                <p>
                  <strong>Date of Birth:</strong> {patientData.dob}
                </p>
              </div>
            </div>
          </div>

          {/* Current Providers */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Current Providers</h2>
            <table className="w-full">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-2 text-left">Type</th>
                  <th className="p-2 text-left">Name</th>
                  <th className="p-2 text-left">Phone</th>
                  <th className="p-2 text-left">Email</th>
                  <th className="p-2 text-left">Service Begin</th>
                  <th className="p-2 text-left">Service End</th>
                </tr>
              </thead>
              <tbody>
                {patientData.providers.map((provider, index) => (
                  <tr key={index} className={index % 2 === 0 ? "bg-gray-50" : ""}>
                    <td className="p-2">{provider.providerType}</td>
                    <td className="p-2">{provider.name}</td>
                    <td className="p-2">{provider.phone}</td>
                    <td className="p-2">{provider.email}</td>
                    <td className="p-2">{provider.serviceBeginDate}</td>
                    <td className="p-2">{provider.serviceEndDate || "N/A"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Clinical Measures */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Clinical Measures</h2>
            <div className="mb-6">
              <div className="flex items-center justify-between">
                <p>
                  <strong>PHQ-9 Score:</strong> {patientData.phq9Last ?? "N/A"}/27,{" "}
                  {getSeverityLevel(patientData.phq9Last, "PHQ-9")}
                  <span className="ml-4 text-sm text-gray-500">
                    Last updated by: {getLastUpdatedBy("PHQ-9")}
                  </span>
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setExpandedPHQ9(!expandedPHQ9);
                    if (!expandedPHQ9) fetchScoreHistory("PHQ-9", phq9TimeFilter);
                  }}
                >
                  {expandedPHQ9 ? "Collapse" : "Expand"}
                </Button>
              </div>
              {expandedPHQ9 && (
                <ScoreChart
                  data={phq9Data}
                  maxScore={27}
                  color="#2563eb"
                  title="PHQ-9"
                  timeFilter={phq9TimeFilter}
                  onTimeFilterChange={(filter) => {
                    setPHQ9TimeFilter(filter);
                    fetchScoreHistory("PHQ-9", filter);
                  }}
                />
              )}
            </div>
            <div>
              <div className="flex items-center justify-between">
                <p>
                  <strong>GAD-7 Score:</strong> {patientData.gad7Last ?? "N/A"}/21,{" "}
                  {getSeverityLevel(patientData.gad7Last, "GAD-7")}
                  <span className="ml-4 text-sm text-gray-500">
                    Last updated by: {getLastUpdatedBy("GAD-7")}
                  </span>
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setExpandedGAD7(!expandedGAD7);
                    if (!expandedGAD7) fetchScoreHistory("GAD-7", gad7TimeFilter);
                  }}
                >
                  {expandedGAD7 ? "Collapse" : "Expand"}
                </Button>
              </div>
              {expandedGAD7 && (
                <ScoreChart
                  data={gad7Data}
                  maxScore={21}
                  color="#16a34a"
                  title="GAD-7"
                  timeFilter={gad7TimeFilter}
                  onTimeFilterChange={(filter) => {
                    setGAD7TimeFilter(filter);
                    fetchScoreHistory("GAD-7", filter);
                  }}
                />
              )}
            </div>
          </div>

          {/* Treatment History */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Treatment History</h2>
            {treatmentHistory.length > 0 ? (
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="p-2 text-left">Date</th>
                    <th className="p-2 text-left">Assessed By</th>
                    <th className="p-2 text-left">Role</th>
                    <th className="p-2 text-left">Assessment Type</th>
                    <th className="p-2 text-left">PHQ-9 Score</th>
                    <th className="p-2 text-left">GAD-7 Score</th>
                    <th className="p-2 text-left">Psych Consultation</th>
                    <th className="p-2 text-left">Mode</th>
                    <th className="p-2 text-left">Duration (min)</th>
                  </tr>
                </thead>
                <tbody>
                  {treatmentHistory.map((entry, index) => (
                    <tr key={index} className={index % 2 === 0 ? "bg-gray-50" : ""}>
                      <td className="p-2">{entry.assessment_date}</td>
                      <td className="p-2">{entry.assessment_by}</td>
                      <td className="p-2">{entry.user_role}</td>
                      <td className="p-2">{entry.assessment_type}</td>
                      <td className="p-2">{entry.phq9_score ?? "N/A"}</td>
                      <td className="p-2">{entry.gad7_score ?? "N/A"}</td>
                      <td className="p-2">{entry.psych_consultation_recommended}</td>
                      <td className="p-2">{entry.interaction_mode}</td>
                      <td className="p-2">{entry.duration_minutes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>No treatment history available.</p>
            )}
          </div>

          {/* Intake Assessment */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Patient Intake</h2>
            {latestIntakeForm ? (
              <div>
                <p><strong>Date:</strong> {latestIntakeForm.contactDate}</p>
                <p><strong>Symptoms:</strong> {Object.entries(latestIntakeForm.symptoms)
                  .filter(([_, value]) => value)
                  .map(([key]) => key.replace(/([A-Z])/g, " $1").trim()).join(", ")}</p>
                {latestIntakeForm.columbiaSuicideSeverity && (
                  <p><strong>Columbia Suicide Severity:</strong> {latestIntakeForm.columbiaSuicideSeverity}</p>
                )}
                {latestIntakeForm.anxietyPanicAttacks && (
                  <p><strong>Anxiety/Panic Attacks:</strong> {latestIntakeForm.anxietyPanicAttacks}</p>
                )}
                <p><strong>Past Mental Health:</strong> {Object.entries(latestIntakeForm.pastMentalHealth)
                  .filter(([_, value]) => value)
                  .map(([key]) => key.replace(/([A-Z])/g, " $1").trim()).join(", ")}</p>
                {latestIntakeForm.psychiatricHospitalizations && (
                  <p><strong>Psychiatric Hospitalizations:</strong> {latestIntakeForm.psychiatricHospitalizations}</p>
                )}
                <p><strong>Substance Use:</strong> {Object.entries(latestIntakeForm.substanceUse)
                  .map(([key, value]) => `${key.replace(/([A-Z])/g, " $1").trim()}: ${value.current ? "Current" : ""}${value.current && value.past ? ", " : ""}${value.past ? "Past" : ""}`)
                  .filter((entry) => entry.includes("Current") || entry.includes("Past"))
                  .join(", ")}</p>
                <p><strong>Medical History:</strong> {Object.entries(latestIntakeForm.medicalHistory)
                  .filter(([_, value]) => value)
                  .map(([key]) => key.replace(/([A-Z])/g, " $1").trim()).join(", ")}</p>
                {latestIntakeForm.otherMedicalHistory && (
                  <p><strong>Other Medical History:</strong> {latestIntakeForm.otherMedicalHistory}</p>
                )}
                <p><strong>Family Mental Health:</strong> {Object.entries(latestIntakeForm.familyMentalHealth)
                  .filter(([_, value]) => value)
                  .map(([key]) => key.replace(/([A-Z])/g, " $1").trim()).join(", ")}</p>
                <p><strong>Social Situation:</strong> {Object.entries(latestIntakeForm.socialSituation)
                  .map(([key, value]) => `${key.replace(/([A-Z])/g, " $1").trim()}: ${value}`)
                  .join(", ")}</p>
                {latestIntakeForm.currentMedications && (
                  <p><strong>Current Medications:</strong> {latestIntakeForm.currentMedications}</p>
                )}
                {latestIntakeForm.pastMedications && (
                  <p><strong>Past Medications:</strong> {latestIntakeForm.pastMedications}</p>
                )}
                {latestIntakeForm.narrative && (
                  <p><strong>Narrative:</strong> {latestIntakeForm.narrative}</p>
                )}
                <p><strong>Patient Intake Completed:</strong> {latestIntakeForm.safetyPlanDiscussed ? "Yes" : "No"}</p>
                <p><strong>Minutes Spent:</strong> {latestIntakeForm.minutes}</p>
              </div>
            ) : (
              <p>No patient intake recorded.</p>
            )}
          </div>
        </div>
      </div>

      {/* Initial Assessment Dialog */}
      <Dialog open={showInitialAssessment} onOpenChange={setShowInitialAssessment}>
        <DialogContent className="max-w-6xl w-full max-h-[90vh] overflow-y-auto bg-white">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Initial Assessment</DialogTitle>
          </DialogHeader>
          {patientData && (
            <InitialAssessmentForm
              patientId={patientData.patientId}
              clinicId={patientData.clinicId}
              careManagerId={Number(careManagerId)}
              onClose={() => setShowInitialAssessment(false)}
              onSuccess={handleInitialAssessmentSuccess}
              patientName={`${patientData.firstName} ${patientData.lastName}`}
              mrn={patientData.mrn}
              clinicName={patientData.clinicName}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Follow-up Assessment Dialog */}
      <Dialog open={showFollowUpAssessment} onOpenChange={setShowFollowUpAssessment}>
        <DialogContent className="max-w-4xl w-full max-h-[85vh] overflow-y-auto bg-white rounded-xl shadow-2xl p-2">
          <div className="p-4 space-y-4">
            <div className="bg-blue-50 rounded-lg p-4 mb-4 border border-blue-100">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-600">Clinic:</span> {patientData?.clinicName}
                </div>
                <div>
                  <span className="font-medium text-gray-600">Care Manager:</span> {careManager?.name}
                </div>
              </div>
            </div>
            {patientData && (
              <FollowUpAssessmentForm
                patientId={patientData.patientId}
                clinicId={patientData.clinicId}
                careManagerId={Number(careManagerId)}
                onClose={() => setShowFollowUpAssessment(false)}
                onSuccess={handleFollowUpAssessmentSuccess}
                patientName={`${patientData.firstName} ${patientData.lastName}`}
                mrn={patientData.mrn}
                clinicName={patientData.clinicName}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Contact Attempt Dialog */}
      <Dialog open={showContactAttempt} onOpenChange={setShowContactAttempt}>
        <DialogContent className="max-w-lg w-full bg-white rounded-xl shadow-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-gray-900">Record Contact Attempt</DialogTitle>
          </DialogHeader>
          {patientData && (
            <ContactAttemptForm
              patientId={patientData.patientId}
              clinicId={patientData.clinicId}
              careManagerId={Number(careManagerId)}
              onClose={() => setShowContactAttempt(false)}
              onSuccess={handleContactAttemptSuccess}
              patientName={`${patientData.firstName} ${patientData.lastName}`}
              mrn={patientData.mrn}
              clinicName={patientData.clinicName}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Patient Documents Dialog */}
      <PatientDocuments 
        patientId={patientId} 
        open={showDocuments} 
        onOpenChange={setShowDocuments}
      />

      {/* Intake Form Dialog */}
      <Dialog open={showIntakeForm} onOpenChange={setShowIntakeForm}>
        <DialogContent className="max-w-4xl w-full max-h-[85vh] overflow-y-auto bg-white">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Patient Intake</DialogTitle>
          </DialogHeader>
          {patientData && (
            <IntakeForm
              patientId={patientData.patientId.toString()}
              careManagerId={String(careManagerId)}
              onClose={() => setShowIntakeForm(false)}
              onSuccess={handleIntakeFormSuccess}
              initialData={latestIntakeForm}
              patientName={`${patientData.firstName} ${patientData.lastName}`}
              mrn={patientData.mrn}
              clinicName={patientData.clinicName}
              enrollmentDate={patientData.enrollmentDate}
              dob={patientData.dob}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Intake Form Warning Popup */}
      <Dialog open={showIntakeFormWarning} onOpenChange={setShowIntakeFormWarning}>
        <DialogContent className="max-w-md w-full bg-white rounded-xl shadow-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-red-600">Patient Intake Required</DialogTitle>
          </DialogHeader>
          <p className="text-gray-700 mb-4">
            This patient requires an Intake. Please complete the Patient Intake form.
          </p>
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => setShowIntakeFormWarning(false)}
              className="text-gray-700"
            >
              Dismiss
            </Button>
            <Button
              onClick={() => {
                setShowIntakeFormWarning(false);
                setShowIntakeForm(true);
              }}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              Open Patient Intake Form
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );

  function getSeverityLevel(score: number | null, measure: string): string {
    if (score === null) return "N/A";
    if (measure === "PHQ-9") {
      if (score <= 4) return "Minimal";
      if (score <= 9) return "Mild";
      if (score <= 14) return "Moderate";
      if (score <= 19) return "Moderately Severe";
      return "Severe";
    } else if (measure === "GAD-7") {
      if (score <= 4) return "Minimal";
      if (score <= 9) return "Mild";
      if (score <= 14) return "Moderate";
      return "Severe";
    }
    return "Unknown";
  }

  function getLastUpdatedBy(measure: string): string {
    const updateInfo = measure === "PHQ-9" ? phq9LastUpdate : gad7LastUpdate;
    if (updateInfo.updatedBy === "N/A") return "Not available";
    return `${updateInfo.updatedBy}, ${updateInfo.updatedDate}`;
  }
}