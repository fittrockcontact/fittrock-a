import React from 'react';
import { apiFetch } from '@/lib/api-client';
import { ReviewsClient, AdminReviewItem } from './ReviewsClient';

export const dynamic = 'force-dynamic';

export default async function AdminReviewsPage() {
  let reviewsList: AdminReviewItem[] = [];
  let productsList: Array<{ id: string; title: string }> = [];

  try {
    const revsRes = await apiFetch<{ reviews: AdminReviewItem[] }>('/api/admin/reviews');
    if (Array.isArray(revsRes.reviews)) {
      reviewsList = revsRes.reviews;
    }

    const prodsRes = await apiFetch<{ products: any[] }>('/api/admin/products');
    if (Array.isArray(prodsRes.products)) {
      productsList = prodsRes.products.map((p) => ({
        id: p.id,
        title: p.title || p.name,
      }));
    }
  } catch (err) {
    console.error('Failed to fetch admin reviews:', err);
  }

  return (
    <ReviewsClient
      initialReviews={reviewsList}
      productsList={productsList}
    />
  );
}
