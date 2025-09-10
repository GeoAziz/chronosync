
'use client';

import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { PlusCircle, MoreHorizontal } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AddWorkerForm } from './add-worker-form';
import { EditWorkerForm } from './edit-worker-form';
import type { Worker } from '@/lib/types';
import { db } from '@/lib/firebase';
import { collection, onSnapshot } from 'firebase/firestore';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { deleteWorkerAction } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

const getStatusBadgeVariant = (status: string) => {
  switch (status) {
    case 'Online': return 'default';
    case 'Invited': return 'secondary';
    default: return 'outline';
  }
};

const getStatusIndicatorClass = (status: string) => {
    switch(status) {
        case 'Online': return 'bg-green-500';
        case 'Away': return 'bg-yellow-500';
        case 'Invited': return 'bg-blue-500';
        default: return 'bg-gray-500';
    }
}

function WorkerTableSkeleton() {
    return (
        Array.from({ length: 3 }).map((_, i) => (
            <TableRow key={i}>
                <TableCell>
                    <div className="flex items-center gap-3">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className='space-y-2'>
                            <Skeleton className="h-4 w-[150px]" />
                            <Skeleton className="h-3 w-[200px]" />
                        </div>
                    </div>
                </TableCell>
                <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-[100px]" /></TableCell>
                <TableCell><Skeleton className="h-6 w-[70px] rounded-full" /></TableCell>
                <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
            </TableRow>
        ))
    )
}

export default function WorkerManagementPage() {
  const [isAddWorkerOpen, setIsAddWorkerOpen] = useState(false);
  const [isEditWorkerOpen, setIsEditWorkerOpen] = useState(false);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [selectedWorker, setSelectedWorker] = useState<Worker | null>(null);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'workers'), (snapshot) => {
        const workersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Worker));
        setWorkers(workersData);
        setIsLoading(false);
    }, (error) => {
        console.error("Error fetching workers:", error);
        setIsLoading(false);
        toast({ title: "Error", description: "Could not fetch worker data.", variant: "destructive" });
    });
    return () => unsubscribe();
  }, [toast]);

  const handleEditClick = (worker: Worker) => {
    setSelectedWorker(worker);
    setIsEditWorkerOpen(true);
  }
  
  const handleDeleteClick = (worker: Worker) => {
    setSelectedWorker(worker);
    setIsDeleteAlertOpen(true);
  }

  const handleDeleteConfirm = async () => {
    if (!selectedWorker) return;
    const result = await deleteWorkerAction(selectedWorker.id);
    if (result.success) {
      toast({ title: "Success", description: "Worker has been deleted." });
    } else {
      toast({ title: "Error", description: result.error, variant: "destructive" });
    }
    setIsDeleteAlertOpen(false);
    setSelectedWorker(null);
  }

  return (
    <div className="p-4 md:p-8">
      <PageHeader title="Worker Management" description="Add, edit, or remove workers from your system.">
        <Button onClick={() => setIsAddWorkerOpen(true)} className="bg-accent text-accent-foreground hover:bg-accent/90">
          <PlusCircle className="mr-2 h-4 w-4" />
          Invite Worker
        </Button>
      </PageHeader>
      
      <Card className="bg-card/80">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead className="hidden md:table-cell">Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <WorkerTableSkeleton />
              ) : workers.length > 0 ? (
                workers.map((worker) => (
                  <TableRow key={worker.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                          <div className="relative">
                              <Avatar>
                                  <AvatarImage src={`https://picsum.photos/seed/${worker.id}/40/40`} data-ai-hint="profile person" />
                                  <AvatarFallback>{worker.name.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <span className={`absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full ${getStatusIndicatorClass(worker.status)} ring-2 ring-background`} />
                          </div>
                          <div>
                              <div className="font-medium">{worker.name}</div>
                              <div className="text-sm text-muted-foreground">{worker.email}</div>
                          </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">{worker.role}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(worker.status)}>{worker.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Actions</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEditClick(worker)}>Edit</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDeleteClick(worker)} className="text-destructive" onSelect={(e) => e.preventDefault()}>Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                    <TableCell colSpan={4} className="h-60 text-center">
                        <h3 className="text-xl font-semibold mb-2">No Workers Found</h3>
                        <p className="text-muted-foreground mb-4">Get started by inviting your first worker.</p>
                        <Button onClick={() => setIsAddWorkerOpen(true)} className="bg-accent text-accent-foreground hover:bg-accent/90">
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Invite Worker
                        </Button>
                    </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      <AddWorkerForm open={isAddWorkerOpen} onOpenChange={setIsAddWorkerOpen} />
      {selectedWorker && <EditWorkerForm open={isEditWorkerOpen} onOpenChange={setIsEditWorkerOpen} worker={selectedWorker} />}

      <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete the worker's account and remove their data from our servers.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

    