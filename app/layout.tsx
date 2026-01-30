import './globals.css';

export const metadata = {
  title: 'Wallev',
  description: 'Shared ledger with invites',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <body className="app-shell">
        {children}
      </body>
    </html>
  );
}
