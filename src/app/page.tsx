import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { FuturisticBackground } from '@/components/futuristic-background';
import { Logo } from '@/components/logo';

export default function Home() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden p-8">
      <FuturisticBackground />
      <div className="z-10 flex flex-col items-center gap-8 text-center">
        <Logo className="text-5xl" />
        <p className="max-w-2xl text-lg text-muted-foreground font-headline">
          The future of workforce management is here. Seamless, intelligent, and always in sync.
        </p>
        <Button asChild size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 shadow-[0_0_20px] shadow-accent/30">
          <Link href="/login">Enter the Portal</Link>
        </Button>
      </div>
    </main>
  );
}
