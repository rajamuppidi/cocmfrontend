'use client';

import React, { ReactNode, useEffect, useState } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import AuthenticatedLayout from '@/components/controls/AuthenticatedLayout';
import { jwtDecode } from 'jwt-decode';
import dynamic from 'next/dynamic';
import ActivePatientsPage from '@/app/active-patients/page';
import EnrolledPatientsPage from '@/app/enrolled-patients/page';
import { useDispatch, useSelector } from 'react-redux';
import { setClinic, initializeClinic } from '@/lib/clinicSlice';
import { RootState, AppDispatch } from '@/lib/store';
import { UserContext } from '@/context/UserContext';
import AdminDashboard from '@/components/AdminDashboard';

interface ClientRootLayoutProps {
  children: ReactNode;
}

interface User {
  id: string | number;
  email: string;
  name: string;
  role: string;
  clinics: Array<{ id: number; name: string }>;
}

const Clinics = dynamic(() => import('@/components/Clinics'));
const Users = dynamic(() => import('@/components/Users'));
const Dashboard = dynamic(() => import('@/components/dashboard'));
const PsychDashboard = dynamic(() => import('@/components/psych-dashboard'));
const PsychPatients = dynamic(() => import('@/components/psych-patients'));

const ClientRootLayout = ({ children }: ClientRootLayoutProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const dispatch = useDispatch<AppDispatch>();
  const selectedClinic = useSelector((state: RootState) => state.clinic.selectedClinic);
  const [user, setUser] = useState<User | null>(null);  // Initialize user state
  const [activeTab, setActiveTab] = useState('clinics');
  const [loading, setLoading] = useState(true);

  // Initialize clinic data
  useEffect(() => {
    dispatch(initializeClinic());
  }, [dispatch]);

  // Fetch user information
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded: any = jwtDecode(token);

        fetch(`http://localhost:4353/api/users/${decoded.id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
          .then((response) => {
            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
          })
          .then((data) => {
            setUser(data);  // Store the user data
            setLoading(false);  // Stop the loading spinner

            // Handle redirects based on user role
            if (data.role === 'Admin' && pathname !== '/admin') {
              router.push('/admin');
            } else if (data.role === 'Psychiatric Consultant') {
              const allowedPsychPaths = ['/psych-dashboard', '/psych-patients', '/patients'];
              if (!allowedPsychPaths.some(path => pathname.startsWith(path))) {
                router.push('/psych-dashboard');
              }
            } else if (data.role !== 'Admin' && data.role !== 'Psychiatric Consultant') {
              const allowedPaths = ['/dashboard', '/active-patients', '/enrolled-patients', '/patients'];
              if (!allowedPaths.some(path => pathname.startsWith(path))) {
                router.push('/dashboard');
              }
            }

            // Handle clinic selection
            if (data.clinics && data.clinics.length > 0 && !selectedClinic) {
              const storedClinic = localStorage.getItem('selectedClinic');
              if (storedClinic) {
                dispatch(setClinic(JSON.parse(storedClinic)));
              } else {
                dispatch(setClinic(data.clinics[0]));
              }
            }
          })
          .catch((error) => {
            console.error('Error fetching user:', error);
            setLoading(false);
          });
      } catch (error) {
        console.error('Error decoding token:', error);
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, [pathname, dispatch, selectedClinic, router]);

  // Handle tab for admin users
  useEffect(() => {
    if (user?.role === 'Admin') {
      const tab = searchParams.get('tab') || 'clinics';
      setActiveTab(tab);
    }
  }, [searchParams, user]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  const getActiveComponent = () => {
    const tab = (pathname.includes('?') ? pathname.split('?')[1]?.split('=')[1] : null) || 'dashboard';
    
    if (user?.role === 'Admin') {
      if (pathname === '/admin') {
        if (tab === 'clinics') return <Clinics />;
        if (tab === 'users') return <Users />;
        if (tab === 'settings') return <AdminDashboard />;
        return <Clinics />; // Default tab for admin
      }
    } else if (user?.role === 'Psychiatric Consultant') {
      if (pathname === '/psych-dashboard') {
        return <PsychDashboard />;
      } else if (pathname === '/psych-patients') {
        return <PsychPatients />;
      }
    } else {
      if (pathname === '/dashboard') {
        return <Dashboard />;
      }
    }
    
    return children;
  };

  // Render Authenticated Layout with user passed in props, check if path requires authentication
  return (
    <UserContext.Provider value={user}>
      {pathname !== '/' ? (
        <AuthenticatedLayout>
          {getActiveComponent()}
        </AuthenticatedLayout>
      ) : (
        <div className="min-h-screen flex items-center justify-center">{children}</div>
      )}
    </UserContext.Provider>
  );
};

export default ClientRootLayout;
