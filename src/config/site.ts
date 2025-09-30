import {
  LayoutDashboard,
  ListChecks,
  ReceiptText,
} from 'lucide-react';
export type NavItem = {
  title: string;
  href: string;
  icon: React.ElementType;
  label: string;
};
export const navItems: NavItem[] = [
  {
    title: 'Shopping Lists',
    href: '/',
    icon: ListChecks,
    label: 'shopping',
  },
  {
    title: 'Bill Tracker',
    href: '/bills',
    icon: ReceiptText,
    label: 'bills',
  },
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    label: 'dashboard',
  },
];