"use client";

import { useState, useEffect, useContext } from "react";
import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserContext } from "@/context/UserContext";

interface Patient {
  id: number;
  mrn: string;
  firstName: string;
  lastName: string;
  status: string;
  dob: string;
  enrollmentDate: string;
  phq9First: number | null;
  phq9Last: number | null;
  gad7First: number | null;
  gad7Last: number | null;
  deactivationDate: string;
  deactivationReason: string;
}

interface Clinic {
  id: number;
  name: string;
}

interface InactivePatientsProps {
  selectedClinic: Clinic | null;
}

export default function InactivePatients({ selectedClinic }: InactivePatientsProps) {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Patient;
    direction: "ascending" | "descending";
  }>({ key: "lastName", direction: "ascending" });
  const [page, setPage] = useState(0);
  const rowsPerPage = 10;
  const router = useRouter();

  useEffect(() => {
    console.log("InactivePatients - selectedClinic:", selectedClinic);
    if (selectedClinic) {
      fetchPatients();
    } else {
      console.log("No clinic selected");
      setLoading(false);
      setError("No clinic selected. Please select a clinic.");
    }
  }, [selectedClinic]);

  const fetchPatients = async () => {
    console.log("Fetching inactive patients for clinic:", selectedClinic?.id);
    try {
      const apiUrl = `http://localhost:4353/api/patients/inactive?clinicId=${selectedClinic?.id}`;
      console.log("API URL:", apiUrl);
      
      const response = await fetch(apiUrl);
      console.log("API Response status:", response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error response:", errorText);
        throw new Error(`Failed to fetch inactive patients: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log("Fetched inactive patients:", data);
      
      if (Array.isArray(data)) {
        setPatients(data);
      } else {
        console.error("Unexpected data format:", data);
        setError("Received invalid data format from server");
      }
      
      setLoading(false);
    } catch (err) {
      console.error("Error fetching inactive patients:", err);
      setError((err as Error).message || "An unknown error occurred");
      setLoading(false);
    }
  };

  const handleSort = (key: keyof Patient) => {
    let direction: "ascending" | "descending" = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  const sortedPatients = [...patients].sort((a, b) => {
    if (a[sortConfig.key] === null) return 1;
    if (b[sortConfig.key] === null) return -1;
    
    const aValue = a[sortConfig.key];
    const bValue = b[sortConfig.key];
    
    if (aValue === null && bValue === null) return 0;
    if (aValue === null) return 1;
    if (bValue === null) return -1;
    
    if (aValue < bValue) {
      return sortConfig.direction === "ascending" ? -1 : 1;
    }
    if (aValue > bValue) {
      return sortConfig.direction === "ascending" ? 1 : -1;
    }
    return 0;
  });

  const filteredPatients = sortedPatients.filter(
    (patient) =>
      patient.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.mrn.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const paginatedPatients = filteredPatients.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  // Helper function to get status display text
  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'A': return 'Active';
      case 'R': return 'Relapse Prevention Plan';
      case 'T': return 'Transferred';
      case 'E': return 'Enrolled';
      case 'D': return 'Inactive';
      default: return status;
    }
  };

  // Helper function for status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'A': return 'bg-green-500';
      case 'R': return 'bg-yellow-500';
      case 'T': return 'bg-blue-500';
      case 'E': return 'bg-purple-500';
      case 'D': return 'bg-gray-500';
      default: return '';
    }
  };

  return (
    <div className="w-full min-h-screen bg-white">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Inactive Patients</CardTitle>
          {selectedClinic && (
            <p className="text-sm text-muted-foreground">
              Clinic: {selectedClinic.name}
            </p>
          )}
        </CardHeader>
        <CardContent>
          <div className="flex justify-between mb-4">
            <Input
              type="text"
              placeholder="Search by name or MRN..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>
          {loading ? (
            <p>Loading patients...</p>
          ) : error ? (
            <p className="text-red-500">{error}</p>
          ) : (
            <>
              <div className="rounded-md border">
                <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="cursor-pointer" onClick={() => handleSort("mrn")}>
                    MRN {sortConfig.key === "mrn" && (sortConfig.direction === "ascending" ? "↑" : "↓")}
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort("firstName")}>
                    First Name {sortConfig.key === "firstName" && (sortConfig.direction === "ascending" ? "↑" : "↓")}
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort("lastName")}>
                    Last Name {sortConfig.key === "lastName" && (sortConfig.direction === "ascending" ? "↑" : "↓")}
                  </TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort("deactivationDate")}>
                    Deactivation Date {sortConfig.key === "deactivationDate" && (sortConfig.direction === "ascending" ? "↑" : "↓")}
                  </TableHead>
                  <TableHead>Deactivation Reason</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedPatients.length > 0 ? (
                  paginatedPatients.map((patient) => (
                    <TableRow key={patient.id}>
                      <TableCell>{patient.mrn}</TableCell>
                      <TableCell>{patient.firstName}</TableCell>
                      <TableCell>{patient.lastName}</TableCell>
                      <TableCell className="py-2">
                        <div className="flex items-center">
                          <span className={`w-2 h-2 rounded-full mr-2 ${getStatusColor(patient.status)}`}></span>
                          {getStatusDisplay(patient.status)}
                        </div>
                      </TableCell>
                      <TableCell>{patient.deactivationDate}</TableCell>
                      <TableCell>
                        <div className="max-w-xs truncate" title={patient.deactivationReason}>
                          {patient.deactivationReason}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => router.push(`/patients/${patient.id}`)}
                        >
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-4">
                      No inactive patients found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <Pagination className="mt-4">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => setPage((prev) => Math.max(0, prev - 1))}
                  className={page === 0 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>
              {Array.from({ length: Math.ceil(filteredPatients.length / rowsPerPage) }).map((_, index) => (
                <PaginationItem key={index}>
                  <PaginationLink
                    onClick={() => setPage(index)}
                    isActive={page === index}
                    className="cursor-pointer"
                  >
                    {index + 1}
                  </PaginationLink>
                </PaginationItem>
              ))}
              <PaginationItem>
                <PaginationNext
                  onClick={() => setPage((prev) => (prev + 1 < Math.ceil(filteredPatients.length / rowsPerPage) ? prev + 1 : prev))}
                  className={page + 1 >= Math.ceil(filteredPatients.length / rowsPerPage) ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>
            </PaginationContent>
              </Pagination>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 