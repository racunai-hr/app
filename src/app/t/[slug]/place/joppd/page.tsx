'use client';

import { useParams, useSearchParams } from 'next/navigation';

import { useBankingSession } from '@/components/banking/useBankingSession';
import { JoppdPeriodPicker } from '@/components/payroll/JoppdPeriodPicker';
import { JoppdWorkflow } from '@/components/payroll/JoppdWorkflow';

export default function JoppdPage() {
  const params = useParams<{ slug: string }>();
  const searchParams = useSearchParams();
  const period = searchParams.get('period');

  if (!period) {
    return <JoppdPeriodPicker slug={params.slug} />;
  }

  return <JoppdPeriodWorkflowShell slug={params.slug} period={period} />;
}

function JoppdPeriodWorkflowShell({ slug, period }: { slug: string; period: string }) {
  const { session, loading, error } = useBankingSession(slug);

  if (loading) return <div className="loading">Učitavanje…</div>;
  if (error && !session) return <div className="error">{error}</div>;
  if (!session) return null;

  return (
    <section className="docs-shell">
      <header className="docs-heading">
        <div>
          <h1>JOPPD {period}</h1>
          <p>Izvješće o primicima, porezu na dohodak i doprinosima po osobama, za navedeni period.</p>
        </div>
      </header>
      <JoppdWorkflow
        slug={slug}
        period={period}
        origin={session.origin}
        token={session.token}
        role={session.role}
      />
    </section>
  );
}
