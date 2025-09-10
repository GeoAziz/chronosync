
'use client';
import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { suggestWorkerRoleAction, addWorkerAction } from '@/lib/actions';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sparkles, Loader2, Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

const formSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.'),
  email: z.string().email('Invalid email address.'),
  description: z.string().min(10, 'Description must be at least 10 characters.'),
  role: z.string().min(1, 'Role is required.'),
});

type AddWorkerFormProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function AddWorkerForm({ open, onOpenChange }: AddWorkerFormProps) {
  const [suggestion, setSuggestion] = useState('');
  const [isSuggesting, startSuggestionTransition] = useTransition();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [generatedLink, setGeneratedLink] = useState('');
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: '', email: '', description: '', role: '' },
  });

  const handleDescriptionChange = (description: string) => {
    if (description.length > 20) {
      startSuggestionTransition(async () => {
        const result = await suggestWorkerRoleAction({ workerDescription: description });
        if (result.suggestedRole) {
          setSuggestion(result.suggestedRole);
        }
      });
    }
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    const result = await addWorkerAction(values);
    
    if (result.success && result.link) {
      setGeneratedLink(result.link);
      setShowLinkDialog(true);
      onOpenChange(false); // Close the add worker form
    } else {
        toast({
            title: "Error",
            description: result.error,
            variant: "destructive"
        })
    }
    setIsSubmitting(false);
  }
  
  const handleClose = (isOpen: boolean) => {
    if (!isOpen) {
        form.reset();
        setSuggestion('');
    }
    onOpenChange(isOpen);
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedLink);
    toast({
        title: "Copied to clipboard!",
        description: "The invite link is ready to be shared.",
    });
  }
  
  const closeLinkDialog = () => {
    setShowLinkDialog(false);
    form.reset();
    setSuggestion('');
  }

  return (
    <>
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-[425px] bg-card/90 backdrop-blur-lg">
          <DialogHeader>
            <DialogTitle className="font-headline">Add New Worker</DialogTitle>
            <DialogDescription>Fill in the details to invite a new member to your workforce.</DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl><Input placeholder="e.g. John Doe" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="email" render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl><Input placeholder="e.g. john.doe@example.com" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="description" render={({ field }) => (
                <FormItem>
                  <FormLabel>Skills & Experience</FormLabel>
                  <FormControl><Textarea placeholder="Describe the worker's skills, experience, and qualifications..." {...field} onChange={(e) => { field.onChange(e); handleDescriptionChange(e.target.value); }} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="role" render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  <div className="relative">
                      <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                              <SelectTrigger>
                                  <SelectValue placeholder="Select a role" />
                              </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                              <SelectItem value="Technician">Technician</SelectItem>
                              <SelectItem value="Engineer">Engineer</SelectItem>
                              <SelectItem value="Supervisor">Supervisor</SelectItem>
                              <SelectItem value="Analyst">Analyst</SelectItem>
                              <SelectItem value="Administrator">Administrator</SelectItem>
                          </SelectContent>
                      </Select>
                  </div>
                  {isSuggesting && <p className="text-xs text-muted-foreground flex items-center mt-2"><Loader2 className="h-3 w-3 mr-1 animate-spin" /> AI is thinking...</p>}
                  {suggestion && !isSuggesting && (
                      <Button type="button" variant="outline" size="sm" onClick={() => form.setValue('role', suggestion)} className="mt-2">
                          <Sparkles className="h-4 w-4 mr-2 text-primary" />
                          AI Suggestion: <span className="text-accent ml-1">{suggestion}</span>
                      </Button>
                  )}
                  <FormMessage />
                </FormItem>
              )} />
              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="outline" disabled={isSubmitting}>Cancel</Button>
                </DialogClose>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin"/> Inviting...</> : 'Invite Worker'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      <AlertDialog open={showLinkDialog} onOpenChange={setShowLinkDialog}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Worker Invited Successfully!</AlertDialogTitle>
                <AlertDialogDescription>
                    Share this secure link with the new worker. They will use it to set their password and activate their account.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="p-2 bg-muted rounded-md text-sm text-muted-foreground break-words">
                {generatedLink}
            </div>
            <AlertDialogFooter>
                <Button variant="outline" onClick={closeLinkDialog}>Done</Button>
                <Button onClick={copyToClipboard}><Copy className="mr-2 h-4 w-4"/> Copy Link</Button>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
