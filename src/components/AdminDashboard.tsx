'use client';

import { useState } from 'react';
import Clinics from '@/components/Clinics';
import Users from '@/components/Users';
import { Button } from '@/components/ui/button';

const AdminDashboard = () => {
  const [activeMenu, setActiveMenu] = useState('Clinics');

  const renderContent = () => {
    switch (activeMenu) {
      case 'Clinics':
        return <Clinics />;
      case 'Users':
        return <Users />;
      case 'Settings':
        return <div>Settings Content</div>;
      default:
        return <Clinics />;
    }
  };

  return (
    <div className="flex flex-col w-full h-screen">
      <main className="flex-1 p-0 bg-gray-100 w-full">
        {renderContent()}
      </main>
    </div>
  );
};

export default AdminDashboard;
