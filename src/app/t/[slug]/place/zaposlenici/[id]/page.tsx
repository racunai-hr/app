'use client';

import { useParams } from 'next/navigation';

import { EmployeeDetail } from '@/components/payroll/EmployeeDetail';

export default function ZaposlenikDetailPage() {
  const params = useParams<{ slug: string; id: string }>();
  return <EmployeeDetail slug={params.slug} employeeId={Number(params.id)} />;
}
