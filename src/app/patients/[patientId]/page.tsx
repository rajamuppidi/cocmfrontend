'use client';

import PatientDashboard from '@/components/PatientDashboard';

export default function PatientPage({ params }: { params: { patientId: string } }) {
  return <PatientDashboard params={params} />;
}

