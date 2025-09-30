import type { ApiResponse, ShoppingList, ShoppingListItem, Bill } from "@shared/types";
import { QueryClient } from '@tanstack/react-query';
export const queryClient = new QueryClient();
async function fetchApi<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, { headers: { 'Content-Type': 'application/json' }, ...init });
  const json = (await res.json()) as ApiResponse<T>;
  if (!res.ok || !json.success || json.data === undefined) {
    throw new Error(json.error || 'Request failed');
  }
  return json.data;
}
// --- Shopping List API ---
export const getShoppingLists = (): Promise<ShoppingList[]> => fetchApi('/api/shopping-lists');
export const createShoppingList = (name: string): Promise<ShoppingList> =>
  fetchApi('/api/shopping-lists', {
    method: 'POST',
    body: JSON.stringify({ name }),
  });
export const addShoppingListItem = (listId: string, name: string): Promise<ShoppingListItem> =>
  fetchApi(`/api/shopping-lists/${listId}/items`, {
    method: 'POST',
    body: JSON.stringify({ name }),
  });
export const toggleShoppingListItem = (listId: string, itemId: string): Promise<ShoppingList> =>
  fetchApi(`/api/shopping-lists/${listId}/items/${itemId}`, {
    method: 'PATCH',
  });
export const removeShoppingListItem = (listId: string, itemId: string): Promise<ShoppingList> =>
  fetchApi(`/api/shopping-lists/${listId}/items/${itemId}`, {
    method: 'DELETE',
  });
// --- Bills API ---
export const getBills = (): Promise<Bill[]> => fetchApi('/api/bills');
export const addBill = (bill: Omit<Bill, 'id' | 'paid'>): Promise<Bill> =>
  fetchApi('/api/bills', {
    method: 'POST',
    body: JSON.stringify(bill),
  });
export const updateBill = (billId: string, data: Partial<Omit<Bill, 'id'>>): Promise<Bill> =>
  fetchApi(`/api/bills/${billId}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
export const deleteBill = (billId: string): Promise<{ id: string }> =>
  fetchApi(`/api/bills/${billId}`, {
    method: 'DELETE',
  });