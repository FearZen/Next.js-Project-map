'use client';

import React, { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { MapPin, Shield, Lock, Mail, Loader2, ArrowRight, Sparkles } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const res = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (res?.error) {
        setError('Email atau password tidak sesuai.');
      } else {
        window.location.href = '/';
      }
    } catch (err) {
      setError('Terjadi kesalahan sistem saat mencoba masuk.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickLogin = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
  };

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row bg-slate-900 text-slate-100 font-sans relative overflow-hidden">
      {/* Dynamic Background Mesh Gradients */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-600/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 -right-40 w-96 h-96 bg-emerald-600/20 rounded-full blur-3xl pointer-events-none" />

      {/* Left Brand Banner Panel */}
      <div className="md:w-1/2 p-8 md:p-16 flex flex-col justify-between z-10 relative bg-slate-950/40 border-r border-slate-800/50 backdrop-blur-sm">
        <div>
          <div className="inline-flex items-center gap-3 bg-blue-500/10 border border-blue-500/20 px-4 py-2 rounded-full text-blue-400 text-sm font-medium mb-8">
            <MapPin className="w-4 h-4 text-blue-400 animate-pulse" />
            <span>Operational Spasial Map Tool v1.0</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white leading-tight mb-4">
            Merchant Acquisition <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">Map</span>
          </h1>
          <p className="text-slate-400 text-base md:text-lg max-w-lg leading-relaxed">
            Platform intelijen lokasi spasial untuk tim marketing lapangan. Visualisasikan merchant, kelola pipeline akuisisi, dan navigasikan rute kunjungan harian secara efisien.
          </p>
        </div>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-2 gap-4 mt-12 mb-8">
          <div className="bg-slate-900/60 border border-slate-800/80 p-4 rounded-xl">
            <Sparkles className="w-5 h-5 text-amber-400 mb-2" />
            <h3 className="font-semibold text-sm text-slate-200">Interactive Map</h3>
            <p className="text-xs text-slate-400 mt-1">Color-coded markers per status & per sheet category.</p>
          </div>
          <div className="bg-slate-900/60 border border-slate-800/80 p-4 rounded-xl">
            <Shield className="w-5 h-5 text-emerald-400 mb-2" />
            <h3 className="font-semibold text-sm text-slate-200">Smart Importer</h3>
            <p className="text-xs text-slate-400 mt-1">Auto-detect sheet sebagai kategori & validasi duplikat.</p>
          </div>
        </div>

        <div className="text-xs text-slate-500">
          © 2026 Merchant Acquisition Map. Standalone Operational Assistant Tool.
        </div>
      </div>

      {/* Right Login Form & Quick Preset Panel */}
      <div className="md:w-1/2 p-6 md:p-16 flex items-center justify-center z-10">
        <div className="w-full max-w-md bg-slate-900/90 border border-slate-800 shadow-2xl rounded-2xl p-8 backdrop-blur-xl">
          <div className="mb-6 text-center md:text-left">
            <h2 className="text-2xl font-bold text-white">Selamat Datang</h2>
            <p className="text-sm text-slate-400 mt-1">Masukkan kredensial akun Anda untuk masuk ke portal sistem.</p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-400 animate-ping" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Email Pengguna
              </label>
              <div className="relative">
                <Mail className="w-5 h-5 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="login-email-input"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="wira@mandirimap.com"
                  className="w-full bg-slate-950/80 border border-slate-700/80 rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Kata Sandi
              </label>
              <div className="relative">
                <Lock className="w-5 h-5 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="login-password-input"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-950/80 border border-slate-700/80 rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                />
              </div>
            </div>

            <button
              id="login-submit-button"
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3.5 rounded-xl shadow-lg shadow-blue-600/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Memverifikasi Akun...</span>
                </>
              ) : (
                <>
                  <span>Masuk ke Dashboard</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Preset Selector */}
          <div className="mt-8 pt-6 border-t border-slate-800/80">
            <p className="text-xs text-slate-400 font-medium mb-3 text-center">
              Akses Cepat Demo Role (1-Click Fill):
            </p>
            <div className="grid grid-cols-1 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleQuickLogin('wira@mandirimap.com', 'marketing123')}
                className="bg-slate-800/80 hover:bg-slate-700 text-slate-200 py-2.5 px-3 rounded-lg border border-slate-700/60 text-left transition-colors flex items-center justify-between"
              >
                <div>
                  <span className="font-semibold text-blue-400 block">Wira (Marketing)</span>
                  <span className="text-[10px] text-slate-400">wira@mandirimap.com</span>
                </div>
                <span className="text-[10px] bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded border border-blue-500/20">Fill</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('ibnu@mandirimap.com', 'cabang123')}
                className="bg-slate-800/80 hover:bg-slate-700 text-slate-200 py-2.5 px-3 rounded-lg border border-slate-700/60 text-left transition-colors flex items-center justify-between"
              >
                <div>
                  <span className="font-semibold text-emerald-400 block">Ibnu Perdana (Kepala Cabang)</span>
                  <span className="text-[10px] text-slate-400">ibnu@mandirimap.com</span>
                </div>
                <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20">Fill</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('admin@mandirimap.com', 'admin123')}
                className="bg-slate-800/80 hover:bg-slate-700 text-slate-200 py-2.5 px-3 rounded-lg border border-slate-700/60 text-left transition-colors flex items-center justify-between"
              >
                <div>
                  <span className="font-semibold text-purple-400 block">System Admin</span>
                  <span className="text-[10px] text-slate-400">admin@mandirimap.com</span>
                </div>
                <span className="text-[10px] bg-purple-500/10 text-purple-400 px-2 py-0.5 rounded border border-purple-500/20">Fill</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
