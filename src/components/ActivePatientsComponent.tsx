'use client'
import Link from 'next/link';
import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ChevronDown, ChevronUp, Edit, Eye, Trash2, Info } from 'lucide-react'

interface Clinic {
  id: number
  name: string
}

interface Patient {
  id: number
  mrn: string
  firstName: string
  lastName: string
  status: string
  phq9First: number
  phq9Last: number
  gad7First: number
  gad7Last: number
  initialAssessmentDate: string
  lastFollowUpDate: string
  lastPsychiatricConsultDate: string
  lastRelapsePlanDate: string
  totalContacts: number
  weeksSinceInitialAssessment: number
  minutesThisMonth: number
}

type Order = 'asc' | 'desc'

interface HeadCell {
  id: keyof Patient
  label: string
  numeric: boolean
  info: string
}

const headCells: HeadCell[] = [
  { id: 'id', numeric: true, label: 'Patient ID', info: 'Unique identifier for the patient' },
  { id: 'mrn', numeric: false, label: 'MRN', info: 'Medical Record Number' },
  { id: 'firstName', numeric: false, label: 'First Name', info: 'Patient\'s first name' },
  { id: 'lastName', numeric: false, label: 'Last Name', info: 'Patient\'s last name' },
  { id: 'status', numeric: false, label: 'Status', info: 'Current status of the patient' },
  { id: 'phq9First', numeric: true, label: 'PHQ-9 First', info: 'Initial PHQ-9 score' },
  { id: 'phq9Last', numeric: true, label: 'PHQ-9 Last', info: 'Most recent PHQ-9 score' },
  { id: 'gad7First', numeric: true, label: 'GAD-7 First', info: 'Initial GAD-7 score' },
  { id: 'gad7Last', numeric: true, label: 'GAD-7 Last', info: 'Most recent GAD-7 score' },
  { id: 'initialAssessmentDate', numeric: false, label: 'I/A', info: 'Initial Assessment Date' },
  { id: 'lastFollowUpDate', numeric: false, label: 'F/U', info: 'Last Follow-Up Date' },
  { id: 'lastPsychiatricConsultDate', numeric: false, label: 'P/C', info: 'Last Psychiatric Consultation Date' },
  { id: 'lastRelapsePlanDate', numeric: false, label: 'RPP', info: 'Last Relapse Prevention Plan Date' },
  { id: 'totalContacts', numeric: true, label: '# Sessions', info: 'Total number of sessions' },
  { id: 'weeksSinceInitialAssessment', numeric: true, label: 'Wks since I/A', info: 'Weeks since Initial Assessment' },
  { id: 'minutesThisMonth', numeric: true, label: 'Minutes This Month', info: 'Total minutes spent this month' },
]

interface ActivePatientsComponentProps {
  selectedClinic: Clinic | null
}

export default function ActivePatientsComponent({ selectedClinic }: ActivePatientsComponentProps) {
  const router = useRouter()
  const [patients, setPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [order, setOrder] = useState<Order>('asc')
  const [orderBy, setOrderBy] = useState<keyof Patient>('lastName')
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(50)

  useEffect(() => {
    console.log("ActivePatientsComponent - selectedClinic:", selectedClinic);
    if (selectedClinic) {
      fetchPatients()
    }
  }, [selectedClinic])

  const fetchPatients = async () => {
    console.log("Fetching patients for clinic:", selectedClinic?.id);
    try {
      const response = await fetch(`http://localhost:4353/api/patients/active?clinicId=${selectedClinic?.id}`)
      console.log("API Response status:", response.status);
      if (!response.ok) {
        throw new Error('Failed to fetch patients')
      }
      const data = await response.json()
      console.log("Fetched patients data:", data);
      setPatients(data)
      setLoading(false)
    } catch (err) {
      console.error("Error fetching patients:", err);
      setError('Error fetching patients')
      setLoading(false)
    }
  }

  const handleRequestSort = (property: keyof Patient) => {
    const isAsc = orderBy === property && order === 'asc'
    setOrder(isAsc ? 'desc' : 'asc')
    setOrderBy(property)
  }

  const handleChangePage = (newPage: number) => {
    setPage(newPage)
  }

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }

  const handleView = (patientId: number) => {
    console.log("Navigating to patient dashboard, patientId:", patientId);
    router.push(`/patients/${patientId}`)
  }

  const handleEdit = (patientId: number) => {
    console.log(`Edit patient ${patientId}`)
  }

  const handleDelete = (patientId: number) => {
    console.log(`Delete patient ${patientId}`)
  }

  // Search Filter

  const filteredPatients = patients.filter((patient) =>
    patient.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.mrn.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.id.toString().includes(searchTerm)
  )

  const sortedPatients = filteredPatients.sort((a, b) => {
    if (a[orderBy] < b[orderBy]) {
      return order === 'asc' ? -1 : 1
    }
    if (a[orderBy] > b[orderBy]) {
      return order === 'asc' ? 1 : -1
    }
    return 0
  })

  const paginatedPatients = sortedPatients.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)

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

  // Update the table to show the status display text
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
          <CardTitle>Active Patients</CardTitle>
          {selectedClinic && (
            <p className="text-sm text-muted-foreground">
              Clinic: {selectedClinic.name}
            </p>
          )}
        </CardHeader>
        <CardContent>
          <div className="flex justify-between mb-4">
            <Input
              placeholder="Search by name or Patient ID"
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
              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {headCells.map((headCell) => (
                        <TableHead
                          key={headCell.id}
                          className="bg-gray-800 text-white font-bold"
                        >
                          <div className="flex items-center">
                            <Button
                              variant="ghost"
                              onClick={() => handleRequestSort(headCell.id)}
                              className="text-white"
                            >
                              {headCell.label}
                              {orderBy === headCell.id ? (
                                <span className="ml-2">
                                  {order === 'desc' ? (
                                    <ChevronDown className="h-4 w-4" />
                                  ) : (
                                    <ChevronUp className="h-4 w-4" />
                                  )}
                                </span>
                              ) : null}
                            </Button>
                            <div className="h-4 w-4 ml-1 relative group">
                              <Info className="h-4 w-4" />
                              <div className="absolute left-0 top-6 bg-black text-white text-xs rounded p-2 w-48 invisible group-hover:visible z-10">
                                {headCell.info}
                              </div>
                            </div>
                          </div>
                        </TableHead>
                      ))}
                      <TableHead className="bg-gray-800 text-white font-bold">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedPatients.map((patient) => (
                      <TableRow key={patient.id}>
                        <TableCell>
                          <Link href={`/patients/${patient.id}`} className="text-blue-600 hover:underline">
                            {patient.id}
                          </Link>
                        </TableCell>
                        <TableCell>{patient.mrn}</TableCell>
                        <TableCell>{patient.firstName}</TableCell>
                        <TableCell>{patient.lastName}</TableCell>
                        <TableCell className="py-2">
                          <div className="flex items-center">
                            <span className={`w-2 h-2 rounded-full mr-2 ${getStatusColor(patient.status)}`}></span>
                            {getStatusDisplay(patient.status)}
                          </div>
                        </TableCell>
                        <TableCell>{patient.phq9First ?? 'N/A'}</TableCell>
                        <TableCell>{patient.phq9Last ?? 'N/A'}</TableCell>
                        <TableCell>{patient.gad7First ?? 'N/A'}</TableCell>
                        <TableCell>{patient.gad7Last ?? 'N/A'}</TableCell>
                        <TableCell>{patient.initialAssessmentDate}</TableCell>
                        <TableCell>{patient.lastFollowUpDate}</TableCell>
                        <TableCell>{patient.lastPsychiatricConsultDate}</TableCell>
                        <TableCell>{patient.lastRelapsePlanDate}</TableCell>
                        <TableCell>{patient.totalContacts}</TableCell>
                        <TableCell>{patient.weeksSinceInitialAssessment}</TableCell>
                        <TableCell>{patient.minutesThisMonth}</TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <span className="sr-only">Open menu</span>
                                <ChevronDown className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem onClick={() => handleView(patient.id)}>
                                <Eye className="mr-2 h-4 w-4" />
                                View
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleEdit(patient.id)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => handleDelete(patient.id)}
                                className="text-red-600"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="flex items-center justify-between space-x-2 py-4">
                <span className="text-sm text-muted-foreground">
                  Showing {page * rowsPerPage + 1} - {Math.min((page + 1) * rowsPerPage, filteredPatients.length)} of {filteredPatients.length} records
                </span>
                <div className="space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleChangePage(page - 1)}
                    disabled={page === 0}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleChangePage(page + 1)}
                    disabled={(page + 1) * rowsPerPage >= filteredPatients.length}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

