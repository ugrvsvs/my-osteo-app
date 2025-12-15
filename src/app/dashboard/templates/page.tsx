import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileStack } from "lucide-react";

export default function TemplatesPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Шаблоны</h1>
      </div>
      <div className="flex items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 bg-muted/20 py-24 text-center">
        <div className="flex flex-col items-center gap-4 text-muted-foreground">
          <FileStack className="h-16 w-16" />
          <h2 className="text-xl font-semibold">Управление шаблонами</h2>
          <p>Эта функция находится в разработке и скоро будет доступна.</p>
        </div>
      </div>
    </div>
  );
}
