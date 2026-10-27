'use client';

import React from 'react';
import { useApiData } from '@/lib/use-api-data';
import { ReviewsClient, AdminReviewItem } from './ReviewsClient';

export default function AdminReviewsPage() {
  const reviews = useApiData<{ reviews: AdminReviewItem[] }>('/api/admin/reviews');
  const products = useApiData<{ products: any[] }>('/api/admin/products');
  const loading = reviews.loading || products.loading;

  const reviewsList: AdminReviewItem[] = Array.isArray(reviews.data?.reviews) ? reviews.data.reviews : [];
  const productsList: Array<{ id: string; title: string }> = Array.isArray(products.data?.products)
    ? products.data.products.map((p) => ({
        id: p.id,
        title: p.title || p.name,
      }))
    : [];

  if (loading) {
    return <p className="text-sm text-zinc-400">Loading…</p>;
  }

  return (
    <ReviewsClient
      initialReviews={reviewsList}
      productsList={productsList}
    />
  );
}
