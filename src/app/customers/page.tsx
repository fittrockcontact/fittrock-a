import React from 'react';
import { apiFetch } from '@/lib/api-client';
import { CustomersClient, CustomerItem } from './CustomersClient';

export const dynamic = 'force-dynamic';

export default async function AdminCustomersPage() {
  let customersList: CustomerItem[] = [];

  try {
    const res = await apiFetch<{ customers: CustomerItem[] }>('/api/admin/customers');
    if (Array.isArray(res.customers)) {
      customersList = res.customers;
    }
  } catch (err) {
    console.error('Failed to fetch admin customers:', err);
  }

  return <CustomersClient initialCustomers={customersList} />;
}
