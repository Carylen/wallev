'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface FilterValues {
  from: string;
  to: string;
  bucket: 'daily' | 'weekly' | 'monthly';
  kind: 'income' | 'expense' | 'both';
}

interface LedgerAnalyticsFiltersProps {
  initialValues: FilterValues;
  ledgerId: string;
}

export default function LedgerAnalyticsFilters({
  initialValues,
  ledgerId,
}: LedgerAnalyticsFiltersProps) {
  const router = useRouter();
  const [filters, setFilters] = useState<FilterValues>(initialValues);

  const handleChange = (key: keyof FilterValues, value: string) => {
    const updated = { ...filters, [key]: value };
    setFilters(updated);

    // Update URL query string
    const params = new URLSearchParams({
      from: updated.from,
      to: updated.to,
      bucket: updated.bucket,
      kind: updated.kind,
    });

    router.push(`/ledgers/${ledgerId}?${params.toString()}`);
  };

  return (
    <div className="glass-panel rounded-lg p-6">
      <h3 className="mb-4 text-lg font-semibold">Filter Analytics</h3>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* From Date */}
        <div className="flex flex-col gap-2">
          <label htmlFor="from" className="text-sm font-medium text-muted">
            From Date
          </label>
          <input
            id="from"
            type="date"
            value={filters.from}
            onChange={(e) => handleChange('from', e.target.value)}
            className="glass-input rounded px-3 py-2 text-sm focus:outline-none"
          />
        </div>

        {/* To Date */}
        <div className="flex flex-col gap-2">
          <label htmlFor="to" className="text-sm font-medium text-muted">
            To Date
          </label>
          <input
            id="to"
            type="date"
            value={filters.to}
            onChange={(e) => handleChange('to', e.target.value)}
            className="glass-input rounded px-3 py-2 text-sm focus:outline-none"
          />
        </div>

        {/* Bucket Select */}
        <div className="flex flex-col gap-2">
          <label htmlFor="bucket" className="text-sm font-medium text-muted">
            Time Bucket
          </label>
          <select
            id="bucket"
            value={filters.bucket}
            onChange={(e) => handleChange('bucket', e.target.value)}
            className="glass-input rounded px-3 py-2 text-sm focus:outline-none"
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
        </div>

        {/* Kind Select */}
        <div className="flex flex-col gap-2">
          <label htmlFor="kind" className="text-sm font-medium text-muted">
            Kind
          </label>
          <select
            id="kind"
            value={filters.kind}
            onChange={(e) => handleChange('kind', e.target.value)}
            className="glass-input rounded px-3 py-2 text-sm focus:outline-none"
          >
            <option value="both">Both</option>
            <option value="income">Income Only</option>
            <option value="expense">Expense Only</option>
          </select>
        </div>
      </div>
    </div>
  );
}
