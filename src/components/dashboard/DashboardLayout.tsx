import React from 'react';
import { LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
interface DashboardLayoutProps {
  children: React.ReactNode;
}
const DashboardLayout = ({
  children
}: DashboardLayoutProps) => {
  const {
    user,
    profile,
    signOut
  } = useAuth();
  return <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900">
      <header className="bg-white dark:bg-neutral-800 shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-brand-500 to-purple-600">Mockinterview4u</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:block text-right">
              <p className="text-sm font-medium">{profile?.full_name || 'User'}</p>
              <p className="text-xs text-neutral-500">{user?.email}</p>
            </div>
            <Button variant="outline" size="sm" onClick={signOut} className="gap-2">
              <LogOut size={16} />
              <span className="hidden sm:inline">Sign Out</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {children}
      </main>

      <footer className="bg-white dark:bg-neutral-800 border-t border-neutral-200 dark:border-neutral-700 py-6 text-center text-sm text-neutral-500">
        <div className="container mx-auto px-4">
          <p>© {new Date().getFullYear()} Interview Prep Pro. All rights reserved.</p>
        </div>
      </footer>
    </div>;
};
export default DashboardLayout;