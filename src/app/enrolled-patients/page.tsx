'use client'

import { useSelector } from 'react-redux'
import { RootState } from '@/lib/store'
import EnrolledPatientsComponent from '@/components/EnrolledPatientsComponent';

export default function EnrolledPatientsPage() {
  console.log('EnrolledPatientsPage rendered');
  const selectedClinic = useSelector((state: RootState) => state.clinic.selectedClinic)

  return (
    <div className="w-full px-4 py-8">
      <EnrolledPatientsComponent selectedClinic={selectedClinic} />
    </div>
  )
}