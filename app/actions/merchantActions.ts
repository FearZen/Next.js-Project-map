'use client';

// Client wrapper / Server action handler for merchant status & notes updates

export async function updateMerchantStatusAction(data: {
  merchantId: string;
  newStatusId: string;
  noteText?: string;
}) {
  try {
    const res = await fetch('/api/merchants/status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    return json;
  } catch (err: any) {
    return { success: false, error: err.message || 'Gagal mengubah status' };
  }
}
