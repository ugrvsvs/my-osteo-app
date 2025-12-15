'use client';

import { Logo } from '@/components/app/logo';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('doctor@osteo.app');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // In a real app, you would have a context or state management for user session
  // For this demo, we'll just redirect to dashboard
  useEffect(() => {
    // Uncomment this to re-enable login flow
    // const isLoggedIn = sessionStorage.getItem('isLoggedIn');
    // if (isLoggedIn) {
    //   router.push('/dashboard');
    // }
  }, [router]);

  const handleSignIn = async () => {
    setLoading(true);
    setError('');
    // Mock API call
    await new Promise(resolve => setTimeout(resolve, 500));
    if (email === 'doctor@osteo.app' && password === 'password123') {
        // In a real app, you'd get a token and store it.
        // For now, just mark as logged in.
        sessionStorage.setItem('isLoggedIn', 'true');
        router.push('/dashboard');
    } else {
        setError('Неверный email или пароль.');
    }
    setLoading(false);
  };
  
  // Skip login for dev
  useEffect(() => {
    router.push('/dashboard');
  }, [router]);


  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            <Logo />
          </div>
          <CardTitle>Вход в Мой Остео</CardTitle>
          <CardDescription>Войдите, чтобы управлять вашими пациентами.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="doctor@osteo.app" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="space-y-2">
                <Label htmlFor="password">Пароль</Label>
                <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button onClick={handleSignIn} className="w-full" disabled={loading}>
                {loading ? 'Вход...' : 'Войти'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
