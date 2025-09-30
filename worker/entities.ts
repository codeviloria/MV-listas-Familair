import { IndexedEntity } from "./core-utils";
import type { ShoppingList, ShoppingListItem, Bill } from "@shared/types";
import { MOCK_SHOPPING_LISTS, MOCK_BILLS } from "@shared/mock-data";
// SHOPPING LIST ENTITY
export class ShoppingListEntity extends IndexedEntity<ShoppingList> {
  static readonly entityName = "shoppingList";
  static readonly indexName = "shoppingLists";
  static readonly initialState: ShoppingList = { id: "", name: "", items: [] };
  static seedData = MOCK_SHOPPING_LISTS;
  async updateName(newName: string): Promise<ShoppingList> {
    return this.mutate(s => ({ ...s, name: newName }));
  }
  async addItem(itemName: string, quantity: number = 1): Promise<ShoppingListItem> {
    const newItem: ShoppingListItem = {
      id: crypto.randomUUID(),
      name: itemName,
      quantity,
      completed: false,
    };
    await this.mutate(s => ({ ...s, items: [newItem, ...s.items] }));
    return newItem;
  }
  async toggleItem(itemId: string): Promise<ShoppingList> {
    return this.mutate(s => {
      const items = s.items.map(item =>
        item.id === itemId ? { ...item, completed: !item.completed } : item
      );
      return { ...s, items };
    });
  }
  async removeItem(itemId: string): Promise<ShoppingList> {
    return this.mutate(s => {
      const items = s.items.filter(item => item.id !== itemId);
      return { ...s, items };
    });
  }
}
// BILL ENTITY
export class BillEntity extends IndexedEntity<Bill> {
  static readonly entityName = "bill";
  static readonly indexName = "bills";
  static readonly initialState: Bill = { id: "", name: "", amount: 0, dueDate: "", paid: false };
  static seedData = MOCK_BILLS;
  async update(data: Partial<Omit<Bill, 'id'>>): Promise<Bill> {
    return this.mutate(s => ({ ...s, ...data }));
  }
}