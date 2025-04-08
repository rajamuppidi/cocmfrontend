'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleLogin = async () => {
    try {
      const response = await fetch('http://localhost:4353/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: email, 
          password,
        }),
      });

      const result = await response.json();
      console.log('Server response:', result);

      if (response.ok) {
        localStorage.setItem('token', result.token);
        router.push('/admin');
      } else {
        alert(result.error || 'Invalid username or password');
      }
    } catch (error) {
      console.error('Error logging in:', error);
      alert('An error occurred while logging in. Please try again later.');
    }
  };

  // Login Form

  return (
    <div className="login-background">
      <Card className="w-full max-w-md p-6 md:p-8 bg-white text-black shadow-lg rounded-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">UPHCS LOGIN</CardTitle>
          <CardDescription>Please enter your username and password to log in.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              type="text"
              placeholder="Enter your Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="text-black"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="text-black"
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-700" onClick={handleLogin}>
            Log in
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Login;