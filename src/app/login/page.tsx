'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FuturisticBackground } from '@/components/futuristic-background';
import { Logo } from '@/components/logo';
import { auth } from '@/lib/firebase';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [resetEmail, setResetEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      const idToken = await user.getIdToken();

      // Create session cookie
      await fetch('/api/auth/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
      });

      const idTokenResult = await user.getIdTokenResult();
      const isAdmin = idTokenResult.claims.admin === true;

      toast({
        title: 'Login Successful',
        description: 'Redirecting to your dashboard...',
      });
      
      if (isAdmin) {
        router.push('/admin/dashboard');
      } else {
        router.push('/worker/dashboard');
      }

    } catch (error: any) {
      toast({
        title: 'Login Failed',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!resetEmail) {
      toast({ title: "Email required", description: "Please enter your email address.", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, resetEmail);
      toast({
        title: 'Password Reset Email Sent',
        description: 'Check your inbox for instructions to reset your password.',
      });
    } catch (error: any) {
       toast({
        title: 'Error Sending Email',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }


  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center p-8 overflow-hidden">
      <FuturisticBackground />
      <Card className="z-10 w-full max-w-sm border-accent/20 bg-card/80 backdrop-blur-lg">
        <CardHeader className="items-center text-center">
          <Logo />
          <CardTitle className="font-headline text-2xl pt-4">Welcome Back</CardTitle>
          <CardDescription>Enter your credentials to access the portal.</CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
            <CardContent className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="user@chronosync.io" required value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="space-y-2">
                <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <a href="#" className="text-sm text-accent hover:underline" onClick={(e) => e.preventDefault()}>
                      Forgot Password?
                    </a>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Reset Your Password</AlertDialogTitle>
                      <AlertDialogDescription>
                        Enter your email address and we'll send you a link to reset your password.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <Input id="reset-email" type="email" placeholder="your.email@example.com" value={resetEmail} onChange={(e) => setResetEmail(e.target.value)} />
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handlePasswordReset}>Send Reset Link</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
                </div>
                <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            </CardContent>
            <CardFooter className="flex-col gap-4 pt-4">
                <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? 'Signing In...' : 'Sign In'}
                </Button>
            </CardFooter>
        </form>
      </Card>
    </main>
  );
}
