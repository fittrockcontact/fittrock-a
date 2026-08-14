import React from 'react';
import Link from 'next/link';
import {
  Package,
  PlusCircle,
  ExternalLink,
  Star,
  Layers,
  Sparkles,
} from 'lucide-react';
import { apiFetch } from '@/lib/api-client';
import { formatPrice, formatDate } from '@/lib/utils';
import { ProductTableActions } from './ProductTableActions';

export const dynamic = 'force-dynamic';

interface ProductItem {
  id: string;
  title: string;
  name?: string;
  slug: string;
  description?: string;
  status: string;
  brand?: string;
  avgRating?: string;
  reviewCount?: number;
  createdAt?: string;
  variants?: Array<{
    id: string;
    sku: string;
    title?: string;
    price: string | number;
    inventory_quantity?: number;
  }>;
  images?: Array<{
    id: string;
    url: string;
    features?: any;
  }>;
}

export default async function AdminProductsPage() {
  let productsList: ProductItem[] = [];

  try {
    const res = await apiFetch<{ products: ProductItem[] }>('/api/admin/products');
    if (Array.isArray(res.products)) {
      productsList = res.products;
    }
  } catch (err) {
    console.error('Failed to fetch admin products:', err);
  }

  const storeUrl = process.env.NEXT_PUBLIC_STORE_URL || 'http://localhost:3000';

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Product Catalog
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Manage standing desks, accessories, variants, and infographic feature blocks.
          </p>
        </div>

        <Link
          href="/products/new"
          className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold px-4 py-2.5 rounded-xl text-sm transition-all shadow-md shadow-amber-500/10"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Add New Product</span>
        </Link>
      </div>

      {/* Products Table Card */}
      <div className="bg-zinc-900/70 border border-zinc-800/80 rounded-2xl p-6 space-y-6">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
          <div>
            <h2 className="text-lg font-bold text-white">All Products ({productsList.length})</h2>
            <p className="text-xs text-zinc-400">Live products in Supabase database</p>
          </div>
        </div>

        {productsList.length === 0 ? (
          <div className="text-center py-16 space-y-3 text-zinc-500">
            <Package className="w-10 h-10 mx-auto text-zinc-600 mb-2" />
            <p className="text-base font-bold text-zinc-300">No products found</p>
            <p className="text-xs">Get started by creating your first standing desk or ergonomic accessory.</p>
            <div className="pt-2">
              <Link
                href="/products/new"
                className="inline-flex items-center gap-2 bg-amber-500 text-zinc-950 font-bold px-4 py-2 rounded-xl text-xs"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Create Product</span>
              </Link>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs text-zinc-400 uppercase bg-zinc-950/60 border-b border-zinc-800">
                <tr>
                  <th className="py-3 px-4 rounded-l-xl">Product</th>
                  <th className="py-3 px-4">Variants</th>
                  <th className="py-3 px-4">Price Range</th>
                  <th className="py-3 px-4">Infographics</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right rounded-r-xl">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {productsList.map((prod) => {
                  const variants = prod.variants || [];
                  const images = prod.images || [];
                  const coverImg = images[0]?.url || 'https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&w=300&q=80';
                  const prices = variants.map((v) => Number(v.price) || 0).filter((p) => p > 0);
                  const minPrice = prices.length ? Math.min(...prices) : 0;
                  const featureImagesCount = images.filter((img) => Boolean(img.features)).length;

                  return (
                    <tr key={prod.id} className="hover:bg-zinc-800/30 transition-colors">
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3.5">
                          <img
                            src={coverImg}
                            alt={prod.title}
                            className="w-12 h-12 rounded-xl object-cover border border-zinc-800 bg-zinc-950 shrink-0"
                          />
                          <div className="min-w-0">
                            <h3 className="font-bold text-white text-sm truncate max-w-xs sm:max-w-md">
                              {prod.title || prod.name}
                            </h3>
                            <p className="text-xs text-zinc-500 font-mono">
                              /{prod.slug}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <span className="inline-flex items-center gap-1 bg-zinc-800 text-zinc-300 text-xs font-semibold px-2.5 py-1 rounded-lg border border-zinc-700">
                          <Layers className="w-3 h-3 text-amber-400" />
                          <span>{variants.length} Variants</span>
                        </span>
                      </td>

                      <td className="py-4 px-4 font-bold text-amber-400">
                        {formatPrice(minPrice)}
                      </td>

                      <td className="py-4 px-4">
                        {featureImagesCount > 0 ? (
                          <span className="inline-flex items-center gap-1 bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold px-2.5 py-1 rounded-lg">
                            <Sparkles className="w-3 h-3" />
                            <span>{featureImagesCount} Feature Spotlights</span>
                          </span>
                        ) : (
                          <span className="text-xs text-zinc-500 font-medium">None</span>
                        )}
                      </td>

                      <td className="py-4 px-4">
                        <span
                          className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                            prod.status === 'active'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                          }`}
                        >
                          {prod.status || 'Active'}
                        </span>
                      </td>

                      <td className="py-4 px-4 text-right">
                        <ProductTableActions
                          productId={prod.id}
                          slug={prod.slug}
                          storeUrl={storeUrl}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
