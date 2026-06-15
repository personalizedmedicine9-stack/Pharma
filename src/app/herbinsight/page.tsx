'use client';

import { useState } from 'react';
import PhytoInsightEngine from '@/components/pharma/PhytoInsightEngine';
import AuthModal from '@/components/pharma/AuthModal';
import ScientificDisclaimer from '@/components/pharma/ScientificDisclaimer';
import type { PhytoInsightResponse } from '@/lib/types';

export default function PhytoInsightPage() {
  const [authModalOpen, setAuthModalOpen] = useState(false);

  const handlePhytoInsightSearch = async (herb: string): Promise<PhytoInsightResponse | null> => {
    try {
      const res = await fetch('/api/phytoinsight', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ herb }),
      });
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  };

  return (
    <>
      <div className="min-h-screen bg-[#f8fafc] text-gray-900 antialiased flex flex-col">
        <main className="flex-1 max-w-6xl mx-auto px-4 md:px-8 lg:px-12 py-8 w-full">
          <PhytoInsightEngine onSearch={handlePhytoInsightSearch} onSignInRequired={() => setAuthModalOpen(true)} />
        </main>

        <ScientificDisclaimer />
      </div>

      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </>
  );
}
