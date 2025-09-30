import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, Sector } from 'recharts';
import { DollarSign, ShoppingCart, ReceiptText, TrendingUp, AlertCircle, ListChecks } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { getBills, getShoppingLists } from '@/lib/api-client';
import type { Bill, ShoppingList } from '@shared/types';
const StatCard: React.FC<{ title: string; value: string; icon: React.ElementType; description: string }> = ({ title, value, icon: Icon, description }) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <Icon className="h-4 w-4 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      <p className="text-xs text-muted-foreground">{description}</p>
    </CardContent>
  </Card>
);
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border bg-background p-2 shadow-sm">
        <div className="grid grid-cols-2 gap-2">
          <div className="flex flex-col space-y-1">
            <span className="text-[0.70rem] uppercase text-muted-foreground">
              {label}
            </span>
            <span className="font-bold text-muted-foreground">
              ${payload[0].value.toFixed(2)}
            </span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};
const DashboardPage: React.FC = () => {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['dashboardData'],
    queryFn: async () => {
      const [bills, shoppingLists] = await Promise.all([
        getBills(),
        getShoppingLists(),
      ]);
      return { bills, shoppingLists };
    },
  });
  const { totalUtilities, totalGroceries, monthlyBreakdown, categoryBreakdown } = useMemo(() => {
    if (!data) {
      return { totalUtilities: 0, totalGroceries: 0, monthlyBreakdown: [], categoryBreakdown: [] };
    }
    const totalUtilities = data.bills
      .filter(bill => bill.paid)
      .reduce((sum, bill) => sum + bill.amount, 0);
    const totalGroceries = data.shoppingLists.reduce((sum, list) =>
      sum + list.items.filter(item => item.completed).length, 0);
    const monthlyData: { [key: string]: { total: number; date: Date } } = {};
    data.bills.filter(b => b.paid).forEach(bill => {
      const billDate = new Date(bill.dueDate);
      const monthKey = `${billDate.getFullYear()}-${billDate.getMonth()}`;
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { total: 0, date: new Date(billDate.getFullYear(), billDate.getMonth(), 1) };
      }
      monthlyData[monthKey].total += bill.amount;
    });
    const monthlyBreakdown = Object.values(monthlyData)
      .sort((a, b) => a.date.getTime() - b.date.getTime())
      .slice(-6) // Last 6 months
      .map(item => ({
        name: item.date.toLocaleString('default', { month: 'short' }),
        total: item.total,
      }));
    const categoryBreakdown = [
      { name: 'Utilities', value: totalUtilities },
      // { name: 'Groceries', value: totalGroceries * 5 }, // This comparison is misleading and has been removed.
    ];
    return { totalUtilities, totalGroceries, monthlyBreakdown, categoryBreakdown };
  }, [data]);
  if (isLoading) {
    return (
      <div className="space-y-8 animate-fade-in">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-32 mb-2" />
                <Skeleton className="h-3 w-40" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Card><CardContent className="p-6"><Skeleton className="h-[300px] w-full" /></CardContent></Card>
          <Card><CardContent className="p-6"><Skeleton className="h-[300px] w-full" /></CardContent></Card>
        </div>
      </div>
    );
  }
  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center h-96 animate-fade-in">
        <AlertCircle className="h-12 w-12 text-destructive mb-4" />
        <h2 className="text-xl font-semibold text-destructive">Failed to load dashboard data</h2>
        <p className="text-muted-foreground mt-2">{error instanceof Error ? error.message : 'An unknown error occurred.'}</p>
      </div>
    );
  }
  const noData = data?.bills.length === 0 && data?.shoppingLists.length === 0;
  if (noData) {
    return (
       <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center h-96 animate-fade-in">
        <TrendingUp className="h-12 w-12 text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold">No data to display</h2>
        <p className="text-muted-foreground mt-2">Start by adding some bills or completing shopping list items.</p>
      </div>
    )
  }
  return (
    <div className="space-y-8 animate-fade-in">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Utility Spending" value={`$${totalUtilities.toFixed(2)}`} icon={DollarSign} description="Sum of all paid bills" />
        <StatCard title="Groceries Purchased" value={`${totalGroceries}`} icon={ShoppingCart} description="Completed items from shopping lists" />
        <StatCard title="Total Bills Tracked" value={`${data?.bills.length}`} icon={ReceiptText} description="Paid and unpaid bills" />
        <StatCard title="Active Shopping Lists" value={`${data?.shoppingLists.length}`} icon={ListChecks} description="All current shopping lists" />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Monthly Spending</CardTitle>
            <CardDescription>Total utility bills paid per month.</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyBreakdown}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--muted))' }} />
                <Bar dataKey="total" fill="hsl(173 58% 39%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Expense Categories</CardTitle>
            <CardDescription>Estimated breakdown of spending.</CardDescription>
          </CardHeader>
          <CardContent>
            {categoryBreakdown.length > 1 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoryBreakdown}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    <Cell key="cell-0" fill="hsl(173 58% 39%)" />
                  </Pie>
                <Tooltip formatter={(value) => [`$${(value as number).toFixed(2)}`, 'Utilities']} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-[300px] items-center justify-center text-center text-sm text-muted-foreground">
                <p>Not enough data for a meaningful comparison.<br />Add more expense types to see a breakdown.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
export default DashboardPage;