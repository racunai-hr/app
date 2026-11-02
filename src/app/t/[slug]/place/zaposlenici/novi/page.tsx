'use client';

import { useParams } from 'next/navigation';

import { EmployeeCreateForm } from '@/components/payroll/EmployeeCreateForm';

export default function NoviZaposlenikPage() {
  const params = useParams<{ slug: string }>();
  return <EmployeeCreateForm slug={params.slug} />;
}
