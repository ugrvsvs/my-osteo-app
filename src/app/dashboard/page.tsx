'use client';

import type { Patient } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { PlusCircle, Search, Clock } from 'lucide-react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';
import { useCollection, useFirestore, useUser } from '@/firebase';
import { collection } from 'firebase/firestore';
import { useMemo } from 'react';

function PatientCard({ patient }: { patient: Patient }) {
  const getInitials = (name: string) => {
    const names = name.split(' ');
    if (names.length > 1) {
      return `${names[0][0]}${names[1][0]}`;
    }
    return names[0].substring(0, 2);
  };
  
  return (
    <Card className="hover:shadow-md transition-shadow duration-300">
      <Link href={`/dashboard/patients/${patient.id}`} className="block h-full">
        <CardHeader className="flex flex-row items-center gap-4 space-y-0 pb-2">
          <Avatar className="h-12 w-12">
            <AvatarImage src={patient.avatarUrl} alt={patient.name} />
            <AvatarFallback>{getInitials(patient.name)}</AvatarFallback>
          </Avatar>
          <div className="grid gap-1">
            <CardTitle className="text-lg">{patient.name}</CardTitle>
            <CardDescription>{patient.email}</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {patient.lastActivity ? (
            <div className="text-xs text-muted-foreground flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>
                Активность:{' '}
                {formatDistanceToNow(new Date(patient.lastActivity), { addSuffix: true, locale: ru })}
              </span>
            </div>
          ) : (
            <div className="text-xs text-muted-foreground">Нет активности</div>
          )}
        </CardContent>
      </Link>
    </Card>
  );
}

export default function DashboardPage() {
  const firestore = useFirestore();
  const { user } = useUser();

  const patientsQuery = useMemo(() => {
    if (!firestore || !user) return null;
    return collection(firestore, 'patients');
  }, [firestore, user]);

  const { data: patients, isLoading } = useCollection<Patient>(patientsQuery);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Пациенты</h1>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input type="search" placeholder="Поиск пациентов..." className="pl-8 sm:w-[300px]" />
          </div>
          <Button>
            <PlusCircle />
            Добавить пациента
          </Button>
        </div>
      </div>
      
      {isLoading && <p>Загрузка пациентов...</p>}

      {!isLoading && patients && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {patients.map((patient) => (
            <PatientCard key={patient.id} patient={patient} />
          ))}
        </div>
      )}
    </div>
  );
}