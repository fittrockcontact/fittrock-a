'use client';

import React, { useState } from 'react';
import {
  Star,
  PlusCircle,
  Trash2,
  CheckCircle2,
  XCircle,
  Loader2,
  X,
  MessageSquare,
  ShieldCheck,
} from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export interface AdminReviewItem {
  id: string;
  productId: string;
  productTitle: string;
  productSlug: string;
  authorName: string;
  authorRole: string;
  authorAvatar: string;
  rating: number;
  title: string;
  body: string;
  isVerifiedPurchase: boolean;
  isApproved: boolean;
  createdAt: string;
}

interface ReviewsClientProps {
  initialReviews: AdminReviewItem[];
  productsList: Array<{ id: string; title: string }>;
}

export function ReviewsClient({ initialReviews, productsList }: ReviewsClientProps) {
  const router = useRouter();
  const [reviews, setReviews] = useState<AdminReviewItem[]>(initialReviews);
  const [modalOpen, setModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State for new review
  const [productId, setProductId] = useState(productsList[0]?.id || '');
  const [authorName, setAuthorName] = useState('');
  const [authorRole, setAuthorRole] = useState('Software Engineer & Remote Worker');
  const [authorAvatar, setAuthorAvatar] = useState(
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'
  );
  const [rating, setRating] = useState('5');
  const [body, setBody] = useState('');

  // Handle Delete Review
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this customer review?')) return;

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/admin/reviews/${id}`,
        { method: 'DELETE' }
      );

      if (!res.ok) throw new Error('Failed to delete review');

      setReviews(reviews.filter((r) => r.id !== id));
      toast.success('Review deleted');
    } catch (err: any) {
      toast.error(err.message || 'Error deleting review');
    }
  };

  // Handle Toggle Approval
  const handleToggleApprove = async (id: string, current: boolean) => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/admin/reviews/${id}/approve`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ isApproved: !current }),
        }
      );

      if (!res.ok) throw new Error('Failed to update approval');

      setReviews(
        reviews.map((r) => (r.id === id ? { ...r, isApproved: !current } : r))
      );
      toast.success(!current ? 'Review approved for display' : 'Review unapproved');
    } catch (err: any) {
      toast.error(err.message || 'Error updating review');
    }
  };

  // Handle Create Review
  const handleCreateReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productId || !authorName || !body) {
      toast.error('Product, Name, and Review Text are required');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/admin/reviews`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            productId,
            authorName,
            authorRole,
            authorAvatar,
            rating: Number(rating) || 5,
            body,
            isVerifiedPurchase: true,
          }),
        }
      );

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to add review');
      }

      toast.success('Verified review added to Supabase database!');
      setModalOpen(false);
      setAuthorName('');
      setBody('');
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || 'Error adding review');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Reviews & Customer Stories
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Moderate, approve, and add verified customer testimonials displayed across product pages and /testimonials.
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold px-4 py-2.5 rounded-xl text-sm transition-all shadow-md shadow-amber-500/10"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Add Verified Review</span>
        </button>
      </div>

      {/* Reviews Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reviews.map((rev) => (
          <div
            key={rev.id}
            className="bg-zinc-900/70 border border-zinc-800/80 rounded-2xl p-6 space-y-5 flex flex-col justify-between hover:border-zinc-700 transition-all"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex text-amber-400 gap-0.5">
                  {[...Array(rev.rating)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggleApprove(rev.id, rev.isApproved)}
                    className={`text-[11px] font-bold px-2 py-0.5 rounded-full border transition-colors ${
                      rev.isApproved
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                    }`}
                  >
                    {rev.isApproved ? 'Approved' : 'Hidden'}
                  </button>

                  <button
                    onClick={() => handleDelete(rev.id)}
                    className="p-1 text-zinc-500 hover:text-red-400 transition-colors"
                    title="Delete Review"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <p className="text-zinc-300 text-xs sm:text-sm leading-relaxed italic">
                &ldquo;{rev.body}&rdquo;
              </p>
            </div>

            <div className="pt-4 border-t border-zinc-800/80 space-y-2">
              <div className="flex items-center gap-3">
                <img
                  src={
                    rev.authorAvatar ||
                    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'
                  }
                  alt={rev.authorName}
                  className="w-10 h-10 rounded-full object-cover border border-amber-500/40 shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <h4 className="font-bold text-xs sm:text-sm text-white truncate">
                    {rev.authorName}
                  </h4>
                  <p className="text-[11px] text-zinc-400 truncate">
                    {rev.authorRole || 'Verified Buyer'}
                  </p>
                </div>
              </div>

              <div className="text-[10px] text-zinc-500 truncate">
                Product: <span className="text-amber-400 font-semibold">{rev.productTitle}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Review Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-6 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
              <div className="flex items-center gap-2 text-amber-400">
                <MessageSquare className="w-5 h-5" />
                <h3 className="font-bold text-lg text-white">Add Verified Testimonial</h3>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 text-zinc-400 hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateReview} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-300">
                  Target Product <span className="text-red-400">*</span>
                </label>
                <select
                  value={productId}
                  onChange={(e) => setProductId(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                >
                  {productsList.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-300">
                    Author Full Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dr. Siddharth Menon"
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-300">
                    Job Title / Role
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Lead UX Designer"
                    value={authorRole}
                    onChange={(e) => setAuthorRole(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-semibold text-zinc-300">
                    Profile Avatar Photo URL
                  </label>
                  <input
                    type="url"
                    value={authorAvatar}
                    onChange={(e) => setAuthorAvatar(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-300">Rating</label>
                  <select
                    value={rating}
                    onChange={(e) => setRating(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="5">⭐⭐⭐⭐⭐ (5 Stars)</option>
                    <option value="4">⭐⭐⭐⭐ (4 Stars)</option>
                    <option value="3">⭐⭐⭐ (3 Stars)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-300">
                  Review Text <span className="text-red-400">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Share feedback on dual motor transitions, wood quality, or ergonomic relief..."
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-amber-500 leading-relaxed"
                />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white bg-zinc-900 hover:bg-zinc-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold px-5 py-2 rounded-xl text-xs shadow-md shadow-amber-500/20 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  )}
                  <span>Save Review</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
