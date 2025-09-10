import { Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Logo({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center gap-2 text-xl font-bold font-headline text-primary', className)}>
      <div className="rounded-lg bg-primary/20 p-1">
        <Zap className="h-5 w-5 text-primary" />
      </div>
      <span className="bg-gradient-to-r from-primary from-10% to-accent bg-clip-text text-transparent">ChronoSync</span>
    </div>
  );
}
