'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Menu, X, PlayCircle } from 'lucide-react';
import Image from 'next/image';

import { API_SOURCES } from '@/lib/knowledge-base';
import UserMenu from '@/components/pharma/UserMenu';
import AuthModal from '@/components/pharma/AuthModal';
import { useAuth } from '@/lib/auth';

const NAV_ITEMS = [
  { href: '/', label: 'Home' },
  { href: '/interaction', label: 'Interaction' },
  { href: '/pharmacology', label: 'Pharmacology & Phytochemistry' },
  { href: '/phytoinsight', label: 'HerbInsight' },
  { href: '/structure', label: 'Chemical Structure' },
  { href: '/methodology', label: 'Methodology' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
  { href: '/saved', label: 'Saved', authOnly: true },
];

/** Special nav item for How to Use page - styled differently */
const HOW_TO_USE_ITEM = { href: '/how-to-use', label: 'How to Use', icon: true };

export default function Header() {
  const pathname = usePathname();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isAuthenticated } = useAuth();

  const visibleNavItems = NAV_ITEMS.filter((item) => !item.authOnly || isAuthenticated);

  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <header className="bg-white/80 backdrop-blur-xl border-b border-gray-200/60 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 md:px-8 lg:px-12 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group" onClick={closeMobileMenu}>
          <div className="w-12 h-12 rounded-lg overflow-hidden shadow-sm group-hover:shadow-md transition-shadow flex-shrink-0">
            <Image
              src="/pharma-icon.png"
              alt="PhytoInsight"
              width={48}
              height={48}
              className="w-full h-full object-cover"
              priority
            />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-[#0f172a]">PhytoInsight</h1>
            <p className="text-[11px] font-medium text-gray-500 tracking-wide">Evidence-Based Scientific Intelligence Platform</p>
          </div>
        </Link>

        <div className="hidden md:flex items-center gap-1.5">
          {API_SOURCES.map((s) => (
            <div key={s.name} className="flex items-center gap-1.5 px-2.5 py-1 bg-gray-50 border border-gray-100 rounded-full">
              <div className={`w-2 h-2 rounded-full ${s.color}`}></div>
              <span className="text-[10px] font-semibold text-gray-500">{s.name}</span>
            </div>
          ))}
        </div>

        {/* Desktop: UserMenu directly | Mobile: hamburger + UserMenu */}
        <div className="flex items-center gap-2">
          <div className="hidden md:block">
            <UserMenu onSignInClick={() => setAuthModalOpen(true)} />
          </div>
          <button
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? (
              <X size={20} className="text-gray-700" />
            ) : (
              <Menu size={20} className="text-gray-700" />
            )}
          </button>
        </div>
      </div>

      {/* Desktop Navigation */}
      <div className="hidden md:block max-w-6xl mx-auto px-4 md:px-8 lg:px-12 pb-2.5">
        <nav className="flex gap-1" aria-label="Main navigation">
          {visibleNavItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative px-4 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${
                  isActive
                    ? 'text-[#0f172a] bg-gray-100'
                    : 'text-gray-400 hover:text-gray-700 hover:bg-gray-50'
                }`}
                aria-current={isActive ? 'page' : undefined}
              >
                {item.label}
                {isActive && (
                  <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-[#0f172a] rounded-full" />
                )}
              </Link>
            );
          })}
          {/* How to Use - Special styled link */}
          <Link
            href={HOW_TO_USE_ITEM.href}
            className="relative flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 hover:border-amber-300 hover:text-amber-800"
          >
            <PlayCircle size={16} className="text-amber-600" />
            {HOW_TO_USE_ITEM.label}
          </Link>
        </nav>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white">
          <nav className="flex flex-col px-4 py-2" aria-label="Mobile navigation">
            {visibleNavItems.map((item) => {
              const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={closeMobileMenu}
                  className={`px-4 py-3 rounded-lg text-sm font-bold transition-all ${
                    isActive
                      ? 'text-[#0f172a] bg-gray-100'
                      : 'text-gray-400 hover:text-gray-700 hover:bg-gray-50'
                  }`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  {item.label}
                </Link>
              );
            })}
            {/* How to Use - Mobile */}
            <Link
              href={HOW_TO_USE_ITEM.href}
              onClick={closeMobileMenu}
              className="flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-bold transition-all bg-amber-50 text-amber-700 border border-amber-200"
            >
              <PlayCircle size={16} className="text-amber-600" />
              {HOW_TO_USE_ITEM.label}
            </Link>
            <div className="px-4 py-3 border-t border-gray-100 mt-1">
              <UserMenu onSignInClick={() => { setAuthModalOpen(true); closeMobileMenu(); }} />
            </div>
          </nav>
        </div>
      )}

      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </header>
  );
}
