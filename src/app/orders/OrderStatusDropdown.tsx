'use client';

import React, { useState } from 'react';
import { toast } from 'sonner';
import { Loader2, Truck, ExternalLink, Check } from 'lucide-react';
import { useRouter } from 'next/navigation';

export interface ShipmentInfo {
  id?: string;
  carrier_name?: string;
  tracking_number?: string;
  tracking_url?: string;
  status?: string;
}

interface OrderStatusDropdownProps {
  orderId: string;
  initialStatus: string;
  existingShipment?: ShipmentInfo | null;
}

export function OrderStatusDropdown({
  orderId,
  initialStatus,
  existingShipment,
}: OrderStatusDropdownProps) {
  const router = useRouter();
  const [status, setStatus] = useState(initialStatus);
  const [shipment, setShipment] = useState<ShipmentInfo | null>(existingShipment || null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showShipModal, setShowShipModal] = useState(false);

  // Shipment Form
  const [carrier, setCarrier] = useState(existingShipment?.carrier_name || 'Delhivery');
  const [trackingNumber, setTrackingNumber] = useState(existingShipment?.tracking_number || '');
  const [trackingUrl, setTrackingUrl] = useState(existingShipment?.tracking_url || '');

  const handleSelectChange = async (newStatus: string) => {
    if (newStatus === 'shipped' || newStatus === 'out_for_delivery') {
      setStatus(newStatus);
      setShowShipModal(true);
      return;
    }

    await submitStatusUpdate(newStatus);
  };

  const submitStatusUpdate = async (
    targetStatus: string,
    shipmentDetails?: { carrierName: string; trackingNumber: string; trackingUrl: string }
  ) => {
    setIsUpdating(true);
    try {
      const payload: any = { status: targetStatus };
      if (shipmentDetails) {
        payload.carrierName = shipmentDetails.carrierName;
        payload.trackingNumber = shipmentDetails.trackingNumber;
        payload.trackingUrl = shipmentDetails.trackingUrl;
      }

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/admin/orders/${orderId}/status`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) {
        throw new Error('Failed to update status');
      }

      setStatus(targetStatus);
      if (shipmentDetails) {
        setShipment({
          carrier_name: shipmentDetails.carrierName,
          tracking_number: shipmentDetails.trackingNumber,
          tracking_url: shipmentDetails.trackingUrl,
        });
      }

      toast.success(`Order marked as ${targetStatus}`);
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || 'Error updating order status');
    } finally {
      setIsUpdating(false);
      setShowShipModal(false);
    }
  };

  const handleShipmentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitStatusUpdate(status, {
      carrierName: carrier,
      trackingNumber,
      trackingUrl: trackingUrl || (carrier === 'Delhivery' && trackingNumber ? `https://www.delhivery.com/track/package/${trackingNumber}` : ''),
    });
  };

  const getStatusColor = (st: string) => {
    switch (st) {
      case 'paid':
      case 'confirmed':
      case 'delivered':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'shipped':
      case 'out_for_delivery':
      case 'processing':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'cancelled':
      case 'returned':
        return 'bg-red-500/10 text-red-400 border-red-500/20';
      default:
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
    }
  };

  return (
    <div className="space-y-1.5">
      <div className="inline-flex items-center gap-2">
        {isUpdating && <Loader2 className="w-3 h-3 animate-spin text-amber-400" />}
        <select
          value={status}
          disabled={isUpdating}
          onChange={(e) => handleSelectChange(e.target.value)}
          className={`text-xs font-bold px-2.5 py-1 rounded-lg border uppercase tracking-wider bg-zinc-950 focus:outline-none cursor-pointer ${getStatusColor(
            status
          )}`}
        >
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="processing">Processing</option>
          <option value="shipped">Shipped</option>
          <option value="out_for_delivery">Out for Delivery</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>

        <button
          type="button"
          onClick={() => setShowShipModal(true)}
          className="p-1 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700 transition-colors"
          title="Courier Tracking Info"
        >
          <Truck className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Tracking snippet if available */}
      {shipment?.tracking_number && (
        <div className="flex items-center gap-1.5 text-[11px] text-zinc-400">
          <span className="font-semibold text-zinc-300">{shipment.carrier_name}:</span>
          <span className="font-mono text-amber-400">{shipment.tracking_number}</span>
          {shipment.tracking_url && (
            <a
              href={shipment.tracking_url}
              target="_blank"
              rel="noreferrer"
              className="text-zinc-500 hover:text-amber-400 ml-0.5"
              title="Track Package"
            >
              <ExternalLink className="w-2.5 h-2.5" />
            </a>
          )}
        </div>
      )}

      {/* Shipment Modal */}
      {showShipModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 max-w-md w-full space-y-5 shadow-2xl relative text-left">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-amber-500" />
                <h3 className="text-sm font-bold text-white">Courier Dispatch &amp; Tracking</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowShipModal(false)}
                className="text-zinc-500 hover:text-white p-1 rounded"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleShipmentSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider block mb-1">
                  Courier Partner
                </label>
                <select
                  value={carrier}
                  onChange={(e) => setCarrier(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
                >
                  <option value="Delhivery">Delhivery</option>
                  <option value="Shiprocket">Shiprocket</option>
                  <option value="BlueDart">Blue Dart Express</option>
                  <option value="DTDC">DTDC Courier</option>
                  <option value="Ekart">Ekart Logistics</option>
                  <option value="India Post">India Post (Speed Post)</option>
                  <option value="Local Courier">Direct / Local Logistics</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider block mb-1">
                  AWB / Tracking Number *
                </label>
                <input
                  type="text"
                  required
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  placeholder="e.g. 143245678912"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs font-mono font-bold text-white focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider block mb-1">
                  Tracking Web Link (Optional)
                </label>
                <input
                  type="url"
                  value={trackingUrl}
                  onChange={(e) => setTrackingUrl(e.target.value)}
                  placeholder="https://track.shiprocket.in/..."
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="pt-2 border-t border-zinc-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowShipModal(false)}
                  className="px-3 py-1.5 text-xs font-bold text-zinc-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="inline-flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-zinc-950 px-4 py-1.5 rounded-xl text-xs font-black transition-all"
                >
                  {isUpdating ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Check className="w-3.5 h-3.5" />
                  )}
                  <span>Save Tracking</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
