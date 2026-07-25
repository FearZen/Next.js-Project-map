import React from 'react';
import { Navbar } from '@/components/layout/Navbar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-screen w-screen flex flex-col bg-slate-900 text-slate-100 font-sans overflow-hidden">
      <Navbar />
      <main className="flex-1 flex flex-col relative overflow-y-auto">{children}</main>
    </div>
  );
}
