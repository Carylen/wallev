'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import ThemeToggle from '@/components/theme-toggle';

const navItems = [
  { href: '/', label: 'Home' },
  { href: '/ledgers', label: 'Ledgers' },
  { href: '/profile', label: 'Profile' },
];

const isActive = (pathname: string, href: string) => {
  if (href === '/') return pathname === '/';
  return pathname.startsWith(href);
};

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="glass-panel sticky top-6 h-fit rounded-3xl p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-faint">Wallev</p>
          <p className="text-sm font-semibold">Navigation</p>
        </div>
        <ThemeToggle />
      </div>
      <nav className="mt-6 space-y-2 text-sm">
        {navItems.map((item) => {
          const active = isActive(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`block rounded-full px-4 py-2 transition ${
                active ? 'glass-button' : 'glass-button-muted'
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
