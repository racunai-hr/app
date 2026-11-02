'use client';

import { useParams } from 'next/navigation';

import { PayslipDetail } from '@/components/payroll/PayslipDetail';

export default function PayslipDetailPage() {
  const params = useParams<{ slug: string; id: string }>();
  return <PayslipDetail slug={params.slug} payslipId={Number(params.id)} />;
}
