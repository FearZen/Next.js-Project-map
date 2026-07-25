'use client';

import React from 'react';
import { AlertTriangle, CheckCircle2, Info, X, Trash2, Loader2 } from 'lucide-react';

interface CustomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: () => void;
  title: string;
  message: string;
  type?: 'danger' | 'success' | 'warning' | 'info';
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
}

export function CustomModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  type = 'warning',
  confirmText = 'Konfirmasi',
  cancelText = 'Batal',
  isLoading = false,
}: CustomModalProps) {
  if (!isOpen) return null;

  const typeConfig = {
    danger: {
      icon: Trash2,
      iconBg: 'bg-red-500/10 border-red-500/30 text-red-400',
      btnBg: 'bg-red-600 hover:bg-red-500 text-white shadow-red-600/30',
    },
    warning: {
      icon: AlertTriangle,
      iconBg: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
      btnBg: 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-600/30',
    },
    success: {
      icon: CheckCircle2,
      iconBg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
      btnBg: 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30',
    },
    info: {
      icon: Info,
      iconBg: 'bg-blue-500/10 border-blue-500/30 text-blue-400',
      btnBg: 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/30',
    },
  };

  const currentType = typeConfig[type];
  const IconComponent = currentType.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in font-sans">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl shadow-2xl p-6 relative overflow-hidden space-y-4">
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={isLoading}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-start gap-4">
          <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center shrink-0 ${currentType.iconBg}`}>
            <IconComponent className="w-6 h-6" />
          </div>

          <div className="space-y-1 pr-6">
            <h3 className="font-bold text-lg text-white leading-tight">{title}</h3>
            <p className="text-xs text-slate-300 leading-relaxed">{message}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition-colors cursor-pointer"
          >
            {cancelText}
          </button>

          {onConfirm && (
            <button
              type="button"
              onClick={onConfirm}
              disabled={isLoading}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold shadow-lg transition-colors flex items-center gap-2 cursor-pointer ${currentType.btnBg}`}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Memproses...</span>
                </>
              ) : (
                <span>{confirmText}</span>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
