import type { ShoppingList, Bill } from './types';
export const MOCK_SHOPPING_LISTS: ShoppingList[] = [
  {
    id: 'list-1',
    name: 'Groceries',
    items: [
      { id: 'item-1-1', name: 'Milk', quantity: 1, completed: false },
      { id: 'item-1-2', name: 'Bread', quantity: 2, completed: false },
      { id: 'item-1-3', name: 'Eggs', quantity: 1, completed: true },
    ],
  },
  {
    id: 'list-2',
    name: 'Hardware Store',
    items: [
      { id: 'item-2-1', name: 'Nails', quantity: 100, completed: false },
      { id: 'item-2-2', name: 'Hammer', quantity: 1, completed: true },
    ],
  },
];
export const MOCK_BILLS: Bill[] = [
    { id: 'bill-1', name: 'Electricity', amount: 75.50, dueDate: new Date(new Date().setDate(15)).toISOString(), paid: true },
    { id: 'bill-2', name: 'Water', amount: 45.00, dueDate: new Date(new Date().setDate(20)).toISOString(), paid: false },
    { id: 'bill-3', name: 'Internet', amount: 60.00, dueDate: new Date(new Date().setDate(25)).toISOString(), paid: false },
];