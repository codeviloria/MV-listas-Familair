import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format, parseISO } from 'date-fns';
import { Plus, CalendarIcon, Loader2, MoreHorizontal, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { getBills, addBill, updateBill, deleteBill } from '@/lib/api-client';
import type { Bill } from '@shared/types';
import { Toaster, toast } from '@/components/ui/sonner';
const AddBillForm: React.FC<{ setOpen: (open: boolean) => void }> = ({ setOpen }) => {
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState<Date | undefined>();
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: (newBill: Omit<Bill, 'id' | 'paid'>) => addBill(newBill),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bills'] });
      toast.success('Bill added successfully!');
      setOpen(false);
    },
    onError: (error) => {
      toast.error(`Failed to add bill: ${error.message}`);
    }
  });
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && amount && dueDate) {
      mutation.mutate({ name, amount: parseFloat(amount), dueDate: dueDate.toISOString() });
    } else {
      toast.warning('Please fill out all fields.');
    }
  };
  return (
    <form onSubmit={handleSubmit} className="grid gap-4 py-4">
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="name" className="text-right">Name</Label>
        <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="col-span-3" placeholder="e.g., Electricity" />
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="amount" className="text-right">Amount</Label>
        <Input id="amount" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className="col-span-3" placeholder="e.g., 75.50" />
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="dueDate" className="text-right">Due Date</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={cn("col-span-3 justify-start text-left font-normal", !dueDate && "text-muted-foreground")}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dueDate ? format(dueDate, "PPP") : <span>Pick a date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar mode="single" selected={dueDate} onSelect={setDueDate} initialFocus />
          </PopoverContent>
        </Popover>
      </div>
      <DialogFooter>
        <Button type="submit" disabled={mutation.isPending} className="bg-teal-500 hover:bg-teal-600">
          {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Add Bill
        </Button>
      </DialogFooter>
    </form>
  );
};
const BillRow: React.FC<{ bill: Bill }> = ({ bill }) => {
  const queryClient = useQueryClient();
  const updateMutation = useMutation({
    mutationFn: (paid: boolean) => updateBill(bill.id, { paid }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bills'] });
      toast.success(`Bill marked as ${bill.paid ? 'unpaid' : 'paid'}.`);
    },
    onError: (error) => toast.error(`Update failed: ${error.message}`),
  });
  const deleteMutation = useMutation({
    mutationFn: () => deleteBill(bill.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bills'] });
      toast.success('Bill deleted successfully.');
    },
    onError: (error) => toast.error(`Delete failed: ${error.message}`),
  });
  return (
    <TableRow className={cn(bill.paid && "bg-muted/50")}>
      <TableCell className="font-medium">{bill.name}</TableCell>
      <TableCell>${bill.amount.toFixed(2)}</TableCell>
      <TableCell>{format(parseISO(bill.dueDate), 'MMM d, yyyy')}</TableCell>
      <TableCell>
        <Badge variant={bill.paid ? 'default' : 'secondary'} className={cn(bill.paid ? 'bg-teal-500' : 'bg-amber-500', 'text-white')}>
          {bill.paid ? 'Paid' : 'Unpaid'}
        </Badge>
      </TableCell>
      <TableCell className="text-center">
        <Checkbox
          checked={bill.paid}
          onCheckedChange={(checked) => updateMutation.mutate(!!checked)}
          disabled={updateMutation.isPending}
          className="data-[state=checked]:bg-teal-500 data-[state=checked]:border-teal-500 focus-visible:ring-teal-400"
        />
      </TableCell>
      <TableCell className="text-right">
        <AlertDialog>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => updateMutation.mutate(!bill.paid)}>
                Mark as {bill.paid ? 'Unpaid' : 'Paid'}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <AlertDialogTrigger asChild>
                <DropdownMenuItem className="text-destructive focus:text-destructive focus:bg-destructive/10">
                  <Trash2 className="mr-2 h-4 w-4" /> Delete
                </DropdownMenuItem>
              </AlertDialogTrigger>
            </DropdownMenuContent>
          </DropdownMenu>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the bill for "{bill.name}".
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={() => deleteMutation.mutate()} className="bg-destructive hover:bg-destructive/90">
                {deleteMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </TableCell>
    </TableRow>
  );
};
const BillsPage: React.FC = () => {
  const [isAddBillOpen, setAddBillOpen] = useState(false);
  const { data: bills, isLoading, isError, error } = useQuery({
    queryKey: ['bills'],
    queryFn: getBills,
  });
  return (
    <div className="space-y-8 animate-fade-in">
      <Toaster richColors />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200">Bill Tracker</h1>
          <p className="text-muted-foreground">Keep track of your upcoming household bills.</p>
        </div>
        <Dialog open={isAddBillOpen} onOpenChange={setAddBillOpen}>
          <DialogTrigger asChild>
            <Button className="active:scale-95 bg-teal-500 hover:bg-teal-600">
              <Plus className="mr-2 h-4 w-4" /> New Bill
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add a New Bill</DialogTitle>
              <DialogDescription>Enter the details for the new bill you want to track.</DialogDescription>
            </DialogHeader>
            <AddBillForm setOpen={setAddBillOpen} />
          </DialogContent>
        </Dialog>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Your Bills</CardTitle>
          <CardDescription>A list of your recurring bills for this month.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-center">Paid</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading &&
                [...Array(3)].map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-28" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                    <TableCell className="text-center"><Skeleton className="h-5 w-5 mx-auto" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                  </TableRow>
                ))}
              {isError && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-destructive">
                    Failed to load bills: {error.message}
                  </TableCell>
                </TableRow>
              )}
              {bills?.map((bill) => <BillRow key={bill.id} bill={bill} />)}
            </TableBody>
          </Table>
          {!isLoading && !isError && bills?.length === 0 && (
            <div className="text-center py-10 text-muted-foreground">
              <p>No bills found. Add your first one!</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
export default BillsPage;