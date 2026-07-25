'use client';

import React from 'react';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MapPin, LayoutDashboard, Map, Store, FileSpreadsheet, Users, LogOut } from 'lucide-react';

export function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const role = (session?.user as any)?.role || 'MARKETING';

  const navItems = [
    { label: 'Dashboard', href: '/', icon: LayoutDashboard, roles: ['ADMIN', 'MARKETING', 'KEPALA_CABANG'] },
    { label: 'Peta Merchant', href: '/map', icon: Map, roles: ['ADMIN', 'MARKETING', 'KEPALA_CABANG'] },
    { label: 'Merchant List', href: '/merchants', icon: Store, roles: ['ADMIN', 'MARKETING', 'KEPALA_CABANG'] },
    { label: 'Import Excel', href: '/import', icon: FileSpreadsheet, roles: ['ADMIN', 'MARKETING', 'KEPALA_CABANG'] },
    { label: 'User Management', href: '/users', icon: Users, roles: ['ADMIN'] },
  ];

  const filteredNav = navItems.filter((item) => item.roles.includes(role));

  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 border-b border-slate-800 backdrop-blur-md text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-emerald-400 p-0.5 shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <MapPin className="w-5 h-5 text-blue-400" />
              </div>
            </div>
            <div>
              <span className="font-bold text-lg text-white tracking-tight leading-none block">
                Merchant <span className="text-blue-400">Map</span>
              </span>
              <span className="text-[10px] text-slate-400 tracking-wider uppercase block">Operational Tool</span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            {filteredNav.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3.5 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* User Profile & Logout */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-xs font-semibold text-white">{session?.user?.name || 'User'}</span>
              <span className="text-[10px] font-medium text-slate-400 px-2 py-0.5 bg-slate-800 rounded-full border border-slate-700/60">
                {role}
              </span>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: '/login' })}
              title="Keluar dari akun"
              className="p-2 rounded-xl bg-slate-800 hover:bg-red-500/20 hover:text-red-400 text-slate-300 border border-slate-700/60 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Mobile Navigation Bar (Horizontal Scrollable) */}
        <div className="md:hidden flex items-center gap-2 overflow-x-auto py-2 border-t border-slate-800/80 scrollbar-none">
          {filteredNav.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`whitespace-nowrap px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-slate-800/80 text-slate-300 hover:text-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </header>
  );
}
