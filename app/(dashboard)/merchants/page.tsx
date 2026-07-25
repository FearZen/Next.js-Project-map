'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Store, Search, MapPin, Navigation, Eye, MessageSquarePlus, ChevronLeft, ChevronRight, Loader2, Calendar, Trash2 } from 'lucide-react';
import { UpdateStatusModal } from '@/components/map/UpdateStatusModal';

export default function MerchantsListPage() {
  const [merchants, setMerchants] = useState<any[]>([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0, limit: 15 });
  const [categories, setCategories] = useState<any[]>([]);
  const [statuses, setStatuses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [selectedStatusId, setSelectedStatusId] = useState('ALL');
  const [selectedCategoryId, setSelectedCategoryId] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [merchantToUpdate, setMerchantToUpdate] = useState<any | null>(null);

  useEffect(() => {
    async function loadMasterFilters() {
      try {
        const [cRes, sRes] = await Promise.all([fetch('/api/categories'), fetch('/api/statuses')]);
        setCategories(await cRes.json());
        setStatuses(await sRes.json());
      } catch (err) {
        console.error('Error loading master data:', err);
      }
    }
    loadMasterFilters();
  }, []);

  const fetchMerchants = useCallback(
    async (pageNum: number = 1) => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams({
          format: 'json',
          page: pageNum.toString(),
          limit: '15',
          statusId: selectedStatusId,
          categoryId: selectedCategoryId,
          search: searchQuery,
        });

        const res = await fetch(`/api/merchants?${params.toString()}`);
        const json = await res.json();
        setMerchants(json.merchants || []);
        if (json.pagination) {
          setPagination(json.pagination);
        }
      } catch (err) {
        console.error('Error fetching merchants list:', err);
      } finally {
        setIsLoading(false);
      }
    },
    [selectedStatusId, selectedCategoryId, searchQuery]
  );

  useEffect(() => {
    fetchMerchants(1);
  }, [fetchMerchants]);

  const handleDeleteMerchant = async (merchant: any) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus merchant "${merchant.name}"?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/merchants/${merchant.id}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.success) {
        alert(`Merchant "${merchant.name}" berhasil dihapus.`);
        fetchMerchants(pagination.page);
      } else {
        alert(`Gagal menghapus merchant: ${json.error}`);
      }
    } catch (err) {
      alert('Terjadi kesalahan jaringan.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full font-sans space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-blue-400 uppercase tracking-wider bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20 mb-2">
            <Store className="w-3.5 h-3.5" /> Database Master Merchant
          </div>
          <h1 className="text-2xl font-bold text-white leading-tight">Daftar Merchant & Pipeline Akuisisi</h1>
          <p className="text-slate-400 text-sm mt-1">
            Kelola seluruh merchant, filter berdasarkan status & kategori sheet, dan perbarui catatan kunjungan harian.
          </p>
        </div>
        <Link
          href="/map"
          className="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-5 py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-600/25 transition-all self-start md:self-auto cursor-pointer"
        >
          <MapPin className="w-4 h-4" />
          <span>Buka Tampilan Peta Interaktif</span>
        </Link>
      </div>

      {/* Filter Bar */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-xl flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari merchant, jenis, atau alamat..."
            className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          />
        </div>

        {/* Dropdowns */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          <select
            value={selectedStatusId}
            onChange={(e) => setSelectedStatusId(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 cursor-pointer"
          >
            <option value="ALL">Semua Status</option>
            {statuses.map((st) => (
              <option key={st.id} value={st.id}>
                {st.name}
              </option>
            ))}
          </select>

          <select
            value={selectedCategoryId}
            onChange={(e) => setSelectedCategoryId(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 cursor-pointer"
          >
            <option value="ALL">Semua Kategori</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Merchants Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider text-[10px] font-semibold border-b border-slate-800">
              <tr>
                <th className="px-6 py-4 min-w-[220px]">Nama Merchant</th>
                <th className="px-6 py-4 min-w-[200px] whitespace-nowrap">Kategori Sheet</th>
                <th className="px-6 py-4 min-w-[150px]">Jenis</th>
                <th className="px-6 py-4 min-w-[170px] whitespace-nowrap">Status Saat Ini</th>
                <th className="px-6 py-4 min-w-[240px]">Koordinat & Alamat</th>
                <th className="px-6 py-4 text-right min-w-[140px]">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                    <Loader2 className="w-6 h-6 animate-spin text-blue-500 mx-auto mb-2" />
                    <span>Memuat data merchant...</span>
                  </td>
                </tr>
              ) : merchants.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                    <span>Tidak ada merchant yang sesuai dengan kriteria pencarian.</span>
                  </td>
                </tr>
              ) : (
                merchants.map((m) => {
                  const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${m.latitude},${m.longitude}`;

                  return (
                    <tr key={m.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="px-6 py-4 min-w-[220px]">
                        <div className="font-bold text-white text-sm">{m.name}</div>
                        {m.visitLogs?.[0] && (
                          <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                            <Calendar className="w-3 h-3 text-slate-500" />
                            <span>
                              Terakhir dikunjungi oleh {m.visitLogs[0].user?.name || 'Marketing'}
                            </span>
                          </div>
                        )}
                      </td>

                      {/* Extended Kategori Sheet Column */}
                      <td className="px-6 py-4 min-w-[200px]">
                        <span className="px-3 py-1.5 rounded-full bg-slate-800 text-blue-400 border border-slate-700 text-xs font-semibold whitespace-nowrap inline-block">
                          {m.category?.name || m.category}
                        </span>
                      </td>

                      <td className="px-6 py-4 min-w-[150px] text-slate-300 font-medium">{m.jenis}</td>

                      {/* Extended Status Saat Ini Column */}
                      <td className="px-6 py-4 min-w-[170px]">
                        <span
                          className="px-3 py-1.5 rounded-full text-white text-xs font-bold shadow-sm whitespace-nowrap inline-block"
                          style={{ backgroundColor: m.status?.colorHex || '#6B7280' }}
                        >
                          {m.status?.name || m.status}
                        </span>
                      </td>

                      <td className="px-6 py-4 min-w-[240px]">
                        <div className="text-[11px] font-mono text-slate-400">
                          {m.latitude.toFixed(6)}, {m.longitude.toFixed(6)}
                        </div>
                        <div className="text-xs text-slate-300 max-w-xs truncate mt-0.5">
                          {m.address || 'Alamat belum diisi'}
                        </div>
                      </td>

                      <td className="px-6 py-4 text-right min-w-[140px]">
                        <div className="flex items-center justify-end gap-2">
                          <a
                            href={googleMapsUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Buka Navigasi Google Maps"
                            className="p-2 rounded-xl bg-slate-800 hover:bg-blue-600 text-slate-300 hover:text-white transition-colors border border-slate-700 cursor-pointer"
                          >
                            <Navigation className="w-4 h-4" />
                          </a>

                          <button
                            type="button"
                            onClick={() => {
                              setMerchantToUpdate(m);
                              setIsModalOpen(true);
                            }}
                            title="Update Status & Catatan"
                            className="p-2 rounded-xl bg-slate-800 hover:bg-amber-600 text-slate-300 hover:text-white transition-colors border border-slate-700 cursor-pointer"
                          >
                            <MessageSquarePlus className="w-4 h-4" />
                          </button>

                          <Link
                            href={`/merchants/${m.id}`}
                            title="Lihat Detail & Audit Trail Log"
                            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors border border-slate-700 cursor-pointer"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>

                          <button
                            type="button"
                            onClick={() => handleDeleteMerchant(m)}
                            title="Hapus Merchant"
                            className="p-2 rounded-xl bg-red-500/10 hover:bg-red-600 text-red-400 hover:text-white transition-colors border border-red-500/30 cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="px-6 py-4 border-t border-slate-800 flex items-center justify-between bg-slate-950/50 text-xs text-slate-400">
          <div>
            Menampilkan halaman {pagination.page} dari {pagination.totalPages} ({pagination.total} Total Merchant)
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchMerchants(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-50 transition-colors text-white cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => fetchMerchants(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-50 transition-colors text-white cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Update Status Modal */}
      <UpdateStatusModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        merchant={merchantToUpdate}
        statuses={statuses}
        onSuccess={() => fetchMerchants(pagination.page)}
      />
    </div>
  );
}
