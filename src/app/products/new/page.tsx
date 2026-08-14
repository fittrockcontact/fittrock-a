'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
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
  sku: string;
  color: string;
  size: string;
  price: string;
  compareAtPrice: string;
  stockQuantity: number;
}

export default function NewProductAdminPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [brand, setBrand] = useState('Fittrock');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('active');

  // Variants State
  const [variants, setVariants] = useState<VariantConfig[]>([
    {
      sku: 'FT-DESK-WHT-BRN',
      color: 'White + Brown',
      size: '140x70 cm',
      price: '24999',
      compareAtPrice: '34999',
      stockQuantity: 25,
    },
    {
      sku: 'FT-DESK-BLK-BRN',
      color: 'Black + Brown',
      size: '160x80 cm',
      price: '27999',
      compareAtPrice: '38999',
      stockQuantity: 15,
    },
  ]);

  // Infographic Feature Image Spotlights State
  const [featureImages, setFeatureImages] = useState<ImageFeatureConfig[]>([
    {
      url: 'https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&w=1200&q=80',
      altText: 'Smart Height Control Panel',
      title: 'Smart Touch Control Panel',
      subtitle: 'Precision Ergonomics at Your Fingertips',
      highlights: [
        {
          title: 'Digital LED Height Display',
          description: 'Shows exact elevation in millimeters for ergonomic accuracy.',
        },
        {
          title: '4 Memory Presets',
          description: 'Store preferred sitting, standing, and focus heights with one touch.',
        },
        {
          title: 'Sit-Stand Reminder',
          description: 'Configurable gentle vibration alerts to keep you active through the day.',
        },
      ],
    },
  ]);

  // Handle Title change and auto slug generator
  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!slug || slug === title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')) {
      setSlug(
        val
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)+/g, '')
      );
    }
  };

  // Add Variant Row
  const addVariant = () => {
    setVariants([
      ...variants,
      {
        sku: `FT-${(slug || 'PROD').toUpperCase()}-${variants.length + 1}`,
        color: 'Oak',
        size: '120x60 cm',
        price: '22999',
        compareAtPrice: '29999',
        stockQuantity: 20,
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
        subtitle: 'Key Technology & Engineering Highlight',
        highlights: [
          {
            title: 'Feature Benefit 1',
            description: 'Explain what makes this mechanism or material superior.',
          },
        ],
      },
    ]);
  };

  const removeFeatureImage = (index: number) => {
    setFeatureImages(featureImages.filter((_, idx) => idx !== index));
  };

  // Add highlight bullet to a feature image
  const addHighlight = (featureIndex: number) => {
    const updated = [...featureImages];
    updated[featureIndex].highlights.push({
      title: 'New Feature Point',
      description: 'Detail specification or performance metric.',
    });
    setFeatureImages(updated);
  };

  const removeHighlight = (featureIndex: number, highlightIndex: number) => {
    const updated = [...featureImages];
    updated[featureIndex].highlights = updated[featureIndex].highlights.filter(
      (_, idx) => idx !== highlightIndex
    );
    setFeatureImages(updated);
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !slug) {
      toast.error('Product Title and Slug are required');
      return;
    }

    setIsSubmitting(true);

    try {
      // Format images with features JSONB structure
      const formattedImages = featureImages
        .filter((img) => img.url.trim() !== '')
        .map((img) => ({
          url: img.url,
          altText: img.altText || img.title,
          features: {
            title: img.title,
            subtitle: img.subtitle,
            highlights: img.highlights,
          },
        }));

      const payload = {
        title,
        slug,
        brand,
        description,
        status,
        variants: variants.map((v) => ({
          sku: v.sku,
          color: v.color,
          size: v.size,
          price: parseFloat(v.price) || 0,
          compareAtPrice: v.compareAtPrice ? parseFloat(v.compareAtPrice) : null,
          stockQuantity: v.stockQuantity,
        })),
        images: formattedImages,
      };

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/admin/products`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to create product');
      }

      toast.success('Product created successfully in Supabase database!');
      router.push('/products');
    } catch (err: any) {
      toast.error(err.message || 'Error creating product');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/products"
            className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-white">
              Create New Product
            </h1>
            <p className="text-xs text-zinc-400">
              Add desk details, multi-variant pricing, and infographic feature showcases.
            </p>
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold px-6 py-2.5 rounded-xl text-sm transition-all shadow-md shadow-amber-500/20 disabled:opacity-50"
        >
          {isSubmitting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          <span>{isSubmitting ? 'Saving to Database...' : 'Save & Publish Product'}</span>
        </button>
      </div>

      {/* Section 1: Basic Information */}
      <div className="bg-zinc-900/70 border border-zinc-800/80 rounded-2xl p-6 space-y-5">
        <div className="flex items-center gap-2 text-amber-400 border-b border-zinc-800 pb-3">
          <Package className="w-4 h-4" />
          <h2 className="font-bold text-sm text-white">1. General Information</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-300">
              Product Title <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Fittrock Ultra Dual-Motor Standing Desk"
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-300">
              URL Slug <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. fittrock-ultra-dual-motor-desk"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm font-mono text-amber-400 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-300">Brand</label>
            <input
              type="text"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-300">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
            >
              <option value="active">Active (Visible in Storefront)</option>
              <option value="draft">Draft (Hidden)</option>
            </select>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-zinc-300">Product Description</label>
          <textarea
            rows={3}
            placeholder="Detailed description of ergonomic materials, frame construction, and performance..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-4 text-sm text-white focus:outline-none focus:border-amber-500 leading-relaxed"
          />
        </div>
      </div>

      {/* Section 2: Variants */}
      <div className="bg-zinc-900/70 border border-zinc-800/80 rounded-2xl p-6 space-y-5">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <div className="flex items-center gap-2 text-amber-400">
            <Layers className="w-4 h-4" />
            <h2 className="font-bold text-sm text-white">2. Product Variants & Inventory</h2>
          </div>
          <button
            type="button"
            onClick={addVariant}
            className="inline-flex items-center gap-1 text-xs font-bold text-amber-400 hover:text-amber-300 bg-amber-500/10 px-3 py-1.5 rounded-lg border border-amber-500/20"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Variant</span>
          </button>
        </div>

        <div className="space-y-3">
          {variants.map((v, idx) => (
            <div
              key={idx}
              className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 grid grid-cols-2 sm:grid-cols-6 gap-3 items-end"
            >
              <div className="space-y-1 col-span-2 sm:col-span-1">
                <label className="text-[11px] font-semibold text-zinc-400">SKU</label>
                <input
                  type="text"
                  value={v.sku}
                  onChange={(e) => {
                    const u = [...variants];
                    u[idx].sku = e.target.value;
                    setVariants(u);
                  }}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-zinc-400">Color / Finish</label>
                <input
                  type="text"
                  value={v.color}
                  onChange={(e) => {
                    const u = [...variants];
                    u[idx].color = e.target.value;
                    setVariants(u);
                  }}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-zinc-400">Dimension</label>
                <input
                  type="text"
                  value={v.size}
                  onChange={(e) => {
                    const u = [...variants];
                    u[idx].size = e.target.value;
                    setVariants(u);
                  }}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-zinc-400">Price (₹)</label>
                <input
                  type="number"
                  value={v.price}
                  onChange={(e) => {
                    const u = [...variants];
                    u[idx].price = e.target.value;
                    setVariants(u);
                  }}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-amber-400 font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-zinc-400">Stock Qty</label>
                <input
                  type="number"
                  value={v.stockQuantity}
                  onChange={(e) => {
                    const u = [...variants];
                    u[idx].stockQuantity = Number(e.target.value);
                    setVariants(u);
                  }}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-white"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => removeVariant(idx)}
                  disabled={variants.length === 1}
                  className="p-2 text-zinc-500 hover:text-red-400 hover:bg-zinc-900 rounded-lg disabled:opacity-30"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Section 3: Infographic Feature Showcase Builder */}
      <div className="bg-zinc-900/70 border border-zinc-800/80 rounded-2xl p-6 space-y-6">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <div>
            <div className="flex items-center gap-2 text-amber-400">
              <Sparkles className="w-4 h-4" />
              <h2 className="font-bold text-sm text-white">
                3. Infographic Feature Spotlights (JSONB on Image Table)
              </h2>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              Attach dynamic 2-column feature breakdowns (Title, Subtitle & bullet points) to high-res infographic photos.
            </p>
          </div>
          <button
            type="button"
            onClick={addFeatureImage}
            className="inline-flex items-center gap-1 text-xs font-bold text-amber-400 hover:text-amber-300 bg-amber-500/10 px-3 py-1.5 rounded-lg border border-amber-500/20"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Spotlight Image</span>
          </button>
        </div>

        <div className="space-y-6">
          {featureImages.map((fImg, fIdx) => (
            <div
              key={fIdx}
              className="bg-zinc-950 border border-zinc-800/90 rounded-2xl p-5 space-y-5"
            >
              <div className="flex items-center justify-between border-b border-zinc-800/60 pb-3">
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                  Spotlight #{fIdx + 1}
                </span>
                <button
                  type="button"
                  onClick={() => removeFeatureImage(fIdx)}
                  className="text-xs text-red-400 hover:text-red-300 inline-flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Remove Card</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-300">
                    Infographic Photo URL
                  </label>
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/..."
                    value={fImg.url}
                    onChange={(e) => {
                      const u = [...featureImages];
                      u[fIdx].url = e.target.value;
                      setFeatureImages(u);
                    }}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-300">
                    Card Title
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Heavy-Duty Dual Motor Mechanism"
                    value={fImg.title}
                    onChange={(e) => {
                      const u = [...featureImages];
                      u[fIdx].title = e.target.value;
                      setFeatureImages(u);
                    }}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-semibold text-zinc-300">
                    Subtitle / Tagline
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Ultra-smooth height elevation designed for heavy multi-monitor desks"
                    value={fImg.subtitle}
                    onChange={(e) => {
                      const u = [...featureImages];
                      u[fIdx].subtitle = e.target.value;
                      setFeatureImages(u);
                    }}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-zinc-300 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Highlights Repeater */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-zinc-300">
                    Bullet Feature Highlights ({fImg.highlights.length})
                  </span>
                  <button
                    type="button"
                    onClick={() => addHighlight(fIdx)}
                    className="text-[11px] font-bold text-amber-400 hover:text-amber-300 inline-flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add Highlight Point</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {fImg.highlights.map((hl, hIdx) => (
                    <div
                      key={hIdx}
                      className="flex items-start gap-2 bg-zinc-900/90 border border-zinc-800 p-3 rounded-xl"
                    >
                      <div className="flex-1 space-y-1.5">
                        <input
                          type="text"
                          placeholder="Highlight Title (e.g. 125kg Weight Capacity)"
                          value={hl.title}
                          onChange={(e) => {
                            const u = [...featureImages];
                            u[fIdx].highlights[hIdx].title = e.target.value;
                            setFeatureImages(u);
                          }}
                          className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1 text-xs font-bold text-amber-400"
                        />
                        <input
                          type="text"
                          placeholder="Description (e.g. Industrial-grade dual steel motors lift effortlessly)"
                          value={hl.description}
                          onChange={(e) => {
                            const u = [...featureImages];
                            u[fIdx].highlights[hIdx].description = e.target.value;
                            setFeatureImages(u);
                          }}
                          className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1 text-xs text-zinc-300"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeHighlight(fIdx, hIdx)}
                        className="p-1.5 text-zinc-500 hover:text-red-400"
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
    </form>
  );
}
