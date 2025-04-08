// UserContext.tsx
import React from 'react';

interface User {
  id: string | number;
  email: string;
  name: string;
  role: string;
  clinics: Array<{ id: number; name: string }>;
}

export const UserContext = React.createContext<User | null>(null);
