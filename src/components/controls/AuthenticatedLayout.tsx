'use client';

import React, { ReactNode, useContext, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { setClinic } from '@/lib/clinicSlice';
import { RootState, AppDispatch } from '@/lib/store';
import { UserContext } from '@/context/UserContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ChevronDown, Wrench, ExternalLink} from 'lucide-react';
import { Menu, Transition } from '@headlessui/react';
import { Fragment } from 'react';

interface AuthenticatedLayoutProps {
  children: ReactNode;
}

interface Clinic {
  id: number;
  name: string;
}

const AuthenticatedLayout = ({ children }: AuthenticatedLayoutProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useDispatch<AppDispatch>();
  const selectedClinic = useSelector((state: RootState) => state.clinic.selectedClinic);

  const user = useContext(UserContext);

  useEffect(() => {
    if (!user) {
      router.push('/');
    } else if (user.role === 'Admin' && pathname !== '/admin') {
      router.push('/admin');
    } else if (user.role === 'Psychiatric Consultant') {
      const allowedPaths = ['/psych-dashboard', '/psych-patients', '/patients'];
      if (!allowedPaths.some(path => pathname.startsWith(path))) {
        router.push('/psych-dashboard');
      }
    } else if (user.role !== 'Admin' && user.role !== 'Psychiatric Consultant') {
      const allowedPaths = ['/dashboard', '/active-patients', '/enrolled-patients', '/patients'];
      if (!allowedPaths.some(path => pathname.startsWith(path))) {
        router.push('/dashboard');
      }
    }
  }, [user, router, pathname]);

  useEffect(() => {
    if (!selectedClinic && user?.clinics && user.clinics.length > 0) {
      const storedClinic = localStorage.getItem('selectedClinic');
      if (storedClinic) {
        dispatch(setClinic(JSON.parse(storedClinic)));
      } else if (user && user.clinics && user.clinics.length > 0) {
        dispatch(setClinic(user.clinics[0]));
      }
    }
  }, [selectedClinic, user, dispatch]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('selectedClinic');
    window.location.href = '/';
  };

  const handleNavigation = (tab: string) => {
    router.push(`/admin?tab=${tab}`);
  };

  const handleClinicChange = (clinic: Clinic) => {
    dispatch(setClinic(clinic));
  };

  return (
    <div className="bg-gray-100 min-h-screen w-full">
      <header className="flex items-center justify-between bg-gray-800 p-4 text-white fixed w-full z-10 top-0">
        <div className="flex items-center space-x-4 md:space-x-6">
          {user?.role === 'Admin' ? (
            <>
              <Button variant="ghost" className="text-white" onClick={() => handleNavigation('clinics')}>
                Clinics
              </Button>
              <Button variant="ghost" className="text-white" onClick={() => handleNavigation('users')}>
                Users
              </Button>
              <Button variant="ghost" className="text-white" onClick={() => handleNavigation('settings')}>
                Settings
              </Button>
            </>
          ) : user?.role === 'Psychiatric Consultant' ? (
            <>
              <Button 
                variant="ghost" 
                className="text-white"
                onClick={() => router.push('/psych-dashboard')}
              >
                Dashboard
              </Button>
              <Button 
                variant="ghost" 
                className="text-white"
                onClick={() => router.push('/psych-patients')}
              >
                My Patients
              </Button>
              <Menu as="div" className="relative inline-block text-left">
                <div>
                  <Menu.Button className="inline-flex items-center justify-center w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-black text-sm font-medium text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 focus:ring-indigo-500">
                    <Wrench  className="mr-2 h-5 w-5" aria-hidden="true" />
                    Tools
                    <ChevronDown className="ml-2 -mr-1 h-5 w-5" aria-hidden="true" />
                  </Menu.Button>
                </div>
                <Transition
                  as={Fragment}
                  enter="transition ease-out duration-100"
                  enterFrom="transform opacity-0 scale-95"
                  enterTo="transform opacity-100 scale-100"
                  leave="transition ease-in duration-75"
                  leaveFrom="transform opacity-100 scale-100"
                  leaveTo="transform opacity-0 scale-95"
                >
                  <Menu.Items className="absolute left-0 mt-2 w-56 origin-top-left rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                    <div className="py-1">
                      <Menu.Item>
                        {({ active }) => (
                          <a
                            href="https://diretto.mihin.net"
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`${
                              active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                            } block px-4 py-2 text-sm flex items-center`}
                          >
                            <span className="flex-grow">Diretto MIHIN</span>
                            <ExternalLink className="h-4 w-4 ml-2" aria-hidden="true" />
                          </a>
                        )}
                      </Menu.Item>
                      <Menu.Item>
                        {({ active }) => (
                          <a
                            href="https://cernercare.com/accounts/login?returnTo=https%3A%2F%2Fcernerdirect.com%2Finboxes%2Flogin%2Fopenid"
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`${
                              active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                            } block px-4 py-2 text-sm flex items-center`}
                          >
                            <span className="flex-grow">Cerner</span>
                            <ExternalLink className="h-4 w-4 ml-2" aria-hidden="true" />
                          </a>
                        )}
                      </Menu.Item>
                    </div>
                  </Menu.Items>
                </Transition>
              </Menu>
              {user?.clinics && user.clinics.length > 0 && (
                <Menu as="div" className="relative inline-block text-left">
                  <div>
                    <Menu.Button className="inline-flex justify-center w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-black text-sm font-medium text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 focus:ring-indigo-500">
                      {selectedClinic?.name || 'Select Clinic'}
                      <ChevronDown className="ml-2 -mr-1 h-5 w-5" aria-hidden="true" />
                    </Menu.Button>
                  </div>
                  <Transition
                    as={Fragment}
                    enter="transition ease-out duration-100"
                    enterFrom="transform opacity-0 scale-95"
                    enterTo="transform opacity-100 scale-100"
                    leave="transition ease-in duration-75"
                    leaveFrom="transform opacity-100 scale-100"
                    leaveTo="transform opacity-0 scale-95"
                  >
                    <Menu.Items className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
                      <div className="py-1">
                        {user?.clinics?.map((clinic: Clinic) => (
                          <Menu.Item key={clinic.id}>
                            {({ active }) => (
                              <button
                                onClick={() => handleClinicChange(clinic)}
                                className={`${
                                  active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                                } group flex items-center px-4 py-2 text-sm w-full text-left`}
                              >
                                {clinic.name}
                              </button>
                            )}
                          </Menu.Item>
                        ))}
                      </div>
                    </Menu.Items>
                  </Transition>
                </Menu>
              )}
            </>
          ) : (
            <>
              <Button 
                variant="ghost" 
                className="text-white"
                onClick={() => router.push('/dashboard')}
              >
                Dashboard
              </Button>
              <Menu as="div" className="relative inline-block text-left">
                <div>
                  <Menu.Button className="inline-flex justify-center w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-black text-sm font-medium text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 focus:ring-indigo-500">
                    Patient
                    <ChevronDown className="ml-2 -mr-1 h-5 w-5" aria-hidden="true" />
                  </Menu.Button>
                </div>
                <Transition
                  as={Fragment}
                  enter="transition ease-out duration-100"
                  enterFrom="transform opacity-0 scale-95"
                  enterTo="transform opacity-100 scale-100"
                  leave="transition ease-in duration-75"
                  leaveFrom="transform opacity-100 scale-100"
                  leaveTo="transform opacity-0 scale-95"
                >
                  <Menu.Items className="absolute left-0 mt-2 w-56 origin-top-left rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                    <div className="py-1">
                      <Menu.Item>
                        {({ active }) => (
                          <button
                            onClick={() => router.push(`/active-patients`)}
                            className={`${
                              active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                            } block w-full px-4 py-2 text-left text-sm`}
                          >
                            Active Patients
                          </button>
                        )}
                      </Menu.Item>
                      <Menu.Item>
                        {({ active }) => (
                          <button
                            onClick={() => router.push(`/enrolled-patients`)}
                            className={`${
                              active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                            } block w-full px-4 py-2 text-left text-sm`}
                          >
                            Enrolled Patients
                          </button>
                        )}
                      </Menu.Item>
                    </div>
                  </Menu.Items>
                </Transition>
              </Menu>
              <Menu as="div" className="relative inline-block text-left">
                <div>
                  <Menu.Button className="inline-flex items-center justify-center w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-black text-sm font-medium text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 focus:ring-indigo-500">
                    <Wrench  className="mr-2 h-5 w-5" aria-hidden="true" />
                    Tools
                    <ChevronDown className="ml-2 -mr-1 h-5 w-5" aria-hidden="true" />
                  </Menu.Button>
                </div>
                <Transition
                  as={Fragment}
                  enter="transition ease-out duration-100"
                  enterFrom="transform opacity-0 scale-95"
                  enterTo="transform opacity-100 scale-100"
                  leave="transition ease-in duration-75"
                  leaveFrom="transform opacity-100 scale-100"
                  leaveTo="transform opacity-0 scale-95"
                >
                  <Menu.Items className="absolute left-0 mt-2 w-56 origin-top-left rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                    <div className="py-1">
                      <Menu.Item>
                        {({ active }) => (
                          <a
                            href="https://diretto.mihin.net"
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`${
                              active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                            } block px-4 py-2 text-sm flex items-center`}
                          >
                            <span className="flex-grow">Diretto MIHIN</span>
                            <ExternalLink className="h-4 w-4 ml-2" aria-hidden="true" />
                          </a>
                        )}
                      </Menu.Item>
                      <Menu.Item>
                        {({ active }) => (
                          <a
                            href="https://cernercare.com/accounts/login?returnTo=https%3A%2F%2Fcernerdirect.com%2Finboxes%2Flogin%2Fopenid"
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`${
                              active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                            } block px-4 py-2 text-sm flex items-center`}
                          >
                            <span className="flex-grow">Cerner</span>
                            <ExternalLink className="h-4 w-4 ml-2" aria-hidden="true" />
                          </a>
                        )}
                      </Menu.Item>
                    </div>
                  </Menu.Items>
                </Transition>
              </Menu>
              {user?.clinics && user.clinics.length > 0 && (
                <Menu as="div" className="relative inline-block text-left">
                  <div>
                    <Menu.Button className="inline-flex justify-center w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-black text-sm font-medium text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 focus:ring-indigo-500">
                      {selectedClinic?.name || 'Select Clinic'}
                      <ChevronDown className="ml-2 -mr-1 h-5 w-5" aria-hidden="true" />
                    </Menu.Button>
                  </div>
                  <Transition
                    as={Fragment}
                    enter="transition ease-out duration-100"
                    enterFrom="transform opacity-0 scale-95"
                    enterTo="transform opacity-100 scale-100"
                    leave="transition ease-in duration-75"
                    leaveFrom="transform opacity-100 scale-100"
                    leaveTo="transform opacity-0 scale-95"
                  >
                    <Menu.Items className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
                      <div className="py-1">
                        {user?.clinics?.map((clinic: Clinic) => (
                          <Menu.Item key={clinic.id}>
                            {({ active }) => (
                              <button
                                onClick={() => handleClinicChange(clinic)}
                                className={`${
                                  active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                                } group flex items-center px-4 py-2 text-sm w-full text-left`}
                              >
                                {clinic.name}
                              </button>
                            )}
                          </Menu.Item>
                        ))}
                      </div>
                    </Menu.Items>
                  </Transition>
                </Menu>
              )}
            </>
          )}
        </div>
        <div className="font-bold text-2xl hidden md:block">UPHCS</div>
        <div className="flex items-center space-x-4 md:space-x-6">
          {user?.role !== 'Admin' && (
            <Input type="search" placeholder="Search Name, Patient ID, or MRN" className="w-40 md:w-64" />
          )}
          <span className="hidden md:block">Hello, {user?.name?.split(' ')[0]}</span>
          <Button variant="ghost" className="text-white">
            Help <ChevronDown className="ml-1 h-4 w-4" />
          </Button>
          <Button variant="ghost" className="text-white" onClick={handleLogout}>
            Logout
          </Button>
        </div>
      </header>
      <main className="mt-16 p-4">
        {React.cloneElement(children as React.ReactElement<any>, { user })}
      </main>
    </div>
  );
};

export default AuthenticatedLayout;