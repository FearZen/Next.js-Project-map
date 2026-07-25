'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Store, CheckCircle2, TrendingUp, MapPin, FileSpreadsheet, Activity, ArrowRight, Loader2, Award, Clock } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell } from 'recharts';

export default function DashboardPage() {
  const [data, setData] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardStats() {
      try {
        const res = await fetch('/api/stats/dashboard');
        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error('Error fetching dashboard stats:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadDashboardStats();
  }, []);

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-12 text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500 mb-2" />
        <span>Memuat Dashboard Analytics...</span>
      </div>
    );
  }

  const kpi = data?.kpi || { totalMerchants: 0, totalAcquired: 0, conversionRate: 0 };
  const byStatus = data?.byStatus || [];
  const byCategory = data?.byCategory || [];
  const recentVisits = data?.recentVisits || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full font-sans space-y-8">
      {/* Top Banner Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-400 uppercase tracking-wider bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 mb-2">
            <Activity className="w-3.5 h-3.5" /> Ringkasan Eksekutif Cabang
          </div>
          <h1 className="text-2xl font-bold text-white leading-tight">Dashboard Acquisition Progress</h1>
          <p className="text-slate-400 text-sm mt-1">
            Pantau metrik akuisisi merchant, distribusi status spasial, dan pencapaian tim marketing secara real-time.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/map"
            className="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-blue-600/25 transition-all cursor-pointer"
          >
            <MapPin className="w-4 h-4" />
            <span>Peta Spasial</span>
          </Link>
          <Link
            href="/import"
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 border border-slate-700 transition-colors cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span>Import Excel</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Total Merchant
            </span>
            <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Store className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-white mt-3">{kpi.totalMerchants}</div>
          <p className="text-[11px] text-slate-400 mt-1">Merchant terdaftar di database</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Merchant Akuisisi
            </span>
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-emerald-400 mt-3">{kpi.totalAcquired}</div>
          <p className="text-[11px] text-slate-400 mt-1">Berhasil dipasang EDC / QRIS</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Conversion Rate %
            </span>
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-amber-400 mt-3">{kpi.conversionRate}%</div>
          <p className="text-[11px] text-slate-400 mt-1">Rasio Akuisisi vs Total Merchant</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Dalam Negosiasi
            </span>
            <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-purple-400 mt-3">
            {byStatus.find((s: any) => s.code === 'NEGOSIASI')?.count || 0}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Tahap prospek aktif closing</p>
        </div>
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart: Status Breakdown */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-4">
          <h3 className="font-bold text-base text-white">Distribusi Status Merchant</h3>
          <div className="h-64 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={byStatus}>
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff' }}
                />
                <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                  {byStatus.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.colorHex} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Donut Chart: Category Breakdown */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-4">
          <h3 className="font-bold text-base text-white">Merchant per Kategori Sheet</h3>
          <div className="h-64 w-full flex items-center justify-center pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={byCategory}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="count"
                >
                  {byCategory.map((entry: any, index: number) => {
                    const colors = ['#2563eb', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#64748b'];
                    return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                  })}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Activity Stream */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-base text-white flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-400" />
            <span>Aktivitas Kunjungan Terbaru</span>
          </h3>
          <Link href="/merchants" className="text-xs text-blue-400 hover:underline flex items-center gap-1 font-medium">
            <span>Lihat Semua</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="divide-y divide-slate-800/60">
          {recentVisits.length === 0 ? (
            <p className="text-xs text-slate-400 py-4">Belum ada catatan kunjungan baru.</p>
          ) : (
            recentVisits.map((v: any) => (
              <div key={v.id} className="py-3 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-white block">{v.merchant?.name}</span>
                  <span className="text-slate-400 text-[11px]">
                    Dikunjungi oleh <strong className="text-slate-300">{v.user?.name}</strong>
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className="px-2.5 py-0.5 rounded-full text-white text-[10px] font-bold"
                    style={{ backgroundColor: v.newStatus?.colorHex || '#6B7280' }}
                  >
                    {v.newStatus?.name}
                  </span>
                  <span className="text-slate-500 text-[10px]">
                    {new Date(v.visitedAt).toLocaleDateString('id-ID')}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
