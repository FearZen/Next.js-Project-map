'use client';

import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, MessageSquare, Loader2, Sparkles } from 'lucide-react';
import { updateMerchantStatusAction } from '@/app/actions/merchantActions';

interface UpdateStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  merchant: any | null;
  statuses: any[];
  onSuccess: () => void;
}

export function UpdateStatusModal({
  isOpen,
  onClose,
  merchant,
  statuses,
  onSuccess,
}: UpdateStatusModalProps) {
  const [selectedStatusId, setSelectedStatusId] = useState('');
  const [noteText, setNoteText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    if (merchant) {
      setSelectedStatusId(merchant.statusId || statuses[0]?.id || '');
      setNoteText('');
      setAlert(null);
    }
  }, [merchant, statuses]);

  if (!isOpen || !merchant) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setAlert(null);

    const res = await updateMerchantStatusAction({
      merchantId: merchant.id,
      newStatusId: selectedStatusId,
      noteText,
    });

    setIsSubmitting(false);

    if (res.success) {
      setAlert({ type: 'success', message: 'Status & riwayat kunjungan berhasil diperbarui!' });
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1000);
    } else {
      setAlert({ type: 'error', message: res.error || 'Gagal menyimpan perubahan.' });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden font-sans">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400">
              Form Lapangan
            </span>
            <h3 className="text-lg font-bold text-white leading-tight">Update Status & Catatan</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Target Merchant Info */}
          <div className="p-3.5 bg-slate-950/70 border border-slate-800 rounded-xl space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 font-medium">{merchant.category}</span>
              <span
                className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white"
                style={{ backgroundColor: merchant.status?.colorHex || '#6B7280' }}
              >
                {merchant.status?.name}
              </span>
            </div>
            <h4 className="font-bold text-white text-base">{merchant.name}</h4>
            <p className="text-xs text-slate-400">{merchant.jenis}</p>
          </div>

          {alert && (
            <div
              className={`p-3 rounded-xl text-xs font-medium ${
                alert.type === 'success'
                  ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
                  : 'bg-red-500/10 border border-red-500/30 text-red-400'
              }`}
            >
              {alert.message}
            </div>
          )}

          {/* Status Options */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Pilih Status Akuisisi Baru
            </label>
            <div className="grid grid-cols-1 gap-2">
              {statuses.map((st) => {
                const isChecked = selectedStatusId === st.id;
                return (
                  <label
                    key={st.id}
                    onClick={() => setSelectedStatusId(st.id)}
                    className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${
                      isChecked
                        ? 'bg-slate-800 border-blue-500/80 shadow-sm'
                        : 'bg-slate-950/40 border-slate-800 hover:bg-slate-800/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className="w-3.5 h-3.5 rounded-full shrink-0"
                        style={{ backgroundColor: st.colorHex }}
                      />
                      <span className="text-sm font-medium text-slate-200">{st.name}</span>
                    </div>
                    {isChecked && <CheckCircle2 className="w-4 h-4 text-blue-400" />}
                  </label>
                );
              })}
            </div>
          </div>

          {/* Notes Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Catatan Kunjungan Lapangan
            </label>
            <textarea
              rows={3}
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="Contoh: Owner menyetujui pemasangan EDC & QRIS Mandiri..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
          </div>

          {/* Submit Button */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="w-1/3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold py-3 rounded-xl text-xs transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-2/3 bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 rounded-xl text-xs transition-colors shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Menyimpan...</span>
                </>
              ) : (
                <span>Simpan Perubahan Status</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
