
'use client';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { updateWorkerAction } from '@/lib/actions';
import type { Worker } from '@/lib/types';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const formSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.'),
  role: z.string().min(1, 'Role is required.'),
});

type EditWorkerFormProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  worker: Worker;
};

export function EditWorkerForm({ open, onOpenChange, worker }: EditWorkerFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
        name: worker.name,
        role: worker.role,
    },
  });
  
  useEffect(() => {
    form.reset({
        name: worker.name,
        role: worker.role
    })
  }, [worker, form])

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    const result = await updateWorkerAction({ id: worker.id, ...values });
    
    if (result.success) {
      toast({
        title: "Success",
        description: "Worker has been updated.",
      });
      onOpenChange(false);
    } else {
        toast({
            title: "Error",
            description: result.error,
            variant: "destructive"
        })
    }
    setIsSubmitting(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-card/90 backdrop-blur-lg">
        <DialogHeader>
          <DialogTitle className="font-headline">Edit Worker</DialogTitle>
          <DialogDescription>Update the details for {worker.name}.</DialogDescription>
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
            <FormField control={form.control} name="role" render={({ field }) => (
              <FormItem>
                <FormLabel>Role</FormLabel>
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
                <FormMessage />
              </FormItem>
            )} />
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline" disabled={isSubmitting}>Cancel</Button>
              </DialogClose>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin"/> Saving...</> : 'Save Changes'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
