'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { FileSpreadsheet, UploadCloud, CheckCircle2, AlertTriangle, Layers, ArrowRight, Loader2, Trash2, ChevronLeft, ChevronRight, Filter } from 'lucide-react';
import { parseExcelFile, ParsedMerchantRow } from '@/lib/excel';

export default function ImportPage() {
  const router = useRouter();
  const [fileName, setFileName] = useState<string | null>(null);
  const [parsedRows, setParsedRows] = useState<ParsedMerchantRow[]>([]);
  const [detectedSheets, setDetectedSheets] = useState<string[]>([]);
  const [isParsing, setIsParsing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [overwriteDuplicate, setOverwriteDuplicate] = useState(true);
  const [importSummary, setImportSummary] = useState<any | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Preview Filter & Pagination States
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'VALID' | 'INVALID'>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setIsParsing(true);
    setErrorMsg(null);
    setImportSummary(null);
    setCurrentPage(1);

    try {
      const buffer = await file.arrayBuffer();
      const result = parseExcelFile(buffer);

      setDetectedSheets(result.sheets);
      setParsedRows(result.rows);
    } catch (err: any) {
      console.error('Error reading excel:', err);
      setErrorMsg('Gagal membaca file Excel/CSV. Pastikan format file tidak rusak.');
    } finally {
      setIsParsing(false);
    }
  };

  const validRows = useMemo(() => parsedRows.filter((r) => r.isValid), [parsedRows]);
  const invalidRows = useMemo(() => parsedRows.filter((r) => !r.isValid), [parsedRows]);

  // Filtered rows based on selected tab
  const filteredRows = useMemo(() => {
    if (statusFilter === 'VALID') return validRows;
    if (statusFilter === 'INVALID') return invalidRows;
    return parsedRows;
  }, [parsedRows, validRows, invalidRows, statusFilter]);

  // Paginated subset
  const totalPages = Math.max(1, Math.ceil(filteredRows.length / pageSize));
  const currentTableRows = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredRows.slice(start, start + pageSize);
  }, [filteredRows, currentPage, pageSize]);

  const handleProcessImport = async () => {
    if (validRows.length === 0) return;

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/merchants/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: fileName || 'Import_File.xlsx',
          overwriteDuplicate,
          data: validRows,
        }),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        setImportSummary(json.summary);
      } else {
        setErrorMsg(json.error || 'Terjadi kesalahan saat memproses data ke server.');
      }
    } catch (err: any) {
      setErrorMsg('Terjadi kesalahan jaringan.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClearDatabase = async () => {
    if (!confirm('Apakah Anda yakin ingin mengosongkan seluruh data merchant di database Supabase?')) {
      return;
    }

    setIsClearing(true);
    try {
      const res = await fetch('/api/merchants/clear', { method: 'POST' });
      const json = await res.json();
      if (json.success) {
        alert('Database merchant telah dikosongkan.');
        setImportSummary(null);
        setParsedRows([]);
        setFileName(null);
        setCurrentPage(1);
      } else {
        alert('Gagal mengosongkan database: ' + json.error);
      }
    } catch (err) {
      alert('Terjadi kesalahan jaringan.');
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full font-sans space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-blue-400 uppercase tracking-wider bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20 mb-2">
            <FileSpreadsheet className="w-3.5 h-3.5" /> Modul Smart Importer
          </div>
          <h1 className="text-2xl font-bold text-white leading-tight">Import Data Merchant Excel / CSV</h1>
          <p className="text-slate-400 text-sm mt-1">
            Unggah file Excel multi-sheet. Sistem akan otomatis membaca seluruh sheet sebagai Kategori Merchant.
          </p>
        </div>

        <button
          type="button"
          onClick={handleClearDatabase}
          disabled={isClearing}
          className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 font-semibold px-4 py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 transition-colors self-start md:self-auto cursor-pointer"
        >
          {isClearing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
          <span>Kosongkan Database Merchant</span>
        </button>
      </div>

      {/* Upload Zone */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-8 text-center backdrop-blur-md shadow-xl">
        <label htmlFor="file-upload-input" className="cursor-pointer group flex flex-col items-center justify-center">
          <div className="w-16 h-16 rounded-2xl bg-blue-600/10 border border-blue-500/30 flex items-center justify-center text-blue-400 group-hover:scale-110 group-hover:bg-blue-600/20 transition-all mb-4">
            <UploadCloud className="w-8 h-8" />
          </div>
          <span className="text-base font-bold text-white group-hover:text-blue-400 transition-colors">
            {fileName ? fileName : 'Pilih atau Drag & Drop File Excel / CSV di sini'}
          </span>
          <span className="text-xs text-slate-400 mt-1 max-w-sm">
            Format yang didukung: .xlsx, .xls, .csv. Mengandung kolom Nama, Jenis, Latitude, Longitude.
          </span>
          <input
            id="file-upload-input"
            type="file"
            accept=".xlsx, .xls, .csv"
            onChange={handleFileUpload}
            className="hidden"
          />
        </label>
      </div>

      {/* Parsing Loader */}
      {isParsing && (
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl text-center text-slate-300 flex flex-col items-center justify-center gap-2">
          <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
          <span className="text-sm font-medium">Membaca seluruh sheet & memvalidasi koordinat...</span>
        </div>
      )}

      {/* Error Message */}
      {errorMsg && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Summary Alert after Successful Import */}
      {importSummary && (
        <div className="p-6 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-white space-y-4 shadow-xl">
          <div className="flex items-center gap-3 text-emerald-400">
            <CheckCircle2 className="w-6 h-6" />
            <h3 className="text-lg font-bold">Impor Data Merchant Berhasil Disimpan ke Supabase!</h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800">
              <span className="text-slate-400 block">Total Baris Diproses</span>
              <span className="text-base font-bold text-white">{importSummary.totalRows}</span>
            </div>
            <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800">
              <span className="text-slate-400 block">Sukses Disimpan</span>
              <span className="text-base font-bold text-emerald-400">{importSummary.successCount}</span>
            </div>
            <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800">
              <span className="text-slate-400 block">Duplikat Dilewati</span>
              <span className="text-base font-bold text-amber-400">{importSummary.duplicateSkipped}</span>
            </div>
            <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800">
              <span className="text-slate-400 block">Baris Gagal</span>
              <span className="text-base font-bold text-red-400">{importSummary.failedCount}</span>
            </div>
          </div>
          <button
            onClick={() => router.push('/map')}
            className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-6 py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <span>Lihat Seluruh {importSummary.successCount} Merchant di Peta Spasial</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Preview & Pagination Section */}
      {parsedRows.length > 0 && !importSummary && (
        <div className="space-y-6">
          {/* Sheet Detection Chips */}
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
              <Layers className="w-4 h-4 text-blue-400" />
              <span>Sheet Terdeteksi ({detectedSheets.length} Sheet, Total {parsedRows.length} Baris):</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {detectedSheets.map((sh) => {
                const count = parsedRows.filter((r) => r.sheetName === sh).length;
                return (
                  <span
                    key={sh}
                    className="text-xs font-medium px-3 py-1 bg-slate-800 text-slate-200 border border-slate-700 rounded-full flex items-center gap-1.5"
                  >
                    <span>{sh}</span>
                    <span className="text-[10px] px-1.5 py-0.2 bg-blue-500/20 text-blue-300 rounded-full">
                      {count} baris
                    </span>
                  </span>
                );
              })}
            </div>
          </div>

          {/* Action Bar */}
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <input
                id="overwrite-duplicate-checkbox"
                type="checkbox"
                checked={overwriteDuplicate}
                onChange={(e) => setOverwriteDuplicate(e.target.checked)}
                className="w-4 h-4 rounded border-slate-700 bg-slate-950 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="overwrite-duplicate-checkbox" className="text-xs text-slate-300 cursor-pointer">
                Proses seluruh baris (Timpa jika ada merchant ber-kategori & lokasi persis sama).
              </label>
            </div>

            <button
              onClick={handleProcessImport}
              disabled={isSubmitting || validRows.length === 0}
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-500 text-white font-semibold px-6 py-3 rounded-xl text-xs shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 transition-colors disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Memproses Import...</span>
                </>
              ) : (
                <>
                  <span>Konfirmasi & Simpan Seluruh {validRows.length} Merchant</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>

          {/* Preview Data Table with Filter Tabs & Pagination */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            {/* Header Tabs */}
            <div className="px-6 py-4 border-b border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-950/50">
              <h3 className="font-bold text-sm text-white">Pratinjau Data Impor ({filteredRows.length} Baris Ditampilkan)</h3>
              
              {/* Filter Tabs */}
              <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800">
                <button
                  type="button"
                  onClick={() => { setStatusFilter('ALL'); setCurrentPage(1); }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    statusFilter === 'ALL'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Semua ({parsedRows.length})
                </button>

                <button
                  type="button"
                  onClick={() => { setStatusFilter('VALID'); setCurrentPage(1); }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    statusFilter === 'VALID'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-emerald-400 hover:text-white'
                  }`}
                >
                  Valid ({validRows.length})
                </button>

                <button
                  type="button"
                  onClick={() => { setStatusFilter('INVALID'); setCurrentPage(1); }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    statusFilter === 'INVALID'
                      ? 'bg-red-600 text-white shadow-sm'
                      : 'text-red-400 hover:text-white'
                  }`}
                >
                  Gagal Validasi ({invalidRows.length})
                </button>
              </div>
            </div>

            {/* Table View */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider text-[10px] font-semibold border-b border-slate-800">
                  <tr>
                    <th className="px-4 py-3">No</th>
                    <th className="px-4 py-3">Sheet (Kategori)</th>
                    <th className="px-4 py-3">Nama Merchant</th>
                    <th className="px-4 py-3">Jenis</th>
                    <th className="px-4 py-3">Latitude / Longitude</th>
                    <th className="px-4 py-3">Status Validasi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {currentTableRows.map((row, idx) => {
                    const globalIdx = (currentPage - 1) * pageSize + idx + 1;
                    return (
                      <tr key={idx} className={row.isValid ? 'hover:bg-slate-800/40' : 'bg-red-500/10'}>
                        <td className="px-4 py-3 text-slate-500">{globalIdx}</td>
                        <td className="px-4 py-3 font-semibold text-blue-400">{row.sheetName}</td>
                        <td className="px-4 py-3 font-medium text-white">{row.name || <i className="text-red-400">(Kosong)</i>}</td>
                        <td className="px-4 py-3 text-slate-400">{row.jenis}</td>
                        <td className="px-4 py-3 font-mono text-[11px]">
                          {isNaN(row.latitude) ? 'N/A' : row.latitude.toFixed(6)}, {isNaN(row.longitude) ? 'N/A' : row.longitude.toFixed(6)}
                        </td>
                        <td className="px-4 py-3">
                          {row.isValid ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                              <CheckCircle2 className="w-3 h-3" /> Valid
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-500/10 border border-red-500/30 text-red-400">
                              <AlertTriangle className="w-3 h-3" /> {row.errorReason}
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination Bar */}
            <div className="px-6 py-4 border-t border-slate-800 flex items-center justify-between bg-slate-950/50 text-xs text-slate-400">
              <div>
                Menampilkan {Math.min((currentPage - 1) * pageSize + 1, filteredRows.length)} - {Math.min(currentPage * pageSize, filteredRows.length)} dari {filteredRows.length} baris
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage <= 1}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 transition-colors text-white cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="font-semibold text-white px-2">
                  Halaman {currentPage} dari {totalPages}
                </span>
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage >= totalPages}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 transition-colors text-white cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
