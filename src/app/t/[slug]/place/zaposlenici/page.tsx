'use client';

import { useParams } from 'next/navigation';

import { EmployeeList } from '@/components/payroll/EmployeeList';

export default function ZaposleniciPage() {
  const params = useParams<{ slug: string }>();
  return <EmployeeList slug={params.slug} />;
}
