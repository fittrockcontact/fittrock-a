'use client';

import React, { useState } from 'react';
import { ExternalLink, Trash2, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface ProductTableActionsProps {
  productId: string;
  slug: string;
  storeUrl: string;
}

export function ProductTableActions({ productId, slug, storeUrl }: ProductTableActionsProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this product? All variants and feature blocks will be removed.')) {
      return;
    }

    setIsDeleting(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/admin/products/${productId}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        throw new Error('Failed to delete product');
      }

      toast.success('Product deleted successfully');
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || 'Error deleting product');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="inline-flex items-center gap-2 justify-end">
      <a
        href={`${storeUrl}/products/${slug}`}
        target="_blank"
        rel="noreferrer"
        className="p-2 rounded-lg bg-zinc-800 text-zinc-300 hover:text-amber-400 hover:bg-zinc-700 transition-colors"
        title="View on Storefront"
      >
        <ExternalLink className="w-3.5 h-3.5" />
      </a>

      <button
        onClick={handleDelete}
        disabled={isDeleting}
        className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-colors disabled:opacity-50"
        title="Delete Product"
      >
        {isDeleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
      </button>
    </div>
  );
}
