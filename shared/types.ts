export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}
// Minimal real-world chat example types (shared by frontend and worker)
export interface User {
  id: string;
  name: string;
}
export interface Chat {
  id: string;
  title: string;
}
export interface ChatMessage {
  id: string;
  chatId: string;
  userId: string;
  text: string;
  ts: number; // epoch millis
}
// Klaro App Specific Types
export interface ShoppingListItem {
  id: string;
  name: string;
  quantity: number;
  completed: boolean;
}
export interface ShoppingList {
  id: string;
  name: string;
  items: ShoppingListItem[];
}
export interface Bill {
  id: string;
  name: string;
  amount: number;
  dueDate: string; // ISO 8601 date string
  paid: boolean;
}