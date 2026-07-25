'use client';

import React from 'react';
import { Settings as SettingsIcon, User, Map, Layers, Save } from 'lucide-react';
import { useSession } from 'next-auth/react';

export default function SettingsPage() {
  const { data: session } = useSession();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full font-sans space-y-6">
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
        <div className="inline-flex items-center gap-2 text-xs font-semibold text-blue-400 uppercase tracking-wider bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20 mb-2">
          <SettingsIcon className="w-3.5 h-3.5" /> Konfigurasi Aplikasi
        </div>
        <h1 className="text-2xl font-bold text-white leading-tight">Pengaturan Profil & Peta Spasial</h1>
        <p className="text-slate-400 text-sm mt-1">
          Sesuaikan konfigurasi tampilan peta default dan informasi akun Anda.
        </p>
      </div>

      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-6">
        <div>
          <h3 className="font-bold text-sm text-white flex items-center gap-2 border-b border-slate-800 pb-3">
            <User className="w-4 h-4 text-blue-400" />
            <span>Informasi Akun</span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 text-xs">
            <div>
              <label className="block text-slate-400 mb-1">Nama Lengkap</label>
              <input
                type="text"
                readOnly
                value={session?.user?.name || 'User'}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white font-medium focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Alamat Email</label>
              <input
                type="text"
                readOnly
                value={session?.user?.email || 'email@mandirimap.com'}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white font-mono focus:outline-none"
              />
            </div>
          </div>
        </div>

        <div>
          <h3 className="font-bold text-sm text-white flex items-center gap-2 border-b border-slate-800 pb-3">
            <Map className="w-4 h-4 text-emerald-400" />
            <span>Pengaturan Engine Peta</span>
          </h3>
          <div className="space-y-4 mt-4 text-xs">
            <div>
              <label className="block text-slate-400 mb-1">Tile Layer Peta Default</label>
              <select className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none cursor-pointer">
                <option>CartoDB Positron / Voyager (Recommended - High Contrast)</option>
                <option>OpenStreetMap Standard Tile Server</option>
              </select>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => alert('Pengaturan berhasil disimpan!')}
          className="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-6 py-3 rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-blue-600/20 transition-colors cursor-pointer"
        >
          <Save className="w-4 h-4" />
          <span>Simpan Perubahan Pengaturan</span>
        </button>
      </div>
    </div>
  );
}
