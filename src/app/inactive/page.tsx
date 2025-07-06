'use client'

import { useSelector } from 'react-redux'
import { RootState } from '@/lib/store'
import InactivePatients from '@/components/InactivePatients'

export default function InactivePage() {
  const selectedClinic = useSelector((state: RootState) => state.clinic.selectedClinic)

  return (
    <div className="w-full px-4 py-8">
      <InactivePatients selectedClinic={selectedClinic} />
    </div>
  )
} 