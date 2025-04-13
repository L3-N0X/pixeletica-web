import React from 'react';
import { Link } from 'react-router-dom';
import { ThemeToggle } from '@/components/theme-toggle';
import { MdGridView } from 'react-icons/md';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-svh bg-background text-foreground flex flex-col transition-colors duration-300">
      <header className="border-b border-border sticky top-0 z-10 bg-background">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <MdGridView className="h-6 w-6 text-primary" />
            <span className="font-bold text-xl">Pixeletica</span>
          </div>

          <nav className="hidden md:flex items-center space-x-6">
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
          </div>
        </div>
      </header>

      <main className="flex-grow container mx-auto px-4 py-6">{children}</main>

      <footer className="border-t border-border py-4">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          Pixeletica - Minecraft Block Art &copy; {new Date().getFullYear()}
        </div>
      </footer>
    </div>
  );
}
