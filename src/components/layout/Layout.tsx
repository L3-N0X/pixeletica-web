import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ThemeToggle } from '@/components/theme-toggle';
import { Logo } from '@/components/ui/typography';
import { LogoIcon } from '@/components/ui/logo';
import { Toaster } from '../ui/sonner';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { LuMenu } from 'react-icons/lu';

interface LayoutProps {
  children: React.ReactNode;
}

function MobileNav() {
  const [open, setOpen] = useState(false);

  const mobileItems = [
    { name: 'Home', path: '/' },
    { name: 'Create', path: '/create' },
    { name: 'Maps', path: '/maps' },
  ];

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <LuMenu />
        </Button>
      </SheetTrigger>
      <SheetContent side="right">
        <div className="flex flex-col items-start mt-16 space-y-4">
          {mobileItems.map((item, index) => (
            <Link to={item.path} key={index} className="w-full">
              <Button
                variant="link"
                onClick={() => setOpen(false)}
                className="w-full justify-start px-4 text-left text-md font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                {item.name}
              </Button>
            </Link>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-svh bg-background text-foreground flex flex-col transition-colors duration-300">
      <header className="border-b border-border sticky top-0 z-10 bg-background">
        <div className="container mx-auto px-4 py-2 flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <LogoIcon className="text-primary" />
              <Logo>Pixeletica</Logo>
            </div>
          </Link>

          <nav className="hidden md:flex items-center space-x-6 absolute left-1/2 -translate-x-1/2 ">
            <Link to="/" className="text-foreground hover:text-primary transition-colors">
              Home
            </Link>
            <Link to="/create" className="text-foreground hover:text-primary transition-colors">
              Create
            </Link>
            <Link to="/maps" className="text-foreground hover:text-primary transition-colors">
              Maps
            </Link>
          </nav>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <MobileNav />
          </div>
        </div>
      </header>

      <main className="flex-grow container mx-auto px-4 py-6">{children}</main>

      <footer className="border-t border-border py-4">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          Pixeletica - Minecraft Block Art &copy; {new Date().getFullYear()}
        </div>
      </footer>
      <Toaster />
    </div>
  );
}
