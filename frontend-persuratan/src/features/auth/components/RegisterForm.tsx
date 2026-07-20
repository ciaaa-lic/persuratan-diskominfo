'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useRegister } from '../api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';

export function RegisterForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const registerMutation = useRegister();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    registerMutation.mutate(
      { name, email, password },
      {
        onSuccess: () => {
          alert('Registration successful! You can now login.');
          router.push('/login');
        },
        onError: (error: unknown) => {
          const err = error as { response?: { data?: { message?: string } } };
          alert(err?.response?.data?.message || 'Registration failed');
        },
      }
    );
  };

  return (
    <Card className="w-[400px]">
      <CardHeader>
        <CardTitle>Register</CardTitle>
        <CardDescription>Create a new account.</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              type="text"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="intern@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full" disabled={registerMutation.isPending}>
            {registerMutation.isPending ? 'Registering...' : 'Sign Up'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
