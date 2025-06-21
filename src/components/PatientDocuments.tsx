"use client";

import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format, parseISO } from "date-fns";
import { 
  ChevronDown, ChevronRight, ChevronLeft, Folder, FileText, Download, X, Search,
  FileIcon, FolderIcon, Clock, Calendar, Settings, FilePlus, User, Eye, RefreshCw,
  FileDigit, Download as DownloadIcon
} from "lucide-react";
import { Tooltip } from "@/components/ui/tooltip";

interface File {
  name: string;
  type: "PHQ-9" | "GAD-7" | "Contact_Attempt" | "Intake_Form";
  score?: number;
  answers?: number[];
  notes?: string;
  attemptDate?: string;
  contactDate?: string;
}

interface DocumentFolder {
  folderName: string;
  date: string;
  files: File[];
  isOpen: boolean;
}

interface PatientDocumentsProps {
  patientId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function PatientDocuments({ patientId, open, onOpenChange }: PatientDocumentsProps) {
  const [documentFolders, setDocumentFolders] = useState<DocumentFolder[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeFolder, setActiveFolder] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");

  // Keep track of folder types for better organization
  const folderTypes = {
    Intake_Form: { icon: <FileIcon className="text-purple-500" />, color: "bg-purple-50 text-purple-700" },
    Safety_Plan: { icon: <FileIcon className="text-orange-500" />, color: "bg-orange-50 text-orange-700" },
    Assessment: { icon: <FileText className="text-blue-500" />, color: "bg-blue-50 text-blue-700" },
    Contact_Attempt: { icon: <FilePlus className="text-green-500" />, color: "bg-green-50 text-green-700" }
  };

  const fetchPatientDocuments = async () => {
    setFetchError(null);
    try {
      const response = await fetch(`http://localhost:4353/api/patients/${patientId}/documents`, {
        credentials: "include",
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch patient documents: ${errorText}`);
      }
      const data = await response.json();
      
      // Organize folders by type and date
      const foldersWithOpen = data.folders.map((folder: DocumentFolder) => ({
        ...folder,
        date: format(parseISO(folder.date), "yyyy-MM-dd"),
        isOpen: false,
        files: folder.files.map((file) => ({
          ...file,
          type: file.type as "PHQ-9" | "GAD-7" | "Contact_Attempt" | "Intake_Form",
          answers: file.answers || [],
        })),
      }));
      
      // Sort folders by date (newest first)
      foldersWithOpen.sort((a: DocumentFolder, b: DocumentFolder) => new Date(b.date).getTime() - new Date(a.date).getTime());
      
      setDocumentFolders(foldersWithOpen);
      if (foldersWithOpen.length > 0) setActiveFolder(foldersWithOpen[0].folderName);
    } catch (error: any) {
      console.error("Error fetching patient documents:", error);
      setFetchError(`Unable to load documents: ${error.message}`);
    }
  };

  const handleFolderClick = (folderName: string) => {
    // First ensure we're properly removing active status from all other folders
    setDocumentFolders((prev) =>
      prev.map((folder) => ({
        ...folder, 
        isOpen: folder.folderName === folderName
      }))
    );
    
    // Then set active folder separately - this ensures clean state
    setActiveFolder(folderName);
  };

  const handleViewFile = (file: File) => setSelectedFile(file);

  const handleExportFile = async (contactDate: string, type: "PHQ-9" | "GAD-7" | "Contact_Attempt" | "Intake_Form") => {
    setDownloadError(null);
    const folderExists = documentFolders.some((folder) => folder.date === contactDate);
    if (!folderExists) {
      setDownloadError("Invalid date for the selected document.");
      return;
    }
    try {
      let endpoint;
      if (type === "Contact_Attempt") {
        endpoint = `http://localhost:4353/api/patients/${patientId}/contact-attempts/${contactDate}/export`;
      } else if (type === "Intake_Form") {
        endpoint = `http://localhost:4353/api/patients/${patientId}/intake/${contactDate}/export`;
      } else {
        endpoint = `http://localhost:4353/api/patients/${patientId}/assessments/${contactDate}/${type}/export`;
      }
      
      const response = await fetch(endpoint, {
        method: "GET",
        credentials: "include",
        headers: { "Accept": "application/pdf" },
      });
      if (!response.ok) throw new Error(`Failed to export PDF: ${await response.text()}`);
      const filename = response.headers.get("Content-Disposition")?.match(/filename="(.+)"/)?.[1] || `${type}_${contactDate}.pdf`;
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error: any) {
      setDownloadError(`Failed to download PDF: ${error.message}`);
    }
  };
  
  const handleExportMasterDocument = async () => {
    setDownloadError(null);
    try {
      const endpoint = `http://localhost:4353/api/patients/${patientId}/master-document`;
      
      // Show loading state
      const loadingToast = document.getElementById('loading-toast');
      if (loadingToast) loadingToast.style.display = 'flex';
      
      const response = await fetch(endpoint, {
        method: "GET",
        credentials: "include",
        headers: { "Accept": "application/pdf" },
      });
      
      // Hide loading state
      if (loadingToast) loadingToast.style.display = 'none';
      
      if (!response.ok) throw new Error(`Failed to export master document: ${await response.text()}`);
      
      const filename = response.headers.get("Content-Disposition")?.match(/filename="(.+)"/)?.[1] || `Master_Document_${patientId}.pdf`;
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error: any) {
      console.error('Error exporting master document:', error);
      setDownloadError(`Failed to download master document: ${error.message}`);
    }
  };

  useEffect(() => {
    if (open) fetchPatientDocuments();
  }, [open, patientId]);

  // Create separate category groupings for folder sidebar
  const foldersByCategory = {
    "Assessments": documentFolders.filter(folder => folder.folderName.includes("Assessment")),
    "Intake Forms": documentFolders.filter(folder => folder.folderName.includes("Intake_Form")),
    "Contact Attempts": documentFolders.filter(folder => folder.folderName.includes("Contact_Attempt"))
  };
  
  // Filter all folders based on search term
  const filteredFolders = documentFolders.filter(
    (folder) =>
      folder.folderName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      folder.files.some((file) => file.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Get active folder data - Key fix for folder organization issue
  const activeFolderData = activeFolder ? 
    documentFolders.find((folder) => folder.folderName === activeFolder) : null;

  // Get file icon based on file type
  const getFileIcon = (fileType: string) => {
    switch(fileType) {
      case "PHQ-9":
      case "GAD-7":
        return <FileText className="w-10 h-10 text-blue-500" />;
      case "Contact_Attempt":
        return <FilePlus className="w-10 h-10 text-green-500" />;
      case "Intake_Form":
        return <FileIcon className="w-10 h-10 text-purple-500" />;
      default:
        return <FileText className="w-10 h-10 text-gray-500" />;
    }
  };

  // For questions in the assessment viewer
  const questions = {
    "PHQ-9": [
      "Little interest or pleasure in doing things",
      "Feeling down, depressed, or hopeless",
      "Trouble falling or staying asleep, or sleeping too much",
      "Feeling tired or having little energy",
      "Poor appetite or overeating",
      "Feeling bad about yourself",
      "Trouble concentrating on things",
      "Moving or speaking so slowly",
      "Thoughts that you would be better off dead",
    ],
    "GAD-7": [
      "Feeling nervous, anxious, or on edge",
      "Not being able to stop or control worrying",
      "Worrying too much about different things",
      "Trouble relaxing",
      "Being so restless that it is hard to sit still",
      "Becoming easily annoyed or irritable",
      "Feeling afraid as if something awful might happen",
    ]
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-7xl w-[95vw] max-h-[90vh] p-0 bg-slate-50 rounded-xl shadow-2xl overflow-hidden">
        {/* MacOS style header with controls */}
        <div className="flex items-center bg-gradient-to-b from-gray-100 to-gray-200 border-b border-gray-300 p-2 h-12">
          <div className="flex space-x-2 pl-3">
            <button 
              onClick={() => onOpenChange(false)}
              className="w-3 h-3 rounded-full bg-red-500 hover:bg-red-600"
            ></button>
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
          </div>
          <div className="flex items-center mx-auto bg-white/80 rounded-md px-2 py-1 text-sm text-gray-600 w-1/3">
            <FolderIcon className="w-3 h-3 mr-1" />
            <span>Patient Documents</span>
          </div>
          <div className="flex space-x-3 pr-3">
            <button 
              onClick={() => setViewMode(viewMode === "list" ? "grid" : "list")}
              className="text-gray-500 hover:text-gray-700"
            >
              {viewMode === "list" ? 
                <div className="flex bg-gray-200 rounded p-1">
                  <div className="w-4 h-4 grid grid-cols-2 gap-0.5">
                    <div className="bg-gray-500 rounded-sm"></div>
                    <div className="bg-gray-500 rounded-sm"></div>
                    <div className="bg-gray-500 rounded-sm"></div>
                    <div className="bg-gray-500 rounded-sm"></div>
                  </div>
                </div> : 
                <div className="flex bg-gray-200 rounded p-1">
                  <div className="w-4 h-4 flex flex-col gap-0.5">
                    <div className="h-1 bg-gray-500 rounded-sm"></div>
                    <div className="h-1 bg-gray-500 rounded-sm"></div>
                    <div className="h-1 bg-gray-500 rounded-sm"></div>
                  </div>
                </div>
              }
            </button>
            <button className="text-gray-500 hover:text-gray-700">
              <Search className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Error messages */}
        {fetchError && (
          <div className="p-4 mx-6 mt-4 bg-red-50 text-red-600 rounded-lg text-sm">{fetchError}</div>
        )}
        {downloadError && (
          <div className="p-4 mx-6 mt-4 bg-red-50 text-red-600 rounded-lg text-sm">{downloadError}</div>
        )}

        <div className="flex flex-1 overflow-hidden h-[calc(90vh-120px)]">
          {/* File browser sidebar */}
          <div className={`bg-gray-100 border-r border-gray-200 transition-all duration-300 ${
            isSidebarOpen ? "w-60" : "w-0 overflow-hidden"
          }`}>
            {isSidebarOpen && (
              <div className="flex flex-col h-full">
                {/* Sidebar header with search */}
                <div className="p-3 border-b border-gray-200">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 w-4 h-4 text-gray-400" />
                    <Input
                      placeholder="Search documents..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8 w-full rounded-md border-gray-300 bg-white"
                    />
                  </div>
                </div>
                
                {/* Sidebar content with categorized folders */}
                <ScrollArea className="flex-1">
                  <div className="p-2">
                    {/* Favorites section */}
                    <div className="mb-4">
                      <h3 className="px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Favorites
                      </h3>
                      <div className="mt-1">
                        <button 
                          className="w-full flex items-center px-2 py-1.5 text-sm text-gray-700 rounded-md hover:bg-gray-200"
                          onClick={() => setActiveFolder(documentFolders[0]?.folderName)}
                        >
                          <Clock className="w-4 h-4 mr-2 text-gray-500" />
                          Recent
                        </button>
                      </div>
                    </div>
                    
                    {/* Categories */}
                    {Object.entries(foldersByCategory).map(([category, folders]) => (
                      folders.length > 0 && (
                        <div key={category} className="mb-4">
                          <h3 className="px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            {category}
                          </h3>
                          <ul className="mt-1 space-y-0.5">
                            {folders.map((folder) => (
                              <li key={folder.folderName}>
                                <button
                                  className={`w-full flex items-center px-2 py-1.5 text-sm rounded-md ${
                                    activeFolder === folder.folderName
                                      ? "bg-blue-100 text-blue-700 font-medium"
                                      : "text-gray-700 hover:bg-gray-200"
                                  }`}
                                  onClick={() => handleFolderClick(folder.folderName)}
                                >
                                  <FolderIcon className={`w-4 h-4 mr-2 ${
                                    activeFolder === folder.folderName
                                      ? "text-blue-600"
                                      : "text-gray-500"
                                  }`} />
                                  <span className="truncate">
                                    {folder.date}
                                  </span>
                                </button>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )
                    ))}
                  </div>
                </ScrollArea>
              </div>
            )}
          </div>

          {/* Main content area */}
          <div className="flex-1 flex flex-col">
            {/* Toolbar */}
            <div className="flex items-center justify-between px-4 py-2 bg-white border-b border-gray-200">
              <div className="flex items-center">
                <button
                  onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                  className="p-1.5 rounded-md text-gray-500 hover:bg-gray-100"
                >
                  {isSidebarOpen ? (
                    <ChevronLeft className="w-5 h-5" />
                  ) : (
                    <ChevronRight className="w-5 h-5" />
                  )}
                </button>
                
                <div className="ml-4 flex items-center text-sm text-gray-500">
                  <span className="font-medium">
                    {activeFolderData ? activeFolderData.folderName.replace(/_/g, " ") : "Documents"}
                  </span>
                  <span className="mx-1">•</span>
                  <span>{activeFolderData?.files.length || 0} items</span>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleExportMasterDocument}
                  className="p-1.5 rounded-md text-blue-500 hover:bg-blue-50 flex items-center"
                  title="Export Master Treatment History Document"
                >
                  <FileDigit className="w-4 h-4 mr-1" />
                  <span className="text-xs font-medium">Master Document</span>
                </button>
                <button
                  onClick={() => fetchPatientDocuments()}
                  className="p-1.5 rounded-md text-gray-500 hover:bg-gray-100"
                  title="Refresh"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            {/* File browser content */}
            <ScrollArea className="flex-1 p-4 bg-white">
              {activeFolderData ? (
                viewMode === "list" ? (
                  <div className="bg-white rounded-md">
                    {/* List header */}
                    <div className="grid grid-cols-12 px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">
                      <div className="col-span-6">Name</div>
                      <div className="col-span-2">Type</div>
                      <div className="col-span-2">Date</div>
                      <div className="col-span-2">Actions</div>
                    </div>
                    
                    {/* List items */}
                    <ul className="divide-y divide-gray-200">
                      {activeFolderData.files.map((file) => (
                        <li
                          key={`${activeFolderData.folderName}-${file.name}`}
                          className="grid grid-cols-12 px-4 py-3 items-center hover:bg-gray-50"
                        >
                          <div className="col-span-6 flex items-center">
                            {getFileIcon(file.type)}
                            <span className="ml-3 text-sm font-medium text-gray-700">{file.name}</span>
                          </div>
                          <div className="col-span-2">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              {file.type}
                            </span>
                          </div>
                          <div className="col-span-2 text-sm text-gray-500">
                            {activeFolderData.date}
                          </div>
                          <div className="col-span-2 flex space-x-2">
                            <button
                              onClick={() => handleViewFile(file)}
                              className="inline-flex items-center p-1.5 border border-transparent rounded-md shadow-sm text-xs font-medium text-white bg-blue-600 hover:bg-blue-700"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleExportFile(activeFolderData.date, file.type)}
                              className="inline-flex items-center p-1.5 border border-transparent rounded-md shadow-sm text-xs font-medium text-white bg-green-600 hover:bg-green-700"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {activeFolderData.files.map((file) => (
                      <div
                        key={`${activeFolderData.folderName}-${file.name}`}
                        className="flex flex-col items-center p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                        onClick={() => handleViewFile(file)}
                      >
                        {getFileIcon(file.type)}
                        <span className="mt-2 text-xs font-medium text-gray-700 text-center truncate w-full">
                          {file.name.length > 20 ? `${file.name.substring(0, 18)}...` : file.name}
                        </span>
                        <div className="mt-2 flex space-x-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewFile(file);
                            }}
                            className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleExportFile(activeFolderData.date, file.type);
                            }}
                            className="p-1 text-green-600 hover:bg-green-50 rounded"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-gray-500">
                  <FolderIcon className="w-16 h-16 text-gray-300" />
                  <p className="mt-2 text-sm">Select a folder to view its contents</p>
                </div>
              )}
            </ScrollArea>
            
            {/* Status bar */}
            <div className="py-1.5 px-4 bg-gray-100 text-xs text-gray-500 border-t border-gray-200">
              {activeFolderData?.files.length || 0} items
            </div>
          </div>
        </div>

        {/* File Viewer Dialog */}
        <Dialog open={!!selectedFile} onOpenChange={() => setSelectedFile(null)}>
          <DialogContent className="max-w-4xl w-full max-h-[85vh] bg-white rounded-xl shadow-2xl overflow-hidden">
            <DialogHeader className="px-6 py-4 bg-gradient-to-b from-gray-50 to-gray-100 border-b border-gray-200 flex items-center justify-between">
              <DialogTitle className="text-lg font-semibold text-gray-800 flex items-center">
                {getFileIcon(selectedFile?.type || "")}
                <span className="ml-3">{selectedFile?.name}</span>
              </DialogTitle>
              <Button variant="ghost" size="icon" onClick={() => setSelectedFile(null)}>
                <X className="w-5 h-5 text-gray-600" />
              </Button>
            </DialogHeader>
            
            {selectedFile && (
              <ScrollArea className="p-6 max-h-[65vh]">
                {/* File content based on type */}
                {selectedFile.type === "Contact_Attempt" ? (
                  <div className="space-y-6">
                    <div className="bg-gray-50 p-5 rounded-lg border border-gray-200">
                      <h3 className="text-lg font-medium text-gray-800 mb-4">Contact Attempt Details</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-500 font-medium">Attempt Date</p>
                          <p className="text-base text-gray-900">{selectedFile.attemptDate}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 font-medium">Type</p>
                          <p className="text-base text-gray-900">Contact Attempt</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 p-5 rounded-lg border border-gray-200">
                      <h3 className="text-lg font-medium text-gray-800 mb-4">Notes</h3>
                      <p className="text-base text-gray-900 whitespace-pre-wrap">
                        {selectedFile.notes || "No notes provided"}
                      </p>
                    </div>
                  </div>
                ) : selectedFile.type === "Intake_Form" ? (
                  <div className="space-y-6">
                    <div className="bg-gray-50 p-5 rounded-lg border border-gray-200">
                      <h3 className="text-lg font-medium text-gray-800 mb-4">Patient Intake Form</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-500 font-medium">Date</p>
                          <p className="text-base text-gray-900">{selectedFile.contactDate}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 font-medium">Type</p>
                          <p className="text-base text-gray-900">Patient Intake Form</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 p-5 rounded-lg border border-gray-200">
                      <h3 className="text-lg font-medium text-gray-800 mb-4">Form Information</h3>
                      <p className="text-base text-gray-700">
                        This is a comprehensive intake assessment form that includes patient symptoms, mental health history, 
                        substance use history, medical history, family mental health history, and social situation details.
                      </p>
                      <p className="mt-2 text-base text-gray-700">
                        Use the Export button below to download the complete intake form as a PDF.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="bg-gray-50 p-5 rounded-lg border border-gray-200">
                      <h3 className="text-lg font-medium text-gray-800 mb-4">Assessment Overview</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-500 font-medium">Type</p>
                          <p className="text-base text-gray-900">{selectedFile.type}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 font-medium">Date</p>
                          <p className="text-base text-gray-900">{activeFolderData?.date}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 font-medium">Score</p>
                          <p className="text-base text-gray-900">{selectedFile.score || "N/A"}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 p-5 rounded-lg border border-gray-200">
                      <h3 className="text-lg font-medium text-gray-800 mb-4">Questions & Answers</h3>
                      <div className="space-y-3">
                        {selectedFile.answers?.map((answer, index) => {
                          const options = ["Not at all", "Several days", "More than half the days", "Nearly every day"];
                          const question = 
                            selectedFile.type === "PHQ-9" || selectedFile.type === "GAD-7" 
                              ? questions[selectedFile.type]?.[index] || `Question ${index + 1}`
                              : `Question ${index + 1}`;
                          const selectedOption = options[answer] || "Not answered";
                          
                          return (
                            <div key={index} className="p-3 bg-white rounded border border-gray-200">
                              <p className="text-sm font-medium text-gray-800">{index + 1}. {question}</p>
                              <p className="text-sm text-gray-600 mt-1">
                                Answer: <span className={`font-medium ${answer >= 2 ? 'text-amber-600' : 'text-blue-600'}`}>{selectedOption}</span>
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </ScrollArea>
            )}
            
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-between">
              <Button variant="outline" onClick={() => setSelectedFile(null)}>
                Close
              </Button>
              
              {selectedFile && (
                <Button 
                  variant="default"
                  onClick={() => handleExportFile(activeFolderData?.date || "", selectedFile.type)}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export PDF
                </Button>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </DialogContent>
      
      {/* Loading toast for master document generation */}
      <div 
        id="loading-toast" 
        className="fixed bottom-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center space-x-2 z-50" 
        style={{ display: 'none' }}
      >
        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
        <span>Generating master document...</span>
      </div>
    </Dialog>
  );
}