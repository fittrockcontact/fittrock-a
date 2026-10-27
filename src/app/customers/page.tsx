'use client';

import React from 'react';
import { useApiData } from '@/lib/use-api-data';
import { CustomersClient, CustomerItem } from './CustomersClient';

export default function AdminCustomersPage() {
  const { data, loading } = useApiData<{ customers: CustomerItem[] }>('/api/admin/customers');
  const customersList: CustomerItem[] = Array.isArray(data?.customers) ? data.customers : [];

  if (loading) {
    return <p className="text-sm text-zinc-400">Loading…</p>;
  }

  return <CustomersClient initialCustomers={customersList} />;
}
