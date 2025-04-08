"use client";

import { useEffect, useState, useContext } from "react";
import InitialAssessmentForm from "./InitialAssessmentForm";
import FollowUpAssessmentForm from "./FollowUpAssessmentForm";
import ContactAttemptForm from "./ContactAttemptForm";
import PatientDocuments from "./PatientDocuments";
import SafetyPlanForm from "./SafetyPlanForm";
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

interface SafetyPlanData {
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
  const [showSafetyPlan, setShowSafetyPlan] = useState(false);
  const [showSafetyPlanWarning, setShowSafetyPlanWarning] = useState(false);
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
  const [latestSafetyPlan, setLatestSafetyPlan] = useState<SafetyPlanData | null>(null);
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

  const fetchLatestSafetyPlan = async () => {
    if (!patientData) return;
    try {
      const response = await fetch(`http://localhost:4353/api/safety-plan/${patientData.patientId}/latest`);
      if (!response.ok) throw new Error("Failed to fetch safety plan");
      const data = await response.json();
      setLatestSafetyPlan(data);
    } catch (error) {
      console.error("Error fetching safety plan:", error);
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

  const handleSafetyPlanSuccess = () => {
    setShowSafetyPlan(false);
    setShowSafetyPlanWarning(false);
    if (patientId) {
      fetchPatientFlags(patientId);
      fetchLatestSafetyPlan();
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
      fetchLatestSafetyPlan();
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
    if (flags.includes("Safety Plan") && (!latestSafetyPlan || !latestSafetyPlan.safetyPlanDiscussed)) {
      setShowSafetyPlanWarning(true);
    } else {
      setShowSafetyPlanWarning(false);
    }
  }, [flags, latestSafetyPlan]);

  if (loading) return <p>Loading patient data...</p>;
  if (error) return <p className="text-red-500">Error: {error}</p>;
  if (!patientData) return <p>No patient data available.</p>;

  console.log("logged-in user:", user);
  console.log("Patient providers:", patientData.providers);

  const validRoles = ["Admin", "BHCM"];
  if (!user || !validRoles.includes(user.role)) {
    return (
      <p className="text-red-500">
        Access Denied: You must be logged in as an Admin or BHCM to view this dashboard.
      </p>
    );
  }

  const careManager = patientData.providers.find((p) => p.providerType === "BHCM" && p.id === user.id);
  if (!careManager) {
    return (
      <p className="text-red-500">
        Access Denied: You are not assigned as the Behavioral Health Care Manager (BHCM) for this patient.
      </p>
    );
  }

  const careManagerId = careManager.id;
  const showInitialAssessmentButton = patientData.status === "E" && patientData.clinicName;
  const showFollowUpAssessmentButton = patientData.status === "T" && patientData.clinicName;

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
            <div className="bg-red-500 text-white px-4 py-2 rounded-lg font-semibold">Safety Plan</div>
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
            {flags.includes("Safety Plan") && (
              <Button
                onClick={() => setShowSafetyPlan(true)}
                className="bg-red-500 hover:bg-red-600 text-white"
              >
                Safety Plan Discussion
              </Button>
            )}
          </div>

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

          {/* Safety Plan */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Safety Plan</h2>
            {latestSafetyPlan ? (
              <div>
                <p><strong>Date:</strong> {latestSafetyPlan.contactDate}</p>
                <p><strong>Symptoms:</strong> {Object.entries(latestSafetyPlan.symptoms)
                  .filter(([_, value]) => value)
                  .map(([key]) => key.replace(/([A-Z])/g, " $1").trim()).join(", ")}</p>
                {latestSafetyPlan.columbiaSuicideSeverity && (
                  <p><strong>Columbia Suicide Severity:</strong> {latestSafetyPlan.columbiaSuicideSeverity}</p>
                )}
                {latestSafetyPlan.anxietyPanicAttacks && (
                  <p><strong>Anxiety/Panic Attacks:</strong> {latestSafetyPlan.anxietyPanicAttacks}</p>
                )}
                <p><strong>Past Mental Health:</strong> {Object.entries(latestSafetyPlan.pastMentalHealth)
                  .filter(([_, value]) => value)
                  .map(([key]) => key.replace(/([A-Z])/g, " $1").trim()).join(", ")}</p>
                {latestSafetyPlan.psychiatricHospitalizations && (
                  <p><strong>Psychiatric Hospitalizations:</strong> {latestSafetyPlan.psychiatricHospitalizations}</p>
                )}
                <p><strong>Substance Use:</strong> {Object.entries(latestSafetyPlan.substanceUse)
                  .map(([key, value]) => `${key.replace(/([A-Z])/g, " $1").trim()}: ${value.current ? "Current" : ""}${value.current && value.past ? ", " : ""}${value.past ? "Past" : ""}`)
                  .filter((entry) => entry.includes("Current") || entry.includes("Past"))
                  .join(", ")}</p>
                <p><strong>Medical History:</strong> {Object.entries(latestSafetyPlan.medicalHistory)
                  .filter(([_, value]) => value)
                  .map(([key]) => key.replace(/([A-Z])/g, " $1").trim()).join(", ")}</p>
                {latestSafetyPlan.otherMedicalHistory && (
                  <p><strong>Other Medical History:</strong> {latestSafetyPlan.otherMedicalHistory}</p>
                )}
                <p><strong>Family Mental Health:</strong> {Object.entries(latestSafetyPlan.familyMentalHealth)
                  .filter(([_, value]) => value)
                  .map(([key]) => key.replace(/([A-Z])/g, " $1").trim()).join(", ")}</p>
                <p><strong>Social Situation:</strong> {Object.entries(latestSafetyPlan.socialSituation)
                  .map(([key, value]) => `${key.replace(/([A-Z])/g, " $1").trim()}: ${value}`)
                  .join(", ")}</p>
                {latestSafetyPlan.currentMedications && (
                  <p><strong>Current Medications:</strong> {latestSafetyPlan.currentMedications}</p>
                )}
                {latestSafetyPlan.pastMedications && (
                  <p><strong>Past Medications:</strong> {latestSafetyPlan.pastMedications}</p>
                )}
                {latestSafetyPlan.narrative && (
                  <p><strong>Narrative:</strong> {latestSafetyPlan.narrative}</p>
                )}
                <p><strong>Safety Plan Discussed:</strong> {latestSafetyPlan.safetyPlanDiscussed ? "Yes" : "No"}</p>
                <p><strong>Minutes Spent:</strong> {latestSafetyPlan.minutes}</p>
                </div>
            ) : (
              <p>No safety plan discussion recorded.</p>
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
          <InitialAssessmentForm
            patientId={patientData.patientId}
            clinicId={patientData.clinicId}
            careManagerId={careManagerId}
            onClose={() => setShowInitialAssessment(false)}
            onSuccess={handleInitialAssessmentSuccess}
            patientName={`${patientData.firstName} ${patientData.lastName}`}
            mrn={patientData.mrn}
            clinicName={patientData.clinicName}
          />
        </DialogContent>
      </Dialog>

      {/* Follow-up Assessment Dialog */}
      <Dialog open={showFollowUpAssessment} onOpenChange={setShowFollowUpAssessment}>
        <DialogContent className="max-w-4xl w-full max-h-[85vh] overflow-y-auto bg-white rounded-xl shadow-2xl p-2">
          <div className="p-4 space-y-4">
            <div className="bg-blue-50 rounded-lg p-4 mb-4 border border-blue-100">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-600">Clinic:</span> {patientData.clinicName}
                </div>
                <div>
                  <span className="font-medium text-gray-600">Care Manager:</span> {careManager.name}
                </div>
              </div>
            </div>
            <FollowUpAssessmentForm
              patientId={patientData.patientId}
              clinicId={patientData.clinicId}
              careManagerId={careManagerId}
              onClose={() => setShowFollowUpAssessment(false)}
              onSuccess={handleFollowUpAssessmentSuccess}
              patientName={`${patientData.firstName} ${patientData.lastName}`}
              mrn={patientData.mrn}
              clinicName={patientData.clinicName}
              className="space-y-6"
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Contact Attempt Dialog */}
      <Dialog open={showContactAttempt} onOpenChange={setShowContactAttempt}>
        <DialogContent className="max-w-lg w-full bg-white rounded-xl shadow-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-gray-900">Record Contact Attempt</DialogTitle>
          </DialogHeader>
          <ContactAttemptForm
            patientId={patientData.patientId}
            clinicId={patientData.clinicId}
            careManagerId={careManagerId}
            onClose={() => setShowContactAttempt(false)}
            onSuccess={handleContactAttemptSuccess}
            patientName={`${patientData.firstName} ${patientData.lastName}`}
            mrn={patientData.mrn}
            clinicName={patientData.clinicName}
          />
        </DialogContent>
      </Dialog>

      {/* Patient Documents Dialog */}
      <PatientDocuments patientId={patientId} open={showDocuments} onOpenChange={setShowDocuments} />

      {/* Safety Plan Dialog */}
      <Dialog open={showSafetyPlan} onOpenChange={setShowSafetyPlan}>
        <DialogContent className="max-w-4xl w-full max-h-[85vh] overflow-y-auto bg-white">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Safety Plan Discussion</DialogTitle>
          </DialogHeader>
          <SafetyPlanForm
            patientId={patientData.patientId}
            careManagerId={careManagerId}
            onClose={() => setShowSafetyPlan(false)}
            onSuccess={handleSafetyPlanSuccess}
            initialData={latestSafetyPlan}
            patientName={`${patientData.firstName} ${patientData.lastName}`}
            mrn={patientData.mrn}
            clinicName={patientData.clinicName}
            enrollmentDate={patientData.enrollmentDate}
            dob={patientData.dob}
          />
        </DialogContent>
      </Dialog>

      {/* Safety Plan Warning Popup */}
      <Dialog open={showSafetyPlanWarning} onOpenChange={setShowSafetyPlanWarning}>
        <DialogContent className="max-w-md w-full bg-white rounded-xl shadow-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-red-600">Safety Plan Required</DialogTitle>
          </DialogHeader>
          <p className="text-gray-700 mb-4">
            This patient has a Safety Plan flag. Please complete the Safety Plan Discussion form.
          </p>
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => setShowSafetyPlanWarning(false)}
              className="text-gray-700"
            >
              Dismiss
            </Button>
            <Button
              onClick={() => {
                setShowSafetyPlanWarning(false);
                setShowSafetyPlan(true);
              }}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              Open Safety Plan Discussion
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