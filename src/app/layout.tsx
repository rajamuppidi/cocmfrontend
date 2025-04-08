"use client";

import ClientRootLayout from '@/components/controls/clientrootlayout';
import './globals.css';
import { Provider } from 'react-redux';
import { store } from '../lib/store';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="w-full h-screen overflow-y-auto">
        <Provider store={store}>
          <ClientRootLayout>{children}</ClientRootLayout>
        </Provider>
      </body>
    </html>
  );
}