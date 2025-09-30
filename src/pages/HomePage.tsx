import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2, Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { getShoppingLists, addShoppingListItem, toggleShoppingListItem, removeShoppingListItem, createShoppingList } from '@/lib/api-client';
import type { ShoppingList, ShoppingListItem } from '@shared/types';
import { Toaster, toast } from '@/components/ui/sonner';
const AddListForm: React.FC<{ setOpen: (open: boolean) => void }> = ({ setOpen }) => {
  const [name, setName] = useState('');
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: (listName: string) => createShoppingList(listName),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shoppingLists'] });
      toast.success('New shopping list created!');
      setOpen(false);
    },
    onError: (error) => {
      toast.error(`Failed to create list: ${error.message}`);
    }
  });
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      mutation.mutate(name.trim());
    } else {
      toast.warning('Please enter a name for the list.');
    }
  };
  return (
    <form onSubmit={handleSubmit} className="grid gap-4 py-4">
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="name" className="text-right">Name</Label>
        <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="col-span-3" placeholder="e.g., Weekend Party" />
      </div>
      <DialogFooter>
        <Button type="submit" disabled={mutation.isPending} className="bg-teal-500 hover:bg-teal-600">
          {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Create List
        </Button>
      </DialogFooter>
    </form>
  );
};
const AddItemForm: React.FC<{ listId: string; }> = ({ listId }) => {
  const [itemName, setItemName] = useState('');
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: (name: string) => addShoppingListItem(listId, name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shoppingLists'] });
      setItemName('');
    },
    onError: (error) => {
      toast.error(`Failed to add item: ${error.message}`);
    }
  });
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (itemName.trim()) {
      mutation.mutate(itemName.trim());
    }
  };
  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <Input
        type="text"
        value={itemName}
        onChange={(e) => setItemName(e.target.value)}
        placeholder="Add a new item..."
        className="flex-grow"
        disabled={mutation.isPending}
      />
      <Button type="submit" size="icon" className="active:scale-95 bg-teal-500 hover:bg-teal-600" disabled={mutation.isPending}>
        {mutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
      </Button>
    </form>
  );
};
const ShoppingListItemComponent: React.FC<{ listId: string; item: ShoppingListItem }> = ({ listId, item }) => {
  const queryClient = useQueryClient();
  const toggleMutation = useMutation({
    mutationFn: () => toggleShoppingListItem(listId, item.id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['shoppingLists'] }),
    onError: (error) => toast.error(`Update failed: ${error.message}`),
  });
  const removeMutation = useMutation({
    mutationFn: () => removeShoppingListItem(listId, item.id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['shoppingLists'] }),
    onError: (error) => toast.error(`Delete failed: ${error.message}`),
  });
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20, transition: { duration: 0.2 } }}
      className="flex items-center gap-3 py-2"
    >
      <Checkbox
        id={item.id}
        checked={item.completed}
        onCheckedChange={() => toggleMutation.mutate()}
        disabled={toggleMutation.isPending}
        className="data-[state=checked]:bg-teal-500 data-[state=checked]:border-teal-500 focus-visible:ring-teal-400"
      />
      <label
        htmlFor={item.id}
        className={cn(
          'flex-grow text-base transition-colors duration-300',
          item.completed ? 'text-muted-foreground line-through' : 'text-foreground'
        )}
      >
        {item.name}
      </label>
      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10" onClick={() => removeMutation.mutate()} disabled={removeMutation.isPending}>
        {removeMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
      </Button>
    </motion.div>
  );
};
const ShoppingListCard: React.FC<{ list: ShoppingList }> = ({ list }) => {
  const pendingItems = list.items.filter(item => !item.completed);
  const completedItems = list.items.filter(item => item.completed);
  return (
    <motion.div layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3 }}>
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-semibold">{list.name}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <AddItemForm listId={list.id} />
          <div className="max-h-96 overflow-y-auto pr-2">
            <AnimatePresence>
              {pendingItems.map((item) => (
                <ShoppingListItemComponent key={item.id} listId={list.id} item={item} />
              ))}
            </AnimatePresence>
            {completedItems.length > 0 && (
              <>
                <Separator className="my-4" />
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                  <Check className="h-4 w-4" />
                  <span>Completed ({completedItems.length})</span>
                </div>
                <AnimatePresence>
                  {completedItems.map((item) => (
                    <ShoppingListItemComponent key={item.id} listId={list.id} item={item} />
                  ))}
                </AnimatePresence>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
const ShoppingListPage: React.FC = () => {
  const [isAddListOpen, setAddListOpen] = useState(false);
  const { data: lists, isLoading, isError, error } = useQuery({
    queryKey: ['shoppingLists'],
    queryFn: getShoppingLists,
  });
  return (
    <div className="space-y-8 animate-fade-in">
      <Toaster richColors />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200">Shopping Lists</h1>
          <p className="text-muted-foreground">Manage your household shopping lists.</p>
        </div>
        <Dialog open={isAddListOpen} onOpenChange={setAddListOpen}>
          <DialogTrigger asChild>
            <Button className="active:scale-95 bg-teal-500 hover:bg-teal-600">
              <Plus className="mr-2 h-4 w-4" /> New List
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Create New Shopping List</DialogTitle>
              <DialogDescription>Give your new list a name to get started.</DialogDescription>
            </DialogHeader>
            <AddListForm setOpen={setAddListOpen} />
          </DialogContent>
        </Dialog>
      </div>
      {isLoading && (
        <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
          {[1, 2].map(i => (
            <Card key={i}>
              <CardHeader><Skeleton className="h-7 w-40" /></CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Skeleton className="h-10 flex-grow" />
                  <Skeleton className="h-10 w-10" />
                </div>
                <div className="space-y-3">
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-6 w-2/3" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      {isError && (
        <div className="text-center text-destructive py-10">
          <p>Failed to load shopping lists: {error.message}</p>
        </div>
      )}
      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
        <AnimatePresence>
          {lists?.map((list) => <ShoppingListCard key={list.id} list={list} />)}
        </AnimatePresence>
      </div>
    </div>
  );
};
export default ShoppingListPage;