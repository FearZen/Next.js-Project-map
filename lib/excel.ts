import * as XLSX from 'xlsx';

export interface ParsedMerchantRow {
  sheetName: string;
  name: string;
  jenis: string;
  latitude: number;
  longitude: number;
  address?: string;
  isValid: boolean;
  errorReason?: string;
}

export function parseExcelFile(arrayBuffer: ArrayBuffer): {
  rows: ParsedMerchantRow[];
  sheets: string[];
  totalRows: number;
  validCount: number;
  invalidCount: number;
} {
  const workbook = XLSX.read(arrayBuffer, { type: 'array' });
  const sheets = workbook.SheetNames;

  const allRows: ParsedMerchantRow[] = [];

  for (const sheetName of sheets) {
    const worksheet = workbook.Sheets[sheetName];
    const jsonRows: any[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

    for (const rawRow of jsonRows) {
      // Helper to find column matching aliases
      const getVal = (keys: string[]) => {
        for (const k of Object.keys(rawRow)) {
          const cleanKey = k.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
          if (keys.some((key) => cleanKey === key.toLowerCase().replace(/[^a-z0-9]/g, ''))) {
            return rawRow[k];
          }
        }
        return '';
      };

      const name = String(
        getVal(['nama', 'name', 'merchant', 'namamerchant', 'namatoko', 'outlet', 'namaoutlet', 'toko', 'perusahaan']) || ''
      ).trim();

      const jenis = String(
        getVal(['jenis', 'type', 'jenismerchant', 'kategorijenis', 'subkategori', 'tipe', 'kategori', 'bidang']) || 'Umum'
      ).trim();

      const rawLat = getVal(['latitude', 'lat', 'latpos', 'y', 'latitud', 'latitut', 'koordinatlat']);
      const rawLng = getVal(['longitude', 'long', 'lng', 'lngpos', 'x', 'longtitude', 'longitud', 'koordinatlng']);
      const address = String(getVal(['alamat', 'address', 'lokasi', 'alamatmerchant', 'keterangan']) || '').trim();

      // Advanced number cleaner (extracts -8.58 from "-8,5869°", "S 8.58", etc.)
      const cleanFloat = (val: any) => {
        if (typeof val === 'number') return val;
        if (val === null || val === undefined || val === '') return NaN;
        const str = String(val).replace(/\s/g, '').replace(',', '.');
        const match = str.match(/[-+]?\d*\.?\d+/);
        return match ? parseFloat(match[0]) : NaN;
      };

      let latitude = cleanFloat(rawLat);
      let longitude = cleanFloat(rawLng);

      // Smart Indonesia Lat/Long Auto-Swap Correction
      // Indonesia Lat is roughly [-11, 6], Long is roughly [95, 141]
      if (latitude > 90 || latitude < -90 || longitude > 180 || longitude < -180) {
        if (latitude >= 90 && latitude <= 145 && longitude >= -12 && longitude <= 10) {
          // Swapped! Swap them back
          const temp = latitude;
          latitude = longitude;
          longitude = temp;
        }
      }

      let isValid = true;
      let errorReason = '';

      if (!name) {
        isValid = false;
        errorReason = 'Nama merchant / toko tidak terdeteksi';
      } else if (isNaN(latitude) || latitude < -90 || latitude > 90) {
        isValid = false;
        errorReason = `Latitude (${rawLat}) tidak valid`;
      } else if (isNaN(longitude) || longitude < -180 || longitude > 180) {
        isValid = false;
        errorReason = `Longitude (${rawLng}) tidak valid`;
      }

      allRows.push({
        sheetName,
        name,
        jenis,
        latitude,
        longitude,
        address,
        isValid,
        errorReason: isValid ? undefined : errorReason,
      });
    }
  }

  const validCount = allRows.filter((r) => r.isValid).length;
  const invalidCount = allRows.length - validCount;

  return {
    rows: allRows,
    sheets,
    totalRows: allRows.length,
    validCount,
    invalidCount,
  };
}
