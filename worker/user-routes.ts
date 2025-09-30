import { Hono } from "hono";
import type { Env } from './core-utils';
import { ShoppingListEntity, BillEntity } from "./entities";
import { ok, bad, notFound, isStr } from './core-utils';
import type { Bill } from "@shared/types";
export function userRoutes(app: Hono<{ Bindings: Env; }>) {
  // --- SHOPPING LISTS ---
  app.get('/api/shopping-lists', async (c) => {
    await ShoppingListEntity.ensureSeed(c.env);
    const { items } = await ShoppingListEntity.list(c.env);
    items.sort((a, b) => a.name.localeCompare(b.name));
    return ok(c, items);
  });
  app.post('/api/shopping-lists', async (c) => {
    const { name } = (await c.req.json()) as { name?: string; };
    if (!isStr(name)) return bad(c, 'List name is required');
    const newList = { id: crypto.randomUUID(), name, items: [] };
    await ShoppingListEntity.create(c.env, newList);
    return ok(c, newList);
  });
  app.post('/api/shopping-lists/:listId/items', async (c) => {
    const { listId } = c.req.param();
    const { name } = (await c.req.json()) as { name?: string; };
    if (!isStr(name)) return bad(c, 'Item name is required');
    const list = new ShoppingListEntity(c.env, listId);
    if (!(await list.exists())) return notFound(c, 'Shopping list not found');
    const newItem = await list.addItem(name);
    return ok(c, newItem);
  });
  app.patch('/api/shopping-lists/:listId/items/:itemId', async (c) => {
    const { listId, itemId } = c.req.param();
    const list = new ShoppingListEntity(c.env, listId);
    if (!(await list.exists())) return notFound(c, 'Shopping list not found');
    const updatedList = await list.toggleItem(itemId);
    return ok(c, updatedList);
  });
  app.delete('/api/shopping-lists/:listId/items/:itemId', async (c) => {
    const { listId, itemId } = c.req.param();
    const list = new ShoppingListEntity(c.env, listId);
    if (!(await list.exists())) return notFound(c, 'Shopping list not found');
    const updatedList = await list.removeItem(itemId);
    return ok(c, updatedList);
  });
  // --- BILLS ---
  app.get('/api/bills', async (c) => {
    await BillEntity.ensureSeed(c.env);
    const { items } = await BillEntity.list(c.env);
    items.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
    return ok(c, items);
  });
  app.post('/api/bills', async (c) => {
    const { name, amount, dueDate } = (await c.req.json()) as { name?: string; amount?: number; dueDate?: string; };
    if (!isStr(name) || typeof amount !== 'number' || !isStr(dueDate)) {
      return bad(c, 'Name, amount, and dueDate are required');
    }
    const newBill = { id: crypto.randomUUID(), name, amount, dueDate, paid: false };
    await BillEntity.create(c.env, newBill);
    return ok(c, newBill);
  });
  app.patch('/api/bills/:billId', async (c) => {
    const { billId } = c.req.param();
    const { name, amount, dueDate, paid } = (await c.req.json()) as Partial<Bill>;
    const bill = new BillEntity(c.env, billId);
    if (!(await bill.exists())) return notFound(c, 'Bill not found');
    const updatedBill = await bill.update({ name, amount, dueDate, paid });
    return ok(c, updatedBill);
  });
  app.delete('/api/bills/:billId', async (c) => {
    const { billId } = c.req.param();
    const existed = await BillEntity.delete(c.env, billId);
    if (!existed) return notFound(c, 'Bill not found');
    return ok(c, { id: billId });
  });
}