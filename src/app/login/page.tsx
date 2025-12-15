'use client';

import { Logo } from '@/components/app/logo';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth, useUser } from '@/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function LoginPage() {
  const { auth } = useAuth() ?? {};
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const [email, setEmail] = useState('doctor@osteo.app');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isUserLoading && user) {
      router.push('/dashboard');
    }
  }, [user, isUserLoading, router]);
  
  // Auto-login for testing
  useEffect(() => {
      if (!isUserLoading && !user && auth) {
          handleSignIn();
      }
  }, [isUserLoading, user, auth]);

  const handleSignIn = async () => {
    if (!auth) return;
    setError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push('/dashboard');
    } catch (error: any) {
      console.error('Error signing in:', error);
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential' || error.code === 'auth/configuration-not-found') {
          setError('Неверный email или пароль, или конфигурация не найдена.');
      } else {
          setError('Произошла ошибка при входе.');
      }
    }
  };

  if (isUserLoading || user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Загрузка...</p>
      </div>
    );
  }

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
            <Button onClick={handleSignIn} className="w-full">
                Войти
            </Button>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}

    