import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Prijava — racunAI',
  description: 'Prijavite se u racunAI SaaS platformu za računovodstvo.',
  icons: {
    icon: '/racunai-logo.png',
    apple: '/racunai-logo.png',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="hr">
      <body>{children}</body>
    </html>
  );
}
