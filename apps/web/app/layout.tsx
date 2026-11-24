import type { ReactNode } from 'react';

export const metadata = {
  title: 'Crossings',
  description: 'Crossings API skeleton. by Vervia.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: 'Georgia, serif', margin: 0, background: '#1b1822', color: '#16130f' }}>
        {children}
      </body>
    </html>
  );
}
