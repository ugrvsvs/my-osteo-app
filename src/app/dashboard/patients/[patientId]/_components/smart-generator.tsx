'use client';
import { useState, useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { suggestExercises, type SuggestExercisesOutput } from '@/ai/flows/suggest-exercises-from-prompt';
import type { Video } from '@/lib/types';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { AlertCircle, Plus, Sparkles } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const initialState: { suggestions?: SuggestExercisesOutput, error?: string } = {};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? 'Генерация...' : <><Sparkles className="mr-2 h-4 w-4" />Сгенерировать</>}
    </Button>
  );
}

export function SmartGenerator({ onAddExercise }: { onAddExercise: (video: Video) => void; }) {
  const [state, formAction] = useActionState(async (prevState: any, formData: FormData) => {
    try {
      const prompt = formData.get('prompt') as string;
      if (!prompt) return { error: 'Запрос не может быть пустым.' };
      const suggestions = await suggestExercises({ prompt });
      return { suggestions };
    } catch (e) {
      return { error: 'Не удалось сгенерировать упражнения.' };
    }
  }, initialState);

  return (
    <Accordion type="single" collapsible>
      <AccordionItem value="smart-generator">
        <AccordionTrigger>
          <div className="flex items-center gap-2">
            <Sparkles className="text-primary" />
            <span className="font-semibold">Умный Генератор</span>
          </div>
        </AccordionTrigger>
        <AccordionContent className="pt-2">
          <Card className="border-none shadow-none">
            <CardContent className="p-0">
              <form action={formAction} className="space-y-4">
                <Input name="prompt" placeholder="например, боль в пояснице, начальный уровень" required />
                <SubmitButton />
              </form>
              {state.error && (
                 <Alert variant="destructive" className="mt-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Ошибка</AlertTitle>
                    <AlertDescription>{state.error}</AlertDescription>
                </Alert>
              )}
              {state.suggestions && (
                <div className="mt-4 space-y-2">
                  <h4 className="font-semibold">Рекомендации:</h4>
                  {state.suggestions.exercises.map((exercise, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 rounded-md bg-muted/50">
                        <div className="flex-1">
                            <p className="font-semibold text-xs">{exercise.title}</p>
                            <p className="text-xs text-muted-foreground line-clamp-1">{exercise.description}</p>
                        </div>
                        {/* The AI might suggest videos not in our library.
                            This button is illustrative of adding a real video.
                            For this demo, it is disabled.
                        */}
                        <Button size="icon" variant="outline" className="h-8 w-8" disabled>
                            <Plus className="h-4 w-4"/>
                        </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
