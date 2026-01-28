import './globals.css';

export const metadata = {
  title: 'Wyckoff + VPA Trading Dashboard',
  description: 'Pure Volume Price Analysis and Wyckoff Trading System',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
