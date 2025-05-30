'use client';

import React, { useState, useCallback } from 'react';
import { suggestClassActivities, type SuggestClassActivitiesInput } from '@/ai/flows/suggest-class-activities';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Lightbulb, AlertTriangle } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface AiActivitySuggesterProps {
  grade: string;
  subject: string;
}

const AiActivitySuggester: React.FC<AiActivitySuggesterProps> = ({ grade, subject }) => {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSuggestions = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setSuggestions([]); 
    try {
      const input: SuggestClassActivitiesInput = { grade, subject };
      const result = await suggestClassActivities(input);
      setSuggestions(result.suggestions);
    } catch (err) {
      console.error("Error fetching AI suggestions:", err);
      setError('No se pudieron cargar las sugerencias. Inténtalo de nuevo.');
    } finally {
      setIsLoading(false);
    }
  }, [grade, subject]);

  return (
    <Card className="mt-6 shadow-md border-l-4 border-accent">
      <CardHeader>
        <CardTitle className="font-headline text-accent flex items-center">
          <Lightbulb className="mr-2 h-6 w-6" />
          Sugerencias de Actividades (IA)
        </CardTitle>
        <CardDescription className="font-body">
          Obtén ideas de actividades, tareas o temas para tu clase de {subject} ({grade}).
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading && (
          <div className="flex items-center justify-center p-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="ml-2 font-body text-muted-foreground">Generando ideas...</p>
          </div>
        )}
        {error && (
          <div className="flex items-center text-destructive p-4 bg-destructive/10 rounded-md">
            <AlertTriangle className="h-6 w-6 mr-2" />
            <p className="font-body">{error}</p>
          </div>
        )}
        {!isLoading && !error && suggestions.length > 0 && (
          <ScrollArea className="h-48">
            <ul className="list-disc pl-5 space-y-2 font-body text-foreground/90">
              {suggestions.map((suggestion, index) => (
                <li key={index}>{suggestion}</li>
              ))}
            </ul>
          </ScrollArea>
        )}
        {!isLoading && !error && suggestions.length === 0 && !isLoading && (
           <p className="text-muted-foreground font-body text-center p-4">Haz clic en el botón para obtener sugerencias.</p>
        )}
      </CardContent>
      <CardFooter>
        <Button onClick={fetchSuggestions} disabled={isLoading} className="font-body w-full bg-accent text-accent-foreground hover:bg-accent/90">
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Lightbulb className="mr-2 h-4 w-4" />
          )}
          Obtener Sugerencias
        </Button>
      </CardFooter>
    </Card>
  );
};

export default AiActivitySuggester;
