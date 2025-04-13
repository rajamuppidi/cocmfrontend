'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import AdminDashboard from '@/components/AdminDashboard';
import Users from '@/components/Users';
import Clinics from '@/components/Clinics';

export default function AdminPage() {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState('clinics');

  useEffect(() => {
    const tab = searchParams.get('tab');
    console.log("Admin page tab param:", tab);
    if (tab) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  console.log("Admin page rendering tab:", activeTab);

  // Render the content based on the active tab
  const renderContent = () => {
    switch (activeTab) {
      case 'users':
        return <Users />;
      case 'settings':
        return <AdminDashboard />;
      case 'clinics':
      default:
        return <Clinics />;
    }
  };

  return renderContent();
}
