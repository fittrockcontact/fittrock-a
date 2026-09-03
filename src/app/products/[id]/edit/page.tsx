'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  Package,
  Layers,
  Sparkles,
  Plus,
  Trash2,
  Image as ImageIcon,
  Save,
  ArrowLeft,
  Loader2,
  CheckCircle2,
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { ImageUploader } from '@/components/ImageUploader';

interface FeatureHighlight {
  title: string;
  description: string;
}

interface ImageFeatureConfig {
  url: string;
  altText: string;
  title: string;
  subtitle: string;
  highlights: FeatureHighlight[];
}

interface VariantConfig {
  id?: string;
  sku: string;
  title?: string;
  color?: string;
  size?: string;
  price: string;
  compareAtPrice: string;
  stockQuantity: number;
}

export default function EditProductAdminPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [brand, setBrand] = useState('Fittrock');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('active');

  // Variants State
  const [variants, setVariants] = useState<VariantConfig[]>([]);

  // Feature Images State
  const [featureImages, setFeatureImages] = useState<ImageFeatureConfig[]>([]);

  // Fetch Existing Product Details
  useEffect(() => {
    if (!productId) return;

    async function fetchProduct() {
      try {
        setLoading(true);
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
        const res = await fetch(`${apiUrl}/api/admin/products/${productId}`);

        if (!res.ok) {
          throw new Error('Product not found or failed to load');
        }

        const data = await res.json();
        const prod = data.product;

        if (!prod) throw new Error('Product not found');

        setTitle(prod.title || '');
        setSlug(prod.slug || '');
        setBrand(prod.brand || 'Fittrock');
        setDescription(prod.description || '');
        setStatus(prod.status || 'active');

        // Map existing variants
        if (Array.isArray(prod.variants) && prod.variants.length > 0) {
          setVariants(
            prod.variants.map((v: any) => {
              const titleParts = (v.title || '').split('/');
              return {
                id: v.id,
                sku: v.sku || '',
                title: v.title || '',
                color: titleParts[0]?.trim() || 'Standard',
                size: titleParts[1]?.trim() || 'Standard',
                price: String(v.price || 0),
                compareAtPrice: v.compareAtPrice ? String(v.compareAtPrice) : '',
                stockQuantity: v.stockQuantity ?? 10,
              };
            })
          );
        } else {
          setVariants([
            {
              sku: `FT-${(prod.slug || 'DESK').toUpperCase()}-1`,
              color: 'Standard',
              size: 'Standard',
              price: '19999',
              compareAtPrice: '29999',
              stockQuantity: 10,
            },
          ]);
        }

        // Map existing feature images
        if (Array.isArray(prod.images) && prod.images.length > 0) {
          setFeatureImages(
            prod.images.map((img: any) => {
              const feat = img.features || {};
              return {
                url: img.url || '',
                altText: img.alt_text || img.altText || '',
                title: feat.title || 'Feature Showcase',
                subtitle: feat.subtitle || 'Key Technology & Engineering Highlight',
                highlights: Array.isArray(feat.highlights) ? feat.highlights : [],
              };
            })
          );
        }
      } catch (err: any) {
        console.error('Error fetching product for edit:', err);
        toast.error(err.message || 'Error loading product details');
      } finally {
        setLoading(false);
      }
    }

    fetchProduct();
  }, [productId]);

  // Add Variant Row
  const addVariant = () => {
    setVariants([
      ...variants,
      {
        sku: `FT-${(slug || 'PROD').toUpperCase()}-${variants.length + 1}`,
        color: 'New Color',
        size: '140x70 cm',
        price: '24999',
        compareAtPrice: '34999',
        stockQuantity: 15,
      },
    ]);
  };

  const removeVariant = (index: number) => {
    setVariants(variants.filter((_, idx) => idx !== index));
  };

  // Add Feature Spotlight
  const addFeatureImage = () => {
    setFeatureImages([
      ...featureImages,
      {
        url: '',
        altText: '',
        title: 'New Feature Showcase',
        subtitle: 'Engineering & Performance Details',
        highlights: [
          {
            title: 'Feature Benefit',
            description: 'Explain what makes this mechanism or material superior.',
          },
        ],
      },
    ]);
  };

  const removeFeatureImage = (index: number) => {
    setFeatureImages(featureImages.filter((_, idx) => idx !== index));
  };

  const addHighlight = (imageIdx: number) => {
    const updated = [...featureImages];
    updated[imageIdx].highlights.push({ title: 'New Highlight', description: 'Highlight details here.' });
    setFeatureImages(updated);
  };

  const removeHighlight = (imageIdx: number, highlightIdx: number) => {
    const updated = [...featureImages];
    updated[imageIdx].highlights = updated[imageIdx].highlights.filter((_, idx) => idx !== highlightIdx);
    setFeatureImages(updated);
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !slug.trim()) {
      toast.error('Product title and slug are required');
      return;
    }

    if (variants.length === 0) {
      toast.error('Product must have at least one variant');
      return;
    }

    setIsSubmitting(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

      const payload = {
        title,
        slug,
        brand,
        status,
        description,
        variants: variants.map((v) => ({
          id: v.id,
          sku: v.sku,
          title: `${v.color || 'Standard'} / ${v.size || 'Standard'}`,
          price: v.price,
          compareAtPrice: v.compareAtPrice || null,
          stockQuantity: v.stockQuantity,
        })),
        images: featureImages
          .filter((img) => img.url.trim().length > 0)
          .map((img) => ({
            url: img.url,
            altText: img.altText || title,
            features: {
              title: img.title,
              subtitle: img.subtitle,
              highlights: img.highlights,
            },
          })),
      };

      const res = await fetch(`${apiUrl}/api/admin/products/${productId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to update product');
      }

      toast.success('Product updated successfully!');
      router.push('/products');
      router.refresh();
    } catch (err: any) {
      console.error('Failed to update product:', err);
      toast.error(err.message || 'Error updating product');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="py-32 flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
        <p className="text-sm font-semibold text-zinc-400">Loading product details from database...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-6">
        <div>
          <Link
            href="/products"
            className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-colors mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Products List</span>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-3">
            <span>Edit Product</span>
            <span className="text-xs font-bold uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2.5 py-0.5 rounded-full">
              {status}
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Update pricing, technical specifications, variants, and feature spotlight images.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/products"
            className="px-4 py-2.5 rounded-xl border border-zinc-800 text-xs font-bold text-zinc-300 hover:bg-zinc-900 transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-zinc-950 px-5 py-2.5 rounded-xl text-xs font-black shadow-lg shadow-amber-500/20 transition-all disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving Changes...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Changes</span>
              </>
            )}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Columns: Core Info & Highlights */}
        <div className="lg:col-span-2 space-y-8">
          {/* General Information Card */}
          <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-6 space-y-5">
            <h2 className="text-base font-bold text-white flex items-center gap-2 border-b border-zinc-800 pb-3">
              <Package className="w-4 h-4 text-amber-500" />
              <span>General Information</span>
            </h2>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider block mb-1.5">
                  Product Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Fittrock Pro Dual Motor Standing Table"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider block mb-1.5">
                    URL Handle / Slug *
                  </label>
                  <input
                    type="text"
                    required
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="fittrock-pro-standing-table"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white font-mono text-xs focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider block mb-1.5">
                    Brand
                  </label>
                  <input
                    type="text"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    placeholder="Fittrock"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider block mb-1.5">
                  Description
                </label>
                <textarea
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Comprehensive description highlighting motor specs, dual beam stability, load capacity..."
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-4 text-sm text-white focus:border-amber-500 focus:outline-none resize-y"
                />
              </div>
            </div>
          </div>

          {/* Variants & Pricing Card */}
          <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-amber-500" />
                <span>Product Variants &amp; Pricing</span>
              </h2>
              <button
                type="button"
                onClick={addVariant}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-400 hover:text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 px-3 py-1.5 rounded-lg border border-amber-500/30 transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Variant</span>
              </button>
            </div>

            <div className="space-y-4">
              {variants.map((v, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-zinc-950/80 border border-zinc-800 space-y-3 relative group"
                >
                  <div className="flex items-center justify-between border-b border-zinc-800/60 pb-2">
                    <span className="text-xs font-mono font-bold text-amber-400">
                      Variant #{idx + 1}
                    </span>
                    {variants.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeVariant(idx)}
                        className="text-zinc-500 hover:text-red-400 p-1 rounded transition-colors"
                        title="Remove Variant"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 block mb-1">
                        SKU
                      </label>
                      <input
                        type="text"
                        value={v.sku}
                        onChange={(e) => {
                          const updated = [...variants];
                          updated[idx].sku = e.target.value;
                          setVariants(updated);
                        }}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs font-mono text-white focus:border-amber-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 block mb-1">
                        Color / Finish
                      </label>
                      <input
                        type="text"
                        value={v.color}
                        onChange={(e) => {
                          const updated = [...variants];
                          updated[idx].color = e.target.value;
                          setVariants(updated);
                        }}
                        placeholder="e.g. Walnut"
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:border-amber-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 block mb-1">
                        Tabletop Size
                      </label>
                      <input
                        type="text"
                        value={v.size}
                        onChange={(e) => {
                          const updated = [...variants];
                          updated[idx].size = e.target.value;
                          setVariants(updated);
                        }}
                        placeholder="e.g. 140x70 cm"
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:border-amber-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 block mb-1">
                        Selling Price (₹) *
                      </label>
                      <input
                        type="number"
                        required
                        value={v.price}
                        onChange={(e) => {
                          const updated = [...variants];
                          updated[idx].price = e.target.value;
                          setVariants(updated);
                        }}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs font-bold text-amber-400 focus:border-amber-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 block mb-1">
                        Compare At (₹)
                      </label>
                      <input
                        type="number"
                        value={v.compareAtPrice}
                        onChange={(e) => {
                          const updated = [...variants];
                          updated[idx].compareAtPrice = e.target.value;
                          setVariants(updated);
                        }}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-zinc-400 focus:border-amber-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 block mb-1">
                        Current Stock *
                      </label>
                      <input
                        type="number"
                        required
                        value={v.stockQuantity}
                        onChange={(e) => {
                          const updated = [...variants];
                          updated[idx].stockQuantity = parseInt(e.target.value) || 0;
                          setVariants(updated);
                        }}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:border-amber-500 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Feature Showcase Spotlights */}
          <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>Feature Showcase Spotlights</span>
                </h2>
                <p className="text-xs text-zinc-400 mt-0.5">
                  High-resolution infographic callouts shown on the product detail page.
                </p>
              </div>
              <button
                type="button"
                onClick={addFeatureImage}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-400 hover:text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 px-3 py-1.5 rounded-lg border border-amber-500/30 transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Spotlight</span>
              </button>
            </div>

            <div className="space-y-6">
              {featureImages.map((img, imgIdx) => (
                <div
                  key={imgIdx}
                  className="p-5 rounded-xl bg-zinc-950/80 border border-zinc-800 space-y-4"
                >
                  <div className="flex items-center justify-between border-b border-zinc-800/60 pb-2">
                    <span className="text-xs font-bold text-amber-400">
                      Spotlight #{imgIdx + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeFeatureImage(imgIdx)}
                      className="text-zinc-500 hover:text-red-400 p-1 rounded transition-colors"
                      title="Remove Spotlight"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="space-y-3">
                    <ImageUploader
                      label="Infographic Image"
                      value={img.url}
                      onChange={(url: string) => {
                        const updated = [...featureImages];
                        updated[imgIdx].url = url;
                        setFeatureImages(updated);
                      }}
                    />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 block mb-1">
                          Showcase Title
                        </label>
                        <input
                          type="text"
                          value={img.title}
                          onChange={(e) => {
                            const updated = [...featureImages];
                            updated[imgIdx].title = e.target.value;
                            setFeatureImages(updated);
                          }}
                          placeholder="e.g. Smart Touch Control Panel"
                          className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 block mb-1">
                          Showcase Subtitle
                        </label>
                        <input
                          type="text"
                          value={img.subtitle}
                          onChange={(e) => {
                            const updated = [...featureImages];
                            updated[imgIdx].subtitle = e.target.value;
                            setFeatureImages(updated);
                          }}
                          placeholder="e.g. Precision Ergonomics at Your Fingertips"
                          className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Bullet Highlights */}
                    <div className="pt-2 border-t border-zinc-800/40 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-zinc-400">
                          Feature Bullet Highlights
                        </span>
                        <button
                          type="button"
                          onClick={() => addHighlight(imgIdx)}
                          className="text-[11px] text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Add Highlight</span>
                        </button>
                      </div>

                      {img.highlights.map((h, hIdx) => (
                        <div key={hIdx} className="flex gap-2 items-start bg-zinc-900/50 p-2.5 rounded-lg border border-zinc-800/60">
                          <div className="flex-1 space-y-1.5">
                            <input
                              type="text"
                              value={h.title}
                              onChange={(e) => {
                                const updated = [...featureImages];
                                updated[imgIdx].highlights[hIdx].title = e.target.value;
                                setFeatureImages(updated);
                              }}
                              placeholder="Highlight Title (e.g. 4 Memory Presets)"
                              className="w-full bg-zinc-950 border border-zinc-800 rounded px-2.5 py-1 text-xs font-bold text-white focus:border-amber-500 focus:outline-none"
                            />
                            <input
                              type="text"
                              value={h.description}
                              onChange={(e) => {
                                const updated = [...featureImages];
                                updated[imgIdx].highlights[hIdx].description = e.target.value;
                                setFeatureImages(updated);
                              }}
                              placeholder="Description of the ergonomic or mechanical benefit..."
                              className="w-full bg-zinc-950 border border-zinc-800 rounded px-2.5 py-1 text-xs text-zinc-300 focus:border-amber-500 focus:outline-none"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => removeHighlight(imgIdx, hIdx)}
                            className="text-zinc-600 hover:text-red-400 p-1 rounded"
                            title="Remove Bullet"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Visibility, Status, Summary */}
        <div className="space-y-6">
          <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-white border-b border-zinc-800 pb-2">
              Product Status &amp; Visibility
            </h3>

            <div>
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider block mb-1.5">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-white font-semibold focus:border-amber-500 focus:outline-none"
              >
                <option value="active">Active (Visible on Storefront)</option>
                <option value="draft">Draft (Hidden from Public)</option>
                <option value="archived">Archived</option>
              </select>
            </div>

            <div className="pt-3 border-t border-zinc-800/80 space-y-2 text-xs text-zinc-400">
              <div className="flex justify-between">
                <span>Total Variants:</span>
                <span className="font-bold text-white">{variants.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Spotlights:</span>
                <span className="font-bold text-white">{featureImages.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Total Inventory:</span>
                <span className="font-bold text-amber-400">
                  {variants.reduce((acc, v) => acc + (Number(v.stockQuantity) || 0), 0)} units
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
