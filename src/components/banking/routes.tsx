'use client';

import { Suspense, type ReactNode } from 'react';
import { useParams } from 'next/navigation';

import { BankAccountList } from '@/components/banking/BankAccountList';
import { BankingOverview } from '@/components/banking/BankingOverview';
import { BankingPage } from '@/components/banking/BankingPage';
import { PaymentOrderList } from '@/components/banking/PaymentOrderList';
import { StatementList } from '@/components/banking/StatementList';
import { TransactionList } from '@/components/banking/TransactionList';

function withSuspense(node: ReactNode) {
  return <Suspense fallback={<div className="loading">Učitavanje…</div>}>{node}</Suspense>;
}

export function BankingOverviewRoute() {
  const params = useParams<{ slug: string }>();
  return (
    <BankingPage
      slug={params.slug}
      title="Bankarstvo"
      description="Pregled računa, salda i stanja usklađivanja. Salda se ne zbrajaju preko različitih valuta."
    >
      {({ origin, token }) => <BankingOverview origin={origin} token={token} />}
    </BankingPage>
  );
}

export function BankingAccountsRoute() {
  const params = useParams<{ slug: string }>();
  return withSuspense(
    <BankingPage
      slug={params.slug}
      title="Računi"
      description="Poslovni bankovni računi s proveniencijom salda (izvor, vrijeme, svježina)."
    >
      {({ origin, token }) => (
        <BankAccountList slug={params.slug} origin={origin} token={token} />
      )}
    </BankingPage>,
  );
}

export function BankingStatementsRoute() {
  const params = useParams<{ slug: string }>();
  return withSuspense(
    <BankingPage
      slug={params.slug}
      title="Izvodi"
      description="Uvezeni bankovni izvodi po računu i razdoblju."
    >
      {({ origin, token, role }) => (
        <StatementList slug={params.slug} origin={origin} token={token} role={role} />
      )}
    </BankingPage>,
  );
}

export function BankingTransactionsRoute() {
  const params = useParams<{ slug: string }>();
  const basePath = `/t/${params.slug}/bankarstvo/transakcije`;
  return withSuspense(
    <BankingPage
      slug={params.slug}
      title="Transakcije"
      description="Stavke bankovnih izvoda s filterima i statusom usklađivanja."
    >
      {({ origin, token }) => (
        <TransactionList slug={params.slug} origin={origin} token={token} basePath={basePath} />
      )}
    </BankingPage>,
  );
}

export function BankingReconciliationRoute() {
  const params = useParams<{ slug: string }>();
  const basePath = `/t/${params.slug}/bankarstvo/uskladivanje`;
  return withSuspense(
    <BankingPage
      slug={params.slug}
      title="Usklađivanje"
      description="Eksplicitno povezivanje bankovnih stavki s otvorenim saldakontom ili kaucijom."
    >
      {({ origin, token }) => (
        <TransactionList slug={params.slug} origin={origin} token={token} basePath={basePath} reconcileMode />
      )}
    </BankingPage>,
  );
}

export function BankingOrdersRoute() {
  const params = useParams<{ slug: string }>();
  return withSuspense(
    <BankingPage
      slug={params.slug}
      title="Platni nalozi"
      description="Read-only pregled PIS naloga. IBAN-i su maskirani; SCA i submit nisu dostupni."
    >
      {({ origin, token }) => (
        <PaymentOrderList slug={params.slug} origin={origin} token={token} />
      )}
    </BankingPage>,
  );
}
