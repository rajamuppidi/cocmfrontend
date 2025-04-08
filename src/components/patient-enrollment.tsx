'use client';

import React, { useState, useEffect } from "react";
import { useSelector } from 'react-redux';
import { RootState } from '@/lib/store';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { format } from 'date-fns';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert, { AlertProps } from '@mui/material/Alert';

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

interface PatientEnrollmentProps {
  onClose: () => void;
  onEnrollmentSuccess: () => void;
}

interface UserOption {
  id: number;
  name: string;
}

interface FormData {
  mrn: string;
  careManagerId: string;
  psychiatricConsultantId?: string;
  primaryCarePhysicianId?: string;
  firstName: string;
  lastName: string;
  enrollmentDate: Date | null;
  dob: Date | null;
}

const schema = yup.object().shape({
  mrn: yup.string().required('MRN is required'),
  careManagerId: yup.string().required('Care Manager is required'),
  firstName: yup.string().required('First Name is required'),
  lastName: yup.string().required('Last Name is required'),
  enrollmentDate: yup.date().required('Enrollment Date is required').nullable(),
  dob: yup.date().required('Date of Birth is required').nullable(),
  psychiatricConsultantId: yup.string().optional(),
  primaryCarePhysicianId: yup.string().optional(),
});

export default function PatientEnrollment({ onClose, onEnrollmentSuccess }: PatientEnrollmentProps) {
  const selectedClinic = useSelector((state: RootState) => state.clinic.selectedClinic);
  const [careManagers, setCareManagers] = useState<UserOption[]>([]);
  const [psychiatricConsultants, setPsychiatricConsultants] = useState<UserOption[]>([]);
  const [primaryCarePhysicians, setPrimaryCarePhysicians] = useState<UserOption[]>([]);
  const [submissionStatus, setSubmissionStatus] = useState<string | null>(null);
  const [openSnackbar, setOpenSnackbar] = useState(false);

  const { register, handleSubmit, formState: { errors, isValid }, control, watch, setValue } = useForm<FormData>({
    resolver: yupResolver(schema)
  });

  useEffect(() => {
    if (selectedClinic) {
      const fetchAssociatedUsers = async () => {
        try {
          const careManagerResponse = await fetch(`http://localhost:4353/api/patients/care-managers?clinicId=${selectedClinic.id}`);
          const careManagersData = await careManagerResponse.json();
          setCareManagers(Array.isArray(careManagersData) ? careManagersData : []);

          const consultantResponse = await fetch(`http://localhost:4353/api/patients/consultants?clinicId=${selectedClinic.id}`);
          const consultantsData = await consultantResponse.json();
          setPsychiatricConsultants(Array.isArray(consultantsData) ? consultantsData : []);

          const pcpResponse = await fetch(`http://localhost:4353/api/patients/primary-care-physicians?clinicId=${selectedClinic.id}`);
          const pcpData = await pcpResponse.json();
          setPrimaryCarePhysicians(Array.isArray(pcpData) ? pcpData : []);

        } catch (error) {
          setSubmissionStatus('Error fetching associated users');
          console.error("Error fetching associated users:", error);
        }
      };

      fetchAssociatedUsers();
    }
  }, [selectedClinic]);

  const onSubmit = async (data: FormData) => {
    setSubmissionStatus(null);

    const formattedData = {
      ...data,
      enrollmentDate: data.enrollmentDate ? format(data.enrollmentDate, 'MM/dd/yyyy') : null,
      dob: data.dob ? format(data.dob, 'MM/dd/yyyy') : null,
      clinicId: selectedClinic?.id,
    };

    try {
      const response = await fetch(`http://localhost:4353/api/patients`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formattedData)
      });
      if (response.ok) {
        setSubmissionStatus('Patient enrolled successfully');
        setOpenSnackbar(true);
        onEnrollmentSuccess();
      } else {
        const errorData = await response.json();
        setSubmissionStatus(`Error enrolling patient: ${errorData.error || response.statusText}`);
      }
    } catch (error) {
      setSubmissionStatus(`Error enrolling patient: ${(error as Error).message}`);
    }
  };

  const setToday = () => {
    const today = new Date();
    setValue('enrollmentDate', today);
  };

  const careManagerId = watch("careManagerId");
  const psychiatricConsultantId = watch("psychiatricConsultantId");
  const primaryCarePhysicianId = watch("primaryCarePhysicianId");

  const handleCloseSnackbar = (event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpenSnackbar(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <Card className="w-full bg-white shadow-md">
          <CardHeader className="bg-gray-100 border-b">
            <CardTitle className="text-2xl font-bold">Patient Enrollment</CardTitle>
            <CardDescription>Enroll a new patient for {selectedClinic?.name}</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit(onSubmit)}>
            <CardContent className="grid grid-cols-1 gap-6 md:grid-cols-3 p-6">
              <div className="space-y-2">
                <Label htmlFor="clinic">Primary Clinic</Label>
                <Input id="clinic" value={selectedClinic?.name} disabled className="bg-gray-100" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="enrollment-date">Enrollment Date</Label>
                <div className="flex items-center space-x-2">
                  <Controller
                    name="enrollmentDate"
                    control={control}
                    render={({ field }) => (
                      <DatePicker
                        selected={field.value}
                        onChange={(date: Date) => field.onChange(date)}
                        dateFormat="MM/dd/yyyy"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        placeholderText="Select date"
                        showYearDropdown
                        showMonthDropdown
                        dropdownMode="select"
                      />
                    )}
                  />
                  <Button type="button" onClick={setToday} variant="outline">
                    Today
                  </Button>
                </div>
                {errors.enrollmentDate && <p className="text-red-600 text-sm">{errors.enrollmentDate.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="mrn">MRN</Label>
                <Input id="mrn" {...register("mrn")} placeholder="Enter MRN" />
                {errors.mrn && <p className="text-red-600 text-sm">{errors.mrn.message}</p>}
              </div>
            </CardContent>
            <CardContent className="grid grid-cols-1 gap-6 md:grid-cols-3 p-6">
              <div className="space-y-2">
                <Label htmlFor="care-manager">Care Manager</Label>
                <Select onValueChange={(value) => setValue('careManagerId', value)}>
                  <SelectTrigger>
                    <SelectValue>{careManagerId ? careManagers.find(manager => manager.id.toString() === careManagerId)?.name : 'Select care manager'}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {careManagers.map(manager => (
                      <SelectItem key={manager.id} value={manager.id.toString()}>{manager.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.careManagerId && <p className="text-red-600 text-sm">{errors.careManagerId.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="consultant">Psychiatric Consultant</Label>
                <Select onValueChange={(value) => setValue('psychiatricConsultantId', value)}>
                  <SelectTrigger>
                    <SelectValue>{psychiatricConsultantId ? psychiatricConsultants.find(consultant => consultant.id.toString() === psychiatricConsultantId)?.name : 'Select consultant'}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {psychiatricConsultants.map(consultant => (
                      <SelectItem key={consultant.id} value={consultant.id.toString()}>{consultant.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="primary-care-physician">Primary Care Physician</Label>
                <Select onValueChange={(value) => setValue('primaryCarePhysicianId', value)}>
                  <SelectTrigger>
                    <SelectValue>{primaryCarePhysicianId ? primaryCarePhysicians.find(pcp => pcp.id.toString() === primaryCarePhysicianId)?.name : 'Select primary care physician'}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {primaryCarePhysicians.map(pcp => (
                      <SelectItem key={pcp.id} value={pcp.id.toString()}>{pcp.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
            <Separator className="my-6" />
            <CardHeader>
              <CardTitle className="text-xl font-semibold">Demographic Details</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-6 md:grid-cols-2 p-6">
              <div className="space-y-2">
                <Label htmlFor="first-name">First Name</Label>
                <Input id="first-name" {...register("firstName")} placeholder="Enter first name" />
                {errors.firstName && <p className="text-red-600 text-sm">{errors.firstName.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="last-name">Last Name</Label>
                <Input id="last-name" {...register("lastName")} placeholder="Enter last name" />
                {errors.lastName && <p className="text-red-600 text-sm">{errors.lastName.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="dob">Date of Birth</Label>
                <Controller
                  name="dob"
                  control={control}
                  render={({ field }) => (
                    <DatePicker
                      selected={field.value}
                      onChange={(date: Date) => field.onChange(date)}
                      dateFormat="MM/dd/yyyy"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      placeholderText="Select date of birth"
                      showYearDropdown
                      showMonthDropdown
                      dropdownMode="select"
                    />
                  )}
                />
                {errors.dob && <p className="text-red-600 text-sm">{errors.dob.message}</p>}
              </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-2 bg-gray-50 border-t p-4">
              <Button variant="outline" onClick={onClose}>Cancel</Button>
              <Button type="submit" className="bg-blue-500 text-white hover:bg-blue-600" disabled={!isValid}>Enroll Patient</Button>          
            </CardFooter>
          </form>
        </Card>
      </div>
      <Snackbar open={openSnackbar} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity="success" sx={{ width: '100%' }}>
          Patient enrolled successfully!
        </Alert>
      </Snackbar>
    </div>
  );
}
