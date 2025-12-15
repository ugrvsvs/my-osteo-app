'use client';

import { Logo } from '@/components/app/logo';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/firebase';
import { GoogleAuthProvider, signInWithRedirect } from 'firebase/auth';
import { ChromeIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function LoginPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.push('/dashboard');
    }
  }, [user, router]);

  const handleSignInWithGoogle = async () => {
    const auth = useAuth().auth;
    if (auth) {
      const provider = new GoogleAuthProvider();
      try {
        await signInWithRedirect(auth, provider);
      } catch (error) {
        console.error('Error signing in with Google: ', error);
      }
    }
  };

  if (loading || user) {
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
          <Button className="w-full" onClick={handleSignInWithGoogle}>
            <ChromeIcon className="mr-2 h-4 w-4" />
            Войти через Google
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
