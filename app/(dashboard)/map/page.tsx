'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { MapView } from '@/components/map/MapView';
import { UpdateStatusModal } from '@/components/map/UpdateStatusModal';
import { Search, Compass, Store, RefreshCcw, Palette, SlidersHorizontal, X } from 'lucide-react';
import { getCategoryColorHex } from '@/lib/categoryColors';

export default function MapPage() {
  const [features, setFeatures] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [statuses, setStatuses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Color Mode Toggle: 'category' (per Sheet Excel) vs 'status' (per Status Akuisisi)
  const [colorMode, setColorMode] = useState<'category' | 'status'>('category');

  // Filters
  const [selectedStatusId, setSelectedStatusId] = useState('ALL');
  const [selectedCategoryId, setSelectedCategoryId] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // GPS & Selected Merchant State
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [selectedMerchant, setSelectedMerchant] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [merchantToUpdate, setMerchantToUpdate] = useState<any | null>(null);

  // Fetch Master Data
  useEffect(() => {
    async function loadMasterData() {
      try {
        const [catRes, stRes] = await Promise.all([
          fetch('/api/categories'),
          fetch('/api/statuses'),
        ]);
        const catData = await catRes.json();
        const stData = await stRes.json();

        setCategories(catData);
        setStatuses(stData);
      } catch (err) {
        console.error('Error loading master filters:', err);
      }
    }
    loadMasterData();
  }, []);

  // Fetch GeoJSON Map Features
  const fetchMapFeatures = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('format', 'geojson');

      if (selectedStatusId && selectedStatusId !== 'ALL') {
        params.set('statusId', selectedStatusId);
      }
      if (selectedCategoryId && selectedCategoryId !== 'ALL') {
        params.set('categoryId', selectedCategoryId);
      }
      if (searchQuery && searchQuery.trim() !== '') {
        params.set('search', searchQuery.trim());
      }

      const res = await fetch(`/api/merchants?${params.toString()}`);
      const json = await res.json();
      setFeatures(json.features || []);
    } catch (err) {
      console.error('Error fetching map features:', err);
    } finally {
      setIsLoading(false);
    }
  }, [selectedStatusId, selectedCategoryId, searchQuery]);

  useEffect(() => {
    fetchMapFeatures();
  }, [fetchMapFeatures]);

  // Handle Delete Merchant Pin
  const handleDeleteMerchant = async (merchant: any) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus pin merchant "${merchant.name}"?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/merchants/${merchant.id}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.success) {
        alert(`Merchant "${merchant.name}" berhasil dihapus.`);
        fetchMapFeatures();
      } else {
        alert(`Gagal menghapus merchant: ${json.error}`);
      }
    } catch (err) {
      alert('Terjadi kesalahan jaringan saat menghapus merchant.');
    }
  };

  // Handle Geolocation GPS Button
  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      alert('Browser Anda tidak mendukung layanan Geolocation.');
      return;
    }

    setIsGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation([position.coords.latitude, position.coords.longitude]);
        setIsGettingLocation(false);
      },
      (error) => {
        console.error('GPS error:', error);
        alert('Gagal mendapatkan lokasi GPS. Pastikan izin lokasi aktif.');
        setIsGettingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <div className="w-full h-full min-h-[calc(100vh-4rem)] flex flex-col relative overflow-hidden bg-slate-950 font-sans">
      {/* Top Mobile-Optimized Glassmorphism Header Control Bar */}
      <div className="absolute top-3 left-3 right-3 z-20 flex items-center justify-between gap-2 p-2 sm:p-3 rounded-2xl glass-panel bg-slate-900/90 border border-slate-800 text-white shadow-2xl backdrop-blur-md">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari merchant, jenis, atau alamat..."
            className="w-full bg-slate-950/90 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          />
        </div>

        {/* Action Icon Buttons */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Filter Toggle Button (Mobile Drawer / Desktop Dropdowns) */}
          <button
            type="button"
            onClick={() => setIsMobileFilterOpen((prev) => !prev)}
            className={`p-2 sm:px-3 sm:py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition-all cursor-pointer ${
              selectedStatusId !== 'ALL' || selectedCategoryId !== 'ALL'
                ? 'bg-blue-600 border-blue-500 text-white shadow-md'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
            }`}
            title="Filter Status & Kategori"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span className="hidden sm:inline">Filter</span>
          </button>

          {/* Color Mode Toggle */}
          <button
            type="button"
            onClick={() => setColorMode((prev) => (prev === 'category' ? 'status' : 'category'))}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 p-2 sm:px-3 sm:py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition-colors shrink-0 cursor-pointer"
            title="Ganti Mode Warna Pin (Per Sheet / Per Status)"
          >
            <Palette className="w-4 h-4 text-amber-400" />
            <span className="hidden md:inline">
              Mode: {colorMode === 'category' ? 'Per Sheet' : 'Per Status'}
            </span>
          </button>

          {/* Refresh Button */}
          <button
            type="button"
            onClick={fetchMapFeatures}
            className="bg-slate-800 hover:bg-slate-700 text-slate-300 p-2 rounded-xl text-xs transition-colors shrink-0 cursor-pointer"
            title="Muat Ulang Peta"
          >
            <RefreshCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Pop-Down Compact Filter Tray (for Mobile & Desktop) */}
      {isMobileFilterOpen && (
        <div className="absolute top-16 left-3 right-3 z-30 bg-slate-900/95 border border-slate-800 p-3.5 rounded-2xl shadow-2xl backdrop-blur-xl space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <span className="text-xs font-bold text-white flex items-center gap-1.5">
              <SlidersHorizontal className="w-3.5 h-3.5 text-blue-400" /> Filter Data Peta
            </span>
            <button
              onClick={() => setIsMobileFilterOpen(false)}
              className="text-slate-400 hover:text-white p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">Status Akuisisi</label>
              <select
                value={selectedStatusId}
                onChange={(e) => setSelectedStatusId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 cursor-pointer"
              >
                <option value="ALL">Semua Status</option>
                {statuses.map((st) => (
                  <option key={st.id} value={st.id}>
                    {st.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">Kategori Sheet Excel</label>
              <select
                value={selectedCategoryId}
                onChange={(e) => setSelectedCategoryId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 cursor-pointer"
              >
                <option value="ALL">Semua Kategori Sheet</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Main Map View Container */}
      <div className="flex-1 w-full h-full relative">
        <MapView
          features={features}
          userLocation={userLocation}
          colorMode={colorMode}
          onSelectMerchant={(merchant) => setSelectedMerchant(merchant)}
          onUpdateStatusClick={(merchant) => {
            setMerchantToUpdate(merchant);
            setIsModalOpen(true);
          }}
          onDeleteMerchantClick={handleDeleteMerchant}
        />
      </div>

      {/* FLOATING GPS BUTTON (Bottom Right - Mobile Friendly Google Maps Style) */}
      <button
        type="button"
        onClick={handleGetLocation}
        disabled={isGettingLocation}
        title="Lokasi GPS Saya Saat Ini"
        className="absolute bottom-20 right-4 z-20 bg-blue-600 hover:bg-blue-500 text-white p-3.5 rounded-full shadow-2xl shadow-blue-600/50 transition-all transform active:scale-95 border-2 border-white flex items-center justify-center cursor-pointer"
      >
        <Compass className={`w-6 h-6 ${isGettingLocation ? 'animate-spin' : ''}`} />
      </button>

      {/* Floating Bottom Scrollable Responsive Legend Badge */}
      <div className="absolute bottom-3 left-3 right-16 z-20 pointer-events-none flex items-center">
        <div className="pointer-events-auto bg-slate-900/90 border border-slate-800 px-3 py-2 rounded-2xl shadow-2xl backdrop-blur-md flex items-center gap-2 text-xs text-slate-300 max-w-full overflow-hidden">
          <span className="flex items-center gap-1 font-bold text-white shrink-0 pr-2 border-r border-slate-800">
            <Store className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-[11px]">{features.length} Pin</span>
          </span>

          {/* Horizontal Scrollable Chips on Mobile */}
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-0.5">
            {colorMode === 'category'
              ? categories.map((cat) => (
                  <div key={cat.id} className="flex items-center gap-1 shrink-0 text-[10px]">
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: getCategoryColorHex(cat.name) }}
                    />
                    <span className="text-slate-300 font-medium whitespace-nowrap">{cat.name}</span>
                  </div>
                ))
              : statuses.map((st) => (
                  <div key={st.id} className="flex items-center gap-1 shrink-0 text-[10px]">
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: st.colorHex }}
                    />
                    <span className="text-slate-300 font-medium whitespace-nowrap">{st.name}</span>
                  </div>
                ))}
          </div>
        </div>
      </div>

      {/* Update Status Modal */}
      <UpdateStatusModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        merchant={merchantToUpdate}
        statuses={statuses}
        onSuccess={() => {
          fetchMapFeatures();
        }}
      />
    </div>
  );
}
