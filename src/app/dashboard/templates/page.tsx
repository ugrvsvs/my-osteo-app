'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { Template } from '@/lib/types';
import useSWR from 'swr';
import { Skeleton } from '@/components/ui/skeleton';
import { AddTemplateDialog } from './_components/add-template-dialog';
import { Icons } from '@/components/app/icons';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

function TemplateCard({ template }: { template: Template }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{template.name}</CardTitle>
        <CardDescription>{template.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {template.exercises.map((ex, index) => (
            <Badge key={index} variant="outline" className="flex items-center gap-1">
              <Icons.spine className="h-3 w-3" />
              <span>{`${ex.reps}x${ex.sets}`}</span>
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default function TemplatesPage() {
  const { data, error, isLoading, mutate } = useSWR<{templates: Template[]}>('/api/templates', fetcher);
  const templates = data?.templates;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Шаблоны</h1>
        <AddTemplateDialog onTemplateAdded={mutate} />
      </div>

      {isLoading && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full mt-2" />
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  <Skeleton className="h-6 w-12 rounded-full" />
                  <Skeleton className="h-6 w-12 rounded-full" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {error && <p className="text-destructive">Не удалось загрузить шаблоны.</p>}

      {!isLoading && templates && (
        <>
          {templates.length === 0 ? (
            <div className="flex items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 bg-muted/20 py-24 text-center">
              <div className="flex flex-col items-center gap-4 text-muted-foreground">
                <h2 className="text-xl font-semibold">Шаблоны не найдены</h2>
                <p>Создайте свой первый шаблон, чтобы ускорить назначение упражнений.</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {templates.map((template) => (
                <TemplateCard key={template.id} template={template} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
