'use client';

import dynamic from 'next/dynamic';
import React from 'react';
import { Loader2 } from 'lucide-react';

const DynamicMap = dynamic(() => import('./MapViewInternal'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[500px] bg-slate-950 flex flex-col items-center justify-center text-slate-400 rounded-2xl border border-slate-800">
      <Loader2 className="w-8 h-8 animate-spin text-blue-500 mb-2" />
      <span className="text-sm font-medium">Memuat Engine Peta Spasial...</span>
    </div>
  ),
});

interface MapViewWrapperProps {
  features: any[];
  userLocation: [number, number] | null;
  colorMode?: 'status' | 'category';
  onSelectMerchant?: (merchant: any) => void;
  onUpdateStatusClick?: (merchant: any) => void;
  onDeleteMerchantClick?: (merchant: any) => void;
}

export function MapView(props: MapViewWrapperProps) {
  return <DynamicMap {...props} />;
}
