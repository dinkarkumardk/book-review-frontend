import { type ReactNode } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';

interface LayoutProps { children: ReactNode }

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-[rgb(var(--color-bg))] text-[rgb(var(--color-text))]">
      <Navbar />
      <div className="flex-1">
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8">
          {children}
        </div>
      </div>
      <Footer />
    </div>
  );
}
