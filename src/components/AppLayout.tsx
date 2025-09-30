import React from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { Menu, Package2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { ThemeToggle } from '@/components/ThemeToggle';
import { navItems } from '@/config/site';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
const AppLayout: React.FC = () => {
  const isMobile = useIsMobile();
  const location = useLocation();
  const navContent = (
    <nav className={cn("flex flex-col gap-2 text-lg font-medium", isMobile ? "mt-6" : "items-center text-sm lg:gap-4")}>
      {navItems.map((item) => (
        <NavLink
          key={item.href}
          to={item.href}
          className={({ isActive }) =>
            cn(
              'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary',
              isActive && 'bg-muted text-primary',
              !isMobile && 'justify-center rounded-full'
            )
          }
        >
          <item.icon className="h-5 w-5" />
          <span className={cn(isMobile ? 'block' : 'sr-only')}>{item.title}</span>
        </NavLink>
      ))}
    </nav>
  );
  return (
    <div className="grid min-h-screen w-full md:grid-cols-[80px_1fr]">
      <aside className="hidden border-r bg-muted/40 md:block">
        <div className="flex h-full max-h-screen flex-col items-center gap-2 py-4">
          <Link
            to="/"
            className="group flex h-14 w-14 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground transition-transform duration-300 ease-in-out group-hover:scale-105"
          >
            <Package2 className="h-6 w-6 transition-all group-hover:scale-110" />
            <span className="sr-only">Klaro</span>
          </Link>
          {navContent}
        </div>
      </aside>
      <div className="flex flex-col">
        <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
          {isMobile && (
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="shrink-0">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle navigation menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="flex flex-col">
                <Link
                  to="/"
                  className="mb-4 flex items-center gap-2 text-lg font-semibold"
                >
                  <Package2 className="h-6 w-6" />
                  <span>Klaro</span>
                </Link>
                {navContent}
              </SheetContent>
            </Sheet>
          )}
          <div className="w-full flex-1">
            <h1 className="text-xl font-semibold">
              {navItems.find(item => item.href === location.pathname)?.title || 'Klaro'}
            </h1>
          </div>
          <ThemeToggle className="static" />
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 sm:p-6 lg:p-8">
          <div className="mx-auto w-full max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
export default AppLayout;