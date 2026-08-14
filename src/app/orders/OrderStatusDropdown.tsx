'use client';

import React, { useState } from 'react';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface OrderStatusDropdownProps {
  orderId: string;
  initialStatus: string;
}

export function OrderStatusDropdown({ orderId, initialStatus }: OrderStatusDropdownProps) {
  const [status, setStatus] = useState(initialStatus);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleStatusChange = async (newStatus: string) => {
    setIsUpdating(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/admin/orders/${orderId}/status`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      if (!res.ok) {
        throw new Error('Failed to update status');
      }

      setStatus(newStatus);
      toast.success(`Order status updated to ${newStatus}`);
    } catch (err: any) {
      toast.error(err.message || 'Error updating order status');
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusColor = (st: string) => {
    switch (st) {
      case 'paid':
      case 'delivered':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'shipped':
      case 'processing':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'cancelled':
        return 'bg-red-500/10 text-red-400 border-red-500/20';
      default:
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
    }
  };

  return (
    <div className="inline-flex items-center gap-2">
      {isUpdating && <Loader2 className="w-3 h-3 animate-spin text-amber-400" />}
      <select
        value={status}
        disabled={isUpdating}
        onChange={(e) => handleStatusChange(e.target.value)}
        className={`text-xs font-bold px-2.5 py-1 rounded-lg border uppercase tracking-wider bg-zinc-950 focus:outline-none cursor-pointer ${getStatusColor(
          status
        )}`}
      >
        <option value="pending">Pending</option>
        <option value="paid">Paid</option>
        <option value="processing">Processing</option>
        <option value="shipped">Shipped</option>
        <option value="delivered">Delivered</option>
        <option value="cancelled">Cancelled</option>
      </select>
    </div>
  );
}
