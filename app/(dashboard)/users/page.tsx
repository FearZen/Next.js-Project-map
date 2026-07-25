'use client';

import React, { useState } from 'react';
import { Shield, CheckCircle2, XCircle, Search } from 'lucide-react';

export default function UsersManagementPage() {
  const [users] = useState([
    { id: 'usr_admin', name: 'System Admin', email: 'admin@mandirimap.com', role: 'ADMIN', isActive: true },
    { id: 'usr_wira', name: 'Wira', email: 'wira@mandirimap.com', role: 'MARKETING', isActive: true },
    { id: 'usr_ibnu', name: 'Ibnu Perdana', email: 'ibnu@mandirimap.com', role: 'KEPALA_CABANG', isActive: true },
  ]);

  const [search, setSearch] = useState('');

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full font-sans space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-purple-400 uppercase tracking-wider bg-purple-500/10 px-3 py-1 rounded-full border border-purple-500/20 mb-2">
            <Shield className="w-3.5 h-3.5" /> Modul Keamanan System
          </div>
          <h1 className="text-2xl font-bold text-white leading-tight">Manajemen Pengguna & Hak Akses (RBAC)</h1>
          <p className="text-slate-400 text-sm mt-1">
            Kelola daftar akun pengguna tim marketing, supervisor, dan kepala cabang.
          </p>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-xl flex items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari pengguna berdasarkan nama atau email..."
            className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          />
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider text-[10px] font-semibold border-b border-slate-800">
              <tr>
                <th className="px-6 py-4">Nama Pengguna</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Role Akses</th>
                <th className="px-6 py-4">Status Akun</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredUsers.map((u) => (
                <tr key={u.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="px-6 py-4 font-bold text-white text-sm">{u.name}</td>
                  <td className="px-6 py-4 text-slate-400 font-mono text-xs">{u.email}</td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 rounded-full bg-slate-800 text-blue-400 border border-slate-700 text-[11px] font-bold">
                      {u.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {u.isActive ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                        <CheckCircle2 className="w-3 h-3" /> Aktif
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-500/10 border border-red-500/30 text-red-400">
                        <XCircle className="w-3 h-3" /> Nonaktif
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
