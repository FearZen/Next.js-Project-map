'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { MapView } from '@/components/map/MapView';
import { UpdateStatusModal } from '@/components/map/UpdateStatusModal';
import { Search, Compass, Store, RefreshCcw, Palette } from 'lucide-react';
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
      const params = new URLSearchParams({
        format: 'geojson',
        statusId: selectedStatusId,
        categoryId: selectedCategoryId,
        search: searchQuery,
      });

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
      {/* Top Floating Glassmorphism Control Panel */}
      <div className="absolute top-4 left-4 right-4 z-20 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-3 rounded-2xl glass-panel bg-slate-900/90 border border-slate-800 text-white shadow-xl">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari merchant, jenis, atau alamat..."
            className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          />
        </div>

        {/* Filter Dropdowns & Color Mode Toggle */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {/* Color Mode Toggle Button */}
          <button
            type="button"
            onClick={() => setColorMode((prev) => (prev === 'category' ? 'status' : 'category'))}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition-colors shrink-0 cursor-pointer"
            title="Ganti Mode Warna Pin"
          >
            <Palette className="w-3.5 h-3.5 text-blue-400" />
            <span>Pin: {colorMode === 'category' ? 'Warna per Sheet' : 'Warna per Status'}</span>
          </button>

          {/* Status Filter */}
          <select
            value={selectedStatusId}
            onChange={(e) => setSelectedStatusId(e.target.value)}
            className="bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 cursor-pointer"
          >
            <option value="ALL">Semua Status</option>
            {statuses.map((st) => (
              <option key={st.id} value={st.id}>
                {st.name}
              </option>
            ))}
          </select>

          {/* Category Filter */}
          <select
            value={selectedCategoryId}
            onChange={(e) => setSelectedCategoryId(e.target.value)}
            className="bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 cursor-pointer"
          >
            <option value="ALL">Semua Kategori Sheet</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>

          {/* GPS Location Button */}
          <button
            type="button"
            onClick={handleGetLocation}
            disabled={isGettingLocation}
            title="Deteksi Lokasi GPS Saya"
            className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-2 rounded-xl font-medium text-xs flex items-center gap-1.5 shadow-md shadow-blue-600/30 transition-colors shrink-0 cursor-pointer"
          >
            <Compass className={`w-3.5 h-3.5 ${isGettingLocation ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Lokasi Saya</span>
          </button>

          {/* Refresh Button */}
          <button
            type="button"
            onClick={fetchMapFeatures}
            className="bg-slate-800 hover:bg-slate-700 text-slate-300 p-2 rounded-xl text-xs transition-colors shrink-0 cursor-pointer"
          >
            <RefreshCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

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

      {/* Floating Bottom Legend & Summary Panel */}
      <div className="absolute bottom-4 left-4 right-4 z-20 pointer-events-none flex justify-center">
        <div className="pointer-events-auto bg-slate-900/90 border border-slate-800 px-4 py-2.5 rounded-2xl shadow-2xl backdrop-blur-md flex flex-wrap items-center justify-center gap-3 text-xs text-slate-300">
          <span className="flex items-center gap-1.5 font-bold text-white pr-2 border-r border-slate-800">
            <Store className="w-4 h-4 text-blue-400" />
            <span>{features.length} Pin Rendered</span>
          </span>

          {/* Legend Items based on Active Color Mode */}
          {colorMode === 'category' ? (
            <div className="flex items-center gap-2 overflow-x-auto max-w-xl scrollbar-none">
              {categories.map((cat) => (
                <div key={cat.id} className="flex items-center gap-1.5 text-[11px]">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: getCategoryColorHex(cat.name) }}
                  />
                  <span className="text-slate-300">{cat.name}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center gap-2 overflow-x-auto max-w-xl scrollbar-none">
              {statuses.map((st) => (
                <div key={st.id} className="flex items-center gap-1.5 text-[11px]">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: st.colorHex }}
                  />
                  <span className="text-slate-300">{st.name}</span>
                </div>
              ))}
            </div>
          )}
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
