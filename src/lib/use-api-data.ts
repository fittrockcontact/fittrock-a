'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api-client';

/**
 * Loads admin data in the browser so the request carries the signed-in
 * admin's token. Pages render only after AdminAuthGuard has verified the user.
 */
export function useApiData<T>(endpoint: string) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    apiFetch<T>(endpoint)
      .then((res) => {
        if (!cancelled) setData(res);
      })
      .catch((err) => {
        console.error(`Failed to fetch ${endpoint}:`, err);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [endpoint]);

  return { data, loading };
}
