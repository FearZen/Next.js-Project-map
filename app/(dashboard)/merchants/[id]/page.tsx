'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { ArrowLeft, MapPin, Navigation, ExternalLink, Calendar, User, MessageSquare, Clock, CheckCircle2, History, Loader2, Sparkles } from 'lucide-react';
import { updateMerchantStatusAction } from '@/app/actions/merchantActions';

export default function MerchantDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [merchant, setMerchant] = useState<any | null>(null);
  const [statuses, setStatuses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Form State
  const [selectedStatusId, setSelectedStatusId] = useState('');
  const [noteText, setNoteText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const loadMerchantDetail = async () => {
    try {
      const [mRes, sRes] = await Promise.all([
        fetch(`/api/merchants/${id}`),
        fetch('/api/statuses'),
      ]);
      const mData = await mRes.json();
      const sData = await sRes.json();

      setMerchant(mData);
      setStatuses(sData);
      if (mData.statusId) {
        setSelectedStatusId(mData.statusId);
      }
    } catch (err) {
      console.error('Error fetching detail:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadMerchantDetail();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setToast(null);

    const res = await updateMerchantStatusAction({
      merchantId: id,
      newStatusId: selectedStatusId,
      noteText,
    });

    setIsSubmitting(false);

    if (res.success) {
      setToast('Status & riwayat kunjungan berhasil diperbarui!');
      setNoteText('');
      loadMerchantDetail();
    } else {
      setToast(res.error || 'Gagal memperbarui status');
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-12 text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500 mb-2" />
        <span>Memuat Detail Merchant & Riwayat Kunjungan...</span>
      </div>
    );
  }

  if (!merchant || merchant.error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center text-slate-400">
        <p>Merchant tidak ditemukan.</p>
        <Link href="/merchants" className="text-blue-400 underline font-medium mt-2 inline-block">
          Kembali ke Daftar Merchant
        </Link>
      </div>
    );
  }

  const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${merchant.latitude},${merchant.longitude}`;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full font-sans space-y-6">
      {/* Back Link */}
      <Link
        href="/merchants"
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Kembali ke Database Merchant</span>
      </Link>

      {/* Main Merchant Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left 2 Cols: Details & Quick Status Form */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-slate-800 border border-slate-700 text-blue-400">
                  {merchant.category?.name || 'Kategori'}
                </span>
                <h1 className="text-2xl font-extrabold text-white mt-2 leading-tight">
                  {merchant.name}
                </h1>
                <p className="text-sm text-slate-400">{merchant.jenis}</p>
              </div>

              <span
                className="px-3 py-1 rounded-full text-white text-xs font-bold shadow-md"
                style={{ backgroundColor: merchant.status?.colorHex || '#6B7280' }}
              >
                {merchant.status?.name}
              </span>
            </div>

            {/* Spatial Location Info */}
            <div className="space-y-2 text-xs">
              <div className="flex items-start gap-2 text-slate-300">
                <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <span>{merchant.address || 'Alamat fisik belum didaftarkan'}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-400 font-mono text-[11px] pl-6">
                <span>Latitude: {merchant.latitude}</span>
                <span>•</span>
                <span>Longitude: {merchant.longitude}</span>
              </div>
            </div>

            <a
              href={googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 transition-colors cursor-pointer"
            >
              <Navigation className="w-4 h-4" />
              <span>Buka Navigasi Rute di Google Maps</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-70 ml-auto" />
            </a>
          </div>

          {/* Quick Status Form */}
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-4">
            <h3 className="font-bold text-base text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Update Status & Catatan Kunjungan Baru</span>
            </h3>

            {toast && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs">
                {toast}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Status Baru
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {statuses.map((st) => {
                    const isChecked = selectedStatusId === st.id;
                    return (
                      <button
                        key={st.id}
                        type="button"
                        onClick={() => setSelectedStatusId(st.id)}
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                          isChecked
                            ? 'bg-slate-800 border-blue-500 shadow-sm'
                            : 'bg-slate-950/50 border-slate-800 hover:bg-slate-800/50'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className="w-3 h-3 rounded-full shrink-0"
                            style={{ backgroundColor: st.colorHex }}
                          />
                          <span className="text-xs font-semibold text-slate-200">{st.name}</span>
                        </div>
                        {isChecked && <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Catatan Lapangan
                </label>
                <textarea
                  rows={3}
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  placeholder="Tambahkan penjelasan hasil pertemuan dengan merchant..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 rounded-xl text-xs transition-colors shadow-lg shadow-blue-600/25 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Menyimpan Log...</span>
                  </>
                ) : (
                  <span>Simpan Perubahan & Buat Visit Log</span>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Right Col: Chronological Visit History Timeline */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-4">
          <h3 className="font-bold text-base text-white flex items-center gap-2 border-b border-slate-800 pb-3">
            <History className="w-4 h-4 text-blue-400" />
            <span>Audit Trail Visit Log</span>
          </h3>

          <div className="space-y-4 relative before:absolute before:left-3 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-800">
            {merchant.visitLogs?.length === 0 ? (
              <p className="text-xs text-slate-400 pl-6">Belum ada riwayat kunjungan.</p>
            ) : (
              merchant.visitLogs?.map((log: any) => (
                <div key={log.id} className="relative pl-7 text-xs space-y-1">
                  <div className="absolute left-1.5 top-1.5 w-3 h-3 rounded-full bg-blue-500 border-2 border-slate-900 -translate-x-1/2" />
                  <div className="flex items-center justify-between text-slate-400 text-[10px]">
                    <span className="font-semibold text-white">{log.user?.name || 'Marketing'}</span>
                    <span>{new Date(log.visitedAt).toLocaleDateString('id-ID')}</span>
                  </div>

                  <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-200">
                    <span>Status:</span>
                    <span
                      className="px-2 py-0.2 rounded-full text-white text-[10px] font-bold"
                      style={{ backgroundColor: log.newStatus?.colorHex || '#6B7280' }}
                    >
                      {log.newStatus?.name}
                    </span>
                  </div>

                  {log.noteText && (
                    <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-300 text-[11px] italic mt-1">
                      "{log.noteText}"
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
