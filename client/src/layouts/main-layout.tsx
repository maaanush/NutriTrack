import { ReactNode } from 'react';
import BottomNavigation from '@/components/bottom-navigation';

interface MainLayoutProps {
  children: ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="mx-auto flex h-screen max-w-md flex-col bg-neutral-100">
      {/* Header */}
      <header className="bg-white p-4 shadow-sm">
        <h1 className="text-center text-xl font-bold">Calorie Tracker</h1>
      </header>
      
      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4">
        {children}
      </main>
      
      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
}
