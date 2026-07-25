'use client';

import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Navigation, Compass, MapPin, ExternalLink, MessageSquarePlus, Trash2 } from 'lucide-react';
import { getCategoryColorHex } from '@/lib/categoryColors';

interface MerchantFeature {
  type: string;
  geometry: {
    type: string;
    coordinates: [number, number]; // [lng, lat]
  };
  properties: {
    id: string;
    name: string;
    jenis: string;
    address?: string;
    category: string;
    categoryId?: string;
    statusId?: string;
    status: {
      code: string;
      name: string;
      colorHex: string;
    };
  };
}

interface MapViewProps {
  features: MerchantFeature[];
  userLocation: [number, number] | null;
  colorMode?: 'status' | 'category';
  onSelectMerchant?: (merchant: MerchantFeature['properties']) => void;
  onUpdateStatusClick?: (merchant: MerchantFeature['properties']) => void;
  onDeleteMerchantClick?: (merchant: MerchantFeature['properties']) => void;
}

// Function to create dynamic SVG Leaflet divIcon
function createCustomMarkerIcon(colorHex: string, isSelected: boolean = false) {
  const size = isSelected ? 38 : 32;
  const svgHtml = `
    <div style="position: relative; width: ${size}px; height: ${size}px; display: flex; align-items: center; justify-content: center;">
      <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="${colorHex || '#EF4444'}" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="filter: drop-shadow(0px 4px 6px rgba(0,0,0,0.4)); transition: transform 0.2s ease;">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
        <circle cx="12" cy="10" r="3" fill="#ffffff"></circle>
      </svg>
    </div>
  `;

  return L.divIcon({
    html: svgHtml,
    className: 'custom-leaflet-marker',
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
    popupAnchor: [0, -size],
  });
}

// Function to create User GPS Marker Icon
function createUserGpsIcon() {
  const svgHtml = `
    <div class="user-location-marker" style="width: 24px; height: 24px; background-color: #2563eb; border: 3px solid #ffffff; border-radius: 50%; box-shadow: 0 0 12px rgba(37,99,235,0.8);"></div>
  `;
  return L.divIcon({
    html: svgHtml,
    className: 'gps-marker',
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
}

// Helper component to auto-center map bounds to fit ALL imported merchant points
function AutoFitBounds({ features, userLocation }: { features: MerchantFeature[]; userLocation: [number, number] | null }) {
  const map = useMap();

  useEffect(() => {
    if (userLocation) {
      map.flyTo(userLocation, 14, { duration: 1.5 });
      return;
    }

    if (features && features.length > 0) {
      const validPoints: [number, number][] = features
        .map((f) => [f.geometry.coordinates[1], f.geometry.coordinates[0]] as [number, number])
        .filter(([lat, lng]) => !isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0);

      if (validPoints.length > 0) {
        const bounds = L.latLngBounds(validPoints);
        if (bounds.isValid()) {
          map.fitBounds(bounds, { padding: [60, 60], maxZoom: 16 });
        }
      }
    }
  }, [features, userLocation, map]);

  return null;
}

export default function MapViewInternal({
  features,
  userLocation,
  colorMode = 'category',
  onSelectMerchant,
  onUpdateStatusClick,
  onDeleteMerchantClick,
}: MapViewProps) {
  const defaultCenter: [number, number] = userLocation || [-8.5869697, 116.0995526];

  return (
    <MapContainer
      center={defaultCenter}
      zoom={13}
      scrollWheelZoom={true}
      className="w-full h-full z-10"
      style={{ width: '100%', height: '100%' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
      />

      <AutoFitBounds features={features} userLocation={userLocation} />

      {userLocation && (
        <Marker position={userLocation} icon={createUserGpsIcon()}>
          <Popup>
            <div className="p-3 text-center">
              <span className="font-semibold text-xs text-blue-600 flex items-center justify-center gap-1">
                <Compass className="w-4 h-4 animate-spin" /> Lokasi GPS Anda Saat Ini
              </span>
            </div>
          </Popup>
        </Marker>
      )}

      {features.map((feature) => {
        const [lng, lat] = feature.geometry.coordinates;
        const p = feature.properties;

        const pinColorHex =
          colorMode === 'category'
            ? getCategoryColorHex(p.category)
            : p.status?.colorHex || '#EF4444';

        const markerIcon = createCustomMarkerIcon(pinColorHex);
        const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;

        return (
          <Marker
            key={p.id}
            position={[lat, lng]}
            icon={markerIcon}
            eventHandlers={{
              click: () => {
                if (onSelectMerchant) onSelectMerchant(p);
              },
            }}
          >
            <Popup>
              <div className="p-4 bg-slate-900 text-white rounded-xl space-y-3 font-sans shadow-xl">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span
                      className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full text-white shadow-sm"
                      style={{ backgroundColor: getCategoryColorHex(p.category) }}
                    >
                      {p.category}
                    </span>
                    <span
                      className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white"
                      style={{ backgroundColor: p.status?.colorHex || '#EF4444' }}
                    >
                      {p.status?.name || 'Belum Dikunjungi'}
                    </span>
                  </div>
                  <h4 className="font-bold text-base text-white leading-tight">{p.name}</h4>
                  <p className="text-xs text-slate-400 mt-0.5">{p.jenis}</p>
                </div>

                {p.address && (
                  <p className="text-xs text-slate-300 flex items-start gap-1.5 leading-snug">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                    <span>{p.address}</span>
                  </p>
                )}

                <div className="pt-2 border-t border-slate-800 flex flex-col gap-2">
                  <a
                    href={googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-2 px-3 rounded-lg text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    <span>Navigasi Google Maps</span>
                    <ExternalLink className="w-3 h-3 opacity-70 ml-auto" />
                  </a>

                  <button
                    type="button"
                    onClick={() => {
                      if (onUpdateStatusClick) onUpdateStatusClick(p);
                    }}
                    className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium py-2 px-3 rounded-lg text-xs flex items-center justify-center gap-1.5 transition-colors border border-slate-700 cursor-pointer"
                  >
                    <MessageSquarePlus className="w-3.5 h-3.5 text-amber-400" />
                    <span>Update Status & Catatan</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (onDeleteMerchantClick) onDeleteMerchantClick(p);
                    }}
                    className="w-full bg-red-500/10 hover:bg-red-500/20 text-red-400 font-medium py-1.5 px-3 rounded-lg text-xs flex items-center justify-center gap-1.5 transition-colors border border-red-500/30 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Hapus Pin Merchant</span>
                  </button>
                </div>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}
