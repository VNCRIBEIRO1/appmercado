'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Camera,
  ShoppingBag,
  BarChart3,
  Package,
} from 'lucide-react';

const navItems = [
  { href: '/', label: 'Início', icon: LayoutDashboard },
  { href: '/scan', label: 'Escanear', icon: Camera },
  { href: '/purchases', label: 'Compras', icon: ShoppingBag },
  { href: '/analytics', label: 'Análise', icon: BarChart3 },
  { href: '/consumption', label: 'Consumo', icon: Package },
];

export default function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 safe-area-bottom">
      <div className="max-w-lg mx-auto flex items-center justify-around">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = href === '/' ? pathname === '/' : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center py-2 px-3 min-w-[64px] transition-colors ${
                isActive
                  ? 'text-brand-600'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <Icon className={`w-6 h-6 ${isActive ? 'stroke-[2.5]' : ''}`} />
              <span className={`text-[10px] mt-0.5 ${isActive ? 'font-semibold' : ''}`}>
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
